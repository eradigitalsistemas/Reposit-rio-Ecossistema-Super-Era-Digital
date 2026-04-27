import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { phone, message, instance_id, media_url, media_type } = body

    if (!phone || !message || !instance_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone, message, instance_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // UAZAPI Env
    const uazapiUrl = Deno.env.get('UAZAPI_URL')?.replace(/\/$/, '') || ''
    const uazapiToken = Deno.env.get('UAZAPI_TOKEN') || ''

    if (!uazapiUrl || !uazapiToken) {
      return new Response(JSON.stringify({ error: 'UAZAPI configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    // Format remote_jid
    const remoteJid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`

    // Busca/cria contato
    let contactId = null
    const { data: existingContact } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('id')
      .eq('remote_jid', remoteJid)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingContact) {
      contactId = existingContact.id
    } else {
      const { data: newContact, error: createContactErr } = await supabaseAdmin
        .from('whatsapp_contacts')
        .insert({
          user_id: user.id,
          remote_jid: remoteJid,
          instance_id: instance_id,
          push_name: phone,
          phone_number: phone,
        })
        .select('id')
        .single()

      if (createContactErr) throw createContactErr
      contactId = newContact.id
    }

    // Inserção no banco (status pending)
    const correlationId = crypto.randomUUID()
    const msgType = media_url ? media_type || 'media' : 'text'

    const { data: pendingMsg, error: msgErr } = await supabaseAdmin
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        contact_id: contactId,
        from_me: true,
        type: msgType,
        text: message,
        media_url: media_url || null,
        media_type: media_type || null,
        status: 'pending',
        correlation_id: correlationId,
        message_id: correlationId, // Placeholder until UAZAPI returns the real ID
      })
      .select('id')
      .single()

    if (msgErr) throw msgErr

    // Chamada à UAZAPI com Timeout de 30s
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    let uazapiRes
    let uazapiData

    try {
      const isMedia = !!media_url
      const endpoint = isMedia ? `${uazapiUrl}/send/media` : `${uazapiUrl}/send/text`
      const payload = isMedia
        ? { number: phone, type: media_type, file: media_url, text: message }
        : { number: phone, text: message }

      uazapiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          token: uazapiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      uazapiData = await uazapiRes.json().catch(() => ({}))
      clearTimeout(timeoutId)
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)

      if (fetchErr.name === 'AbortError') {
        // Timeout
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Timeout connecting to UAZAPI',
            message_id: pendingMsg.id,
            status: 'pending',
          }),
          {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Update failed
      await supabaseAdmin
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: fetchErr.message,
        })
        .eq('id', pendingMsg.id)

      return new Response(
        JSON.stringify({
          success: false,
          error: fetchErr.message,
          message_id: pendingMsg.id,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (uazapiRes.ok) {
      const messageId =
        uazapiData?.messageId || uazapiData?.id || uazapiData?.key?.id || correlationId

      await supabaseAdmin
        .from('whatsapp_messages')
        .update({
          status: 'sent',
          message_id: messageId,
          uazapi_message_id: messageId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingMsg.id)

      return new Response(
        JSON.stringify({
          success: true,
          message_id: pendingMsg.id,
          uazapi_message_id: messageId,
          status: 'sent',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else {
      const errorMsg = uazapiData?.error || uazapiData?.message || 'Erro desconhecido na UAZAPI'

      await supabaseAdmin
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingMsg.id)

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg,
          uazapi_response: uazapiData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
