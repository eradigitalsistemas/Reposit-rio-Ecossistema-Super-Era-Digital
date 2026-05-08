import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const VERSION = 'v13-multi-auth-2026-05-08'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  const createJsonResponse = (body: any, status: number, headers: Record<string, string>) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return createJsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createJsonResponse(
        { success: false, error: 'Authorization header required' },
        401,
        corsHeaders,
      )
    }

    const token = authHeader.slice(7)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ===== AUTH (multi-modo) =====
    // Modo 1: getUser  -> userId = user.id
    // Modo 2: JWT authenticated -> userId = sub
    // Modo 3: JWT service_role  -> userId = body.user_id (validado abaixo)
    let userId: string | null = null
    let authPath = 'unknown'
    let tokenRole: string | null = null

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (user && !authError) {
      userId = user.id
      authPath = 'getUser'
    } else {
      // Decode manual (verify_jwt=true ja validou assinatura)
      let payload: any
      try {
        const parts = token.split('.')
        if (parts.length !== 3) throw new Error('malformed JWT')
        payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      } catch (decodeErr: any) {
        console.error(
          JSON.stringify({
            stage: 'auth_failed',
            reason: 'decode_error',
            getUserError: authError?.message ?? null,
            decodeError: decodeErr.message,
          }),
        )
        return createJsonResponse(
          { success: false, error: 'Invalid token', details: 'JWT decode failed' },
          401,
          corsHeaders,
        )
      }

      tokenRole = payload.role ?? null
      const sub = payload.sub

      if (tokenRole === 'authenticated' && typeof sub === 'string' && UUID_RE.test(sub)) {
        userId = sub
        authPath = 'jwt-authenticated'
      } else if (tokenRole === 'service_role') {
        // userId vira do body abaixo
        authPath = 'service_role'
      } else {
        console.error(
          JSON.stringify({
            stage: 'auth_failed',
            reason: 'unsupported_role',
            tokenRole,
            hasSub: !!sub,
          }),
        )
        return createJsonResponse(
          {
            success: false,
            error: 'Invalid token',
            details: `Unsupported role: ${tokenRole ?? 'unknown'}`,
          },
          401,
          corsHeaders,
        )
      }
    }

    // ===== BODY =====
    let body
    try {
      body = await req.json()
    } catch {
      return createJsonResponse({ success: false, error: 'Invalid JSON body' }, 400, corsHeaders)
    }

    const { instance_id, phone, message } = body
    if (!instance_id || !phone || !message) {
      return createJsonResponse(
        { success: false, error: 'Missing required fields: instance_id, phone, message' },
        400,
        corsHeaders,
      )
    }

    if (typeof message !== 'string' || message.length > 4096) {
      return createJsonResponse(
        { success: false, error: 'Message too long or invalid' },
        400,
        corsHeaders,
      )
    }

    // service_role exige user_id explicito no body
    if (authPath === 'service_role') {
      const bodyUserId = body.user_id
      if (typeof bodyUserId !== 'string' || !UUID_RE.test(bodyUserId)) {
        console.error(
          JSON.stringify({
            stage: 'auth_failed',
            reason: 'service_role_missing_user_id',
            hasUserIdField: 'user_id' in body,
          }),
        )
        return createJsonResponse(
          {
            success: false,
            error: 'Missing user_id',
            details: 'service_role calls must include user_id (UUID) in body',
          },
          400,
          corsHeaders,
        )
      }
      userId = bodyUserId
    }

    if (!userId) {
      // Defensivo, nao deveria ocorrer
      return createJsonResponse(
        { success: false, error: 'Auth resolution failed' },
        500,
        corsHeaders,
      )
    }

    console.log(
      JSON.stringify({
        stage: 'auth_validated',
        user_id: userId,
        auth_path: authPath,
        token_role: tokenRole,
        version: VERSION,
      }),
    )

    // ===== INSTANCE =====
    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('instance_id', instance_id)
      .single()

    if (instanceError || !instance) {
      return createJsonResponse({ success: false, error: 'Instance not found' }, 404, corsHeaders)
    }

    console.log(JSON.stringify({ stage: 'instance_found', instance_id: instance.instance_id }))

    if (instance.status !== 'connected') {
      return createJsonResponse(
        { success: false, error: `Instance not connected. Status: ${instance.status}` },
        400,
        corsHeaders,
      )
    }

    const cleanedPhone = phone.replace(/[^0-9]/g, '')
    const remoteJid = `${cleanedPhone}@s.whatsapp.net`

    // ===== CONTACT =====
    const { data: existingContact, error: contactQueryError } = await supabase
      .from('whatsapp_contacts')
      .select('id')
      .eq('remote_jid', remoteJid)
      .eq('instance_id', instance.instance_id)
      .maybeSingle()

    if (contactQueryError) {
      return createJsonResponse({ success: false, error: 'Contact query failed' }, 500, corsHeaders)
    }

    let contactId: string
    if (existingContact) {
      contactId = existingContact.id
    } else {
      const { data: newContact, error: insertContactError } = await supabase
        .from('whatsapp_contacts')
        .insert({
          user_id: userId,
          instance_id: instance.instance_id,
          remote_jid: remoteJid,
          phone_number: cleanedPhone,
          is_group: false,
        })
        .select('id')
        .single()

      if (insertContactError || !newContact) {
        return createJsonResponse(
          {
            success: false,
            error: 'Failed to create contact',
            details: insertContactError?.message,
          },
          500,
          corsHeaders,
        )
      }

      contactId = newContact.id
    }

    console.log(JSON.stringify({ stage: 'contact_resolved', contact_id: contactId }))

    // ===== INSERT MESSAGE =====
    const correlationId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    const { data: inserted, error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: correlationId,
        correlation_id: correlationId,
        instance_id: instance.instance_id,
        contact_id: contactId,
        user_id: userId,
        from_me: true,
        type: 'text',
        text: message,
        status: 'pending',
        timestamp,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      return createJsonResponse(
        { success: false, error: 'Failed to insert message', details: insertError?.message },
        500,
        corsHeaders,
      )
    }

    console.log(JSON.stringify({ stage: 'message_inserted', message_id: inserted.id }))

    // ===== UAZAPI CALL =====
    let baseUrl = (instance.config as any)?.base_url || Deno.env.get('UAZAPI_URL')
    if (!baseUrl) {
      return createJsonResponse(
        { success: false, error: 'No base URL configured' },
        500,
        corsHeaders,
      )
    }

    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }

    const uazapiUrl = `${baseUrl}/send/text`
    console.log(JSON.stringify({ stage: 'uazapi_call', url: uazapiUrl, phone: cleanedPhone }))

    let uazapiResponse: Response
    try {
      uazapiResponse = await fetch(uazapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: instance.instance_id,
        },
        body: JSON.stringify({ number: cleanedPhone, text: message }),
      })
    } catch (err: any) {
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'failed', error_message: err.message || 'Network error' })
        .eq('id', inserted.id)

      return createJsonResponse(
        { success: false, error: 'uazapi error', details: err.message || 'Network error' },
        502,
        corsHeaders,
      )
    }

    const uazapiStatus = uazapiResponse.status
    const ok = uazapiResponse.ok
    console.log(JSON.stringify({ stage: 'uazapi_response', status: uazapiStatus, ok }))

    let uazapiData: any
    try {
      uazapiData = await uazapiResponse.json()
    } catch {
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'failed', error_message: `HTTP ${uazapiStatus}` })
        .eq('id', inserted.id)

      return createJsonResponse(
        { success: false, error: 'uazapi error', details: `HTTP ${uazapiStatus}` },
        502,
        corsHeaders,
      )
    }

    if (!ok) {
      const errorMsg = uazapiData?.error || uazapiData?.message || `HTTP ${uazapiStatus}`
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'failed', error_message: errorMsg })
        .eq('id', inserted.id)

      return createJsonResponse(
        { success: false, error: 'uazapi error', details: errorMsg },
        502,
        corsHeaders,
      )
    }

    let uazapiMessageId: string | null = null
    if (uazapiData.id) {
      uazapiMessageId = uazapiData.id
    } else if (uazapiData.messageid) {
      uazapiMessageId = uazapiData.messageid
    } else if (uazapiData.key?.id) {
      uazapiMessageId = uazapiData.key.id
    }

    await supabase
      .from('whatsapp_messages')
      .update({ status: 'sent', uazapi_message_id: uazapiMessageId })
      .eq('id', inserted.id)

    console.log(JSON.stringify({ stage: 'sent', uazapi_message_id: uazapiMessageId }))

    return createJsonResponse(
      {
        success: true,
        message_id: inserted.id,
        uazapi_message_id: uazapiMessageId,
        status: 'sent',
      },
      200,
      corsHeaders,
    )
  } catch (err: any) {
    console.error(err)
    return createJsonResponse(
      { success: false, error: 'Internal server error', details: err.message },
      500,
      corsHeaders,
    )
  }
})
