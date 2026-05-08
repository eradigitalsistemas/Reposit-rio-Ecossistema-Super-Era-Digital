import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const VERSION = 'v1-media-2026-05-08'

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  const createJsonResponse = (body: any, status: number) => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return createJsonResponse({ success: false, error: 'Method not allowed' }, 405)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createJsonResponse({ success: false, error: 'Authorization header required' }, 401)
    }

    const token = authHeader.slice(7)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let userId: string | null = null
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    let payload: any

    if (user && !authError) {
      userId = user.id
    } else {
      try {
        const parts = token.split('.')
        payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      } catch (decodeErr) {
        return createJsonResponse({ success: false, error: 'Invalid token' }, 401)
      }

      if (payload?.role === 'authenticated' && typeof payload?.sub === 'string') {
        userId = payload.sub
      } else if (payload?.role === 'service_role') {
        // ok, userId will come from formData
      } else {
        return createJsonResponse({ success: false, error: 'Invalid token role' }, 401)
      }
    }

    const formData = await req.formData()
    const instance_id = formData.get('instance_id') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string || ''
    const bodyUserId = formData.get('user_id') as string
    const file = formData.get('file') as File

    if (payload?.role === 'service_role') {
      if (!bodyUserId) return createJsonResponse({ success: false, error: 'Missing user_id' }, 400)
      userId = bodyUserId
    }

    if (!instance_id || !phone || !file || !userId) {
      return createJsonResponse({ success: false, error: 'Missing required fields' }, 400)
    }

    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('anexos').upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

    if (uploadError) {
      return createJsonResponse({ success: false, error: 'Failed to upload media', details: uploadError.message }, 500)
    }

    const { data: publicUrlData } = supabase.storage.from('anexos').getPublicUrl(fileName)
    const mediaUrl = publicUrlData.publicUrl

    const { data: instance } = await supabase.from('whatsapp_instances').select('*').eq('instance_id', instance_id).single()
    if (!instance) return createJsonResponse({ success: false, error: 'Instance not found' }, 404)

    const cleanedPhone = phone.replace(/[^0-9]/g, '')
    const remoteJid = `${cleanedPhone}@s.whatsapp.net`

    const { data: existingContact } = await supabase.from('whatsapp_contacts').select('id').eq('remote_jid', remoteJid).eq('instance_id', instance.instance_id).maybeSingle()
    let contactId = existingContact?.id

    if (!contactId) {
      const { data: newContact } = await supabase.from('whatsapp_contacts').insert({
        user_id: userId,
        instance_id: instance.instance_id,
        remote_jid: remoteJid,
        phone_number: cleanedPhone,
        is_group: false,
      }).select('id').single()
      if (newContact) contactId = newContact.id
    }

    let mediaType = 'document'
    let endpoint = 'document'
    
    if (file.type.startsWith('image/')) {
      mediaType = 'image'
      endpoint = 'image'
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video'
      endpoint = 'video'
    } else if (file.type.startsWith('audio/') || file.name.endsWith('.ogg')) {
      mediaType = 'audio'
      endpoint = 'audio'
    }

    const correlationId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    const { data: inserted } = await supabase.from('whatsapp_messages').insert({
      message_id: correlationId,
      correlation_id: correlationId,
      instance_id: instance.instance_id,
      contact_id: contactId,
      user_id: userId,
      from_me: true,
      type: mediaType,
      text: message || null,
      media_url: mediaUrl,
      media_type: file.type,
      status: 'pending',
      timestamp,
    }).select('id').single()

    let baseUrl = (instance.config as any)?.base_url || Deno.env.get('UAZAPI_URL') || 'https://eradigital.uazapi.com'
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1)

    const uazapiUrl = `${baseUrl}/send/${endpoint}`

    const uazapiPayload: any = {
      phone: cleanedPhone,
      url: mediaUrl,
    }
    if (message) {
      uazapiPayload.caption = message
    }
    if (mediaType === 'document') {
      uazapiPayload.fileName = file.name
    }

    let uazapiResponse: Response
    try {
      uazapiResponse = await fetch(uazapiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': instance.instance_id,
        },
        body: JSON.stringify(uazapiPayload),
      })
    } catch (err: any) {
      await supabase.from('whatsapp_messages').update({ status: 'failed', error_message: err.message }).eq('id', inserted!.id)
      return createJsonResponse({ success: false, error: 'uazapi error', details: err.message }, 502)
    }

    const ok = uazapiResponse.ok
    const uazapiData = await uazapiResponse.json().catch(() => ({}))

    if (!ok) {
      const errorMsg = uazapiData?.error || uazapiData?.message || `HTTP ${uazapiResponse.status}`
      await supabase.from('whatsapp_messages').update({ status: 'failed', error_message: errorMsg }).eq('id', inserted!.id)
      return createJsonResponse({ success: false, error: 'uazapi error', details: errorMsg }, 502)
    }

    let uazapiMessageId = uazapiData.id || uazapiData.messageid || uazapiData.key?.id
    await supabase.from('whatsapp_messages').update({ status: 'sent', uazapi_message_id: uazapiMessageId }).eq('id', inserted!.id)

    return createJsonResponse({ success: true, message_id: inserted!.id, uazapi_message_id: uazapiMessageId, status: 'sent' }, 200)
  } catch (err: any) {
    return createJsonResponse({ success: false, error: 'Internal server error', details: err.message }, 500)
  }
})
