import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { event_type, instance_id, data, contact_id } = payload

  try {
    if (event_type === 'messages_update') {
      const { Type, MessageIDs, IsFromMe, Timestamp } = data || {}
      if (IsFromMe && MessageIDs && Array.isArray(MessageIDs)) {
        const now = new Date().toISOString()
        let updateData: any = { updated_at: now }

        if (Type === 'Delivered') {
          updateData.status = 'delivered'
          updateData.delivered_at = now
        } else if (Type === 'Read') {
          updateData.status = 'read'
          updateData.read_at = now
          updateData.is_read = true
        } else {
          return new Response('OK', { status: 200, headers: corsHeaders })
        }

        for (const msgId of MessageIDs) {
          await supabase
            .from('whatsapp_messages')
            .update(updateData)
            .ilike('uazapi_message_id', `%${msgId}`)
        }
      }
    } else if (event_type === 'message') {
      const messageData = {
        message_id: data?.key?.remoteJid || data?.id || null,
        correlation_id: data?.message?.extendedTextMessage?.contextInfo?.stanzaId || null,
        instance_id,
        contact_id: contact_id || (data?.from ? data.from.split('@')[0] : null),
        user_id: null,
        from_me: !!data?.fromMe,
        type: data?.type || 'unknown',
        text: data?.body || data?.text || data?.message?.conversation || null,
        status: 'received',
        is_read: false,
        uazapi_message_id: data?.id || data?.key?.id || null,
        timestamp:
          data?.timestamp || data?.messageTimestamp
            ? new Date((data.timestamp || data.messageTimestamp) * 1000).toISOString()
            : null,
        delivered_at: null,
        read_at: null,
        updated_at: new Date().toISOString(),
      }
      await supabase.from('whatsapp_messages').insert(messageData)
    } else {
      await supabase.from('whatsapp_events').insert({
        event_type,
        instance_id,
        contact_id: contact_id || null,
        payload,
      })
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}
