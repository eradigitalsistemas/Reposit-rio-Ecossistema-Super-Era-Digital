import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    const body = await req.json().catch(() => ({}))
    const { instance_id, remote_jid, message_ids } = body

    if (!instance_id || !remote_jid) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: instance_id, remote_jid' }),
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

    // Busca contato
    const { data: contact } = await supabaseAdmin
      .from('whatsapp_contacts')
      .select('id')
      .eq('remote_jid', remote_jid)
      .eq('instance_id', instance_id)
      .maybeSingle()

    if (!contact) {
      return new Response(JSON.stringify({ error: 'Contact not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let endpoint = ''
    let payload = {}

    if (Array.isArray(message_ids) && message_ids.length > 0) {
      endpoint = `${uazapiUrl}/message/markread`
      payload = { number: remote_jid, messageIds: message_ids }
    } else {
      endpoint = `${uazapiUrl}/chat/read`
      payload = { number: remote_jid }
    }

    let uazapiRes
    let uazapiData

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

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

      if (!uazapiRes.ok) {
        throw new Error(uazapiData?.error || uazapiData?.message || 'UAZAPI returned error')
      }
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Failed to connect to UAZAPI' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Atualização local
    let updateQuery = supabaseAdmin
      .from('whatsapp_messages')
      .update({
        is_read: true,
        status: 'read',
        updated_at: new Date().toISOString(),
      })
      .eq('contact_id', contact.id)
      .eq('from_me', false)

    if (Array.isArray(message_ids) && message_ids.length > 0) {
      updateQuery = updateQuery.in('message_id', message_ids)
    } else {
      updateQuery = updateQuery.eq('is_read', false)
    }

    const { data: updatedMessages, error: updateError } = await updateQuery.select('id')

    if (updateError) {
      console.error('Error updating local messages:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages_marked: updatedMessages?.length || 0,
        uazapi_response: uazapiData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
