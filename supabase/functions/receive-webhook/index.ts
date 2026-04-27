import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let payload: any;

  try {
    try {
      payload = await req.json()
    } catch (e) {
      console.error(JSON.stringify({ error: 'Invalid JSON', context: 'req.json()' }))
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { event, instance: instanceName, data } = payload

    if (typeof event !== 'string' || typeof instanceName !== 'string') {
      console.error(JSON.stringify({ 
        error: 'Missing or invalid fields', 
        context: 'payload validation', 
        payload_summary: { event, instanceName } 
      }))
      return new Response(JSON.stringify({ error: 'Missing required fields: event and instance must be strings' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(JSON.stringify({ event, instance: instanceName, timestamp: new Date().toISOString() }))

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: insertEvtErr } = await supabaseAdmin.from('whatsapp_events').insert({
      instance_name: instanceName,
      event_type: event,
      payload: payload
    })
    
    if (insertEvtErr) {
      console.error(JSON.stringify({ error: insertEvtErr.message, context: 'insert whatsapp_events', payload_summary: { event, instanceName } }))
    } else {
      console.log(JSON.stringify({ action: 'insert', table: 'whatsapp_events', status: 'success' }))
    }

    const { data: instanceRecord } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('user_id, instance_id')
      .eq('instance_name', instanceName)
      .maybeSingle()

    if (!instanceRecord) {
      console.warn(JSON.stringify({ error: 'Instância não cadastrada', context: 'instance validation', payload_summary: { instanceName } }))
      return new Response(JSON.stringify({ success: true, warning: 'Instância não cadastrada' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = instanceRecord.user_id
    const instanceId = instanceRecord.instance_id

    if (!data) {
      return new Response(JSON.stringify({ success: true, ignored: true, reason: 'No data payload' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (event === 'messages') {
      const messages = Array.isArray(data) ? data : [data]

      for (const msg of messages) {
        try {
          const key = msg.key || {}
          const remoteJid = key.remoteJid
          const fromMe = key.fromMe || false
          const messageId = key.id

          if (!remoteJid || !messageId) continue

          if (remoteJid.includes('@g.us')) continue

          let contactId = null
          const contactQuery = supabaseAdmin
            .from('whatsapp_contacts')
            .select('id')
            .eq('remote_jid', remoteJid)
          
          if (userId) {
            contactQuery.eq('user_id', userId)
          } else {
            contactQuery.is('user_id', null)
          }

          const { data: existingContact } = await contactQuery.maybeSingle()

          if (existingContact) {
            contactId = existingContact.id
          } else {
            const { data: newContact } = await supabaseAdmin
              .from('whatsapp_contacts')
              .insert({
                user_id: userId,
                remote_jid: remoteJid,
                instance_id: instanceId,
                push_name: msg.pushName || null,
              })
              .select('id')
              .single()
            if (newContact) {
              contactId = newContact.id
              console.log(JSON.stringify({ action: 'insert', table: 'whatsapp_contacts', status: 'success' }))
            }
          }

          if (!contactId) continue

          const messageContent = msg.message || {}
          let text = ''
          let type = 'text'
          let mediaUrl = null

          if (messageContent.conversation) {
            text = messageContent.conversation
          } else if (messageContent.extendedTextMessage?.text) {
            text = messageContent.extendedTextMessage.text
          } else if (messageContent.imageMessage) {
            type = 'image'
            text = messageContent.imageMessage.caption || ''
            mediaUrl = messageContent.imageMessage.url
          } else if (messageContent.videoMessage) {
            type = 'video'
            text = messageContent.videoMessage.caption || ''
            mediaUrl = messageContent.videoMessage.url
          } else if (messageContent.audioMessage) {
            type = 'audio'
          } else if (messageContent.documentMessage) {
            type = 'document'
            text = messageContent.documentMessage.fileName || ''
          }

          const timestamp = msg.messageTimestamp 
            ? new Date(msg.messageTimestamp * 1000).toISOString()
            : new Date().toISOString()

          const status = fromMe ? 'sent' : 'read'

          const msgToUpsert = {
            user_id: userId,
            contact_id: contactId,
            message_id: messageId,
            from_me: fromMe,
            type: type,
            text: text,
            media_url: mediaUrl,
            status: status,
            timestamp: timestamp,
            raw: msg,
            updated_at: new Date().toISOString()
          }

          const { error: upsertErr } = await supabaseAdmin
            .from('whatsapp_messages')
            .upsert(msgToUpsert, { onConflict: 'user_id, message_id' })
          
          if (upsertErr) {
             console.error(JSON.stringify({ error: upsertErr.message, context: 'upsert whatsapp_messages', payload_summary: { messageId } }))
          } else {
             console.log(JSON.stringify({ action: 'upsert', table: 'whatsapp_messages', status: 'success' }))
          }

          await supabaseAdmin.from('whatsapp_contacts').update({
            last_message_at: timestamp,
            updated_at: new Date().toISOString()
          }).eq('id', contactId)

        } catch (msgErr: any) {
          console.error(JSON.stringify({ error: msgErr.message, context: 'process message', payload_summary: { msg_id: msg.key?.id } }))
        }
      }

    } else if (event === 'messages_update') {
      const updates = Array.isArray(data) ? data : [data]

      for (const update of updates) {
        try {
          const key = update.key || {}
          const messageId = key.id
          const updateStatus = update.update?.status

          if (!messageId || !updateStatus) continue

          let newStatus = 'sent'
          let isRead = false
          if (updateStatus === 'DELIVERY_ACK') newStatus = 'sent'
          else if (updateStatus === 'READ') {
            newStatus = 'read'
            isRead = true
          } else if (updateStatus === 'SERVER_ACK') newStatus = 'sent'

          const updateQuery = supabaseAdmin.from('whatsapp_messages').update({
            status: newStatus,
            is_read: isRead,
            updated_at: new Date().toISOString()
          }).eq('message_id', messageId)

          if (userId) {
            updateQuery.eq('user_id', userId)
          }

          const { error: updErr } = await updateQuery
          
          if (updErr) {
            console.error(JSON.stringify({ error: updErr.message, context: 'update whatsapp_messages', payload_summary: { messageId } }))
          } else {
            console.log(JSON.stringify({ action: 'update', table: 'whatsapp_messages', status: 'success' }))
          }

        } catch (updErr: any) {
          console.error(JSON.stringify({ error: updErr.message, context: 'process messages_update' }))
        }
      }

    } else if (event === 'presence') {
      try {
        const remoteJid = data.id
        const presence = data.presence

        if (remoteJid) {
          const isOnline = presence === 'available' || presence === 'composing'
          const presQuery = supabaseAdmin.from('whatsapp_contacts').update({
            is_online: isOnline,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('remote_jid', remoteJid)

          if (userId) {
            presQuery.eq('user_id', userId)
          }

          const { error: presErr } = await presQuery
          
          if (presErr) {
            console.error(JSON.stringify({ error: presErr.message, context: 'update whatsapp_contacts presence', payload_summary: { remoteJid } }))
          } else {
            console.log(JSON.stringify({ action: 'update', table: 'whatsapp_contacts', status: 'success' }))
          }
        }
      } catch (presErr: any) {
        console.error(JSON.stringify({ error: presErr.message, context: 'process presence' }))
      }

    } else if (event === 'connection') {
      try {
        const status = data.state
        let dbStatus = 'disconnected'
        if (status === 'open') dbStatus = 'connected'
        else if (status === 'connecting') dbStatus = 'qr_waiting'

        const { error: connErr } = await supabaseAdmin.from('whatsapp_instances').update({
          status: dbStatus,
          updated_at: new Date().toISOString()
        }).eq('instance_name', instanceName)

        if (connErr) {
          console.error(JSON.stringify({ error: connErr.message, context: 'update whatsapp_instances connection', payload_summary: { instanceName } }))
        } else {
          console.log(JSON.stringify({ action: 'update', table: 'whatsapp_instances', status: 'success' }))
        }
      } catch (connErr: any) {
        console.error(JSON.stringify({ error: connErr.message, context: 'process connection' }))
      }
    }

    return new Response(JSON.stringify({ success: true, processed: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error(JSON.stringify({ 
      error: error.message, 
      context: 'Fatal Error', 
      payload_summary: payload ? { event: payload?.event, instance: payload?.instance } : null 
    }))
    return new Response(JSON.stringify({ success: false, error: 'Internal error logged' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
