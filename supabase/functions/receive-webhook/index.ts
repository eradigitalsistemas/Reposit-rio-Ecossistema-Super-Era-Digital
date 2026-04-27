import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  const reqSecret = req.headers.get('x-webhook-secret')

  if (webhookSecret && reqSecret !== webhookSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()
    const { event, instance: instanceName, data } = payload

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    await supabaseAdmin.from('whatsapp_events').insert({
      instance_name: instanceName || 'unknown',
      event_type: event || 'unknown',
      payload: payload,
    })

    if (!instanceName || !event || !data) {
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: 'Invalid payload' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: instanceRecord } = await supabaseAdmin
      .from('whatsapp_instances')
      .select('user_id, instance_id')
      .eq('instance_name', instanceName)
      .maybeSingle()

    const userId = instanceRecord?.user_id
    const instanceId = instanceRecord?.instance_id

    if (event === 'messages') {
      const messages = Array.isArray(data) ? data : [data]

      for (const msg of messages) {
        try {
          const key = msg.key || {}
          const remoteJid = key.remoteJid
          const fromMe = key.fromMe || false
          const messageId = key.id

          if (!remoteJid || !messageId) continue

          if (fromMe && msg.wasSentByApi) continue
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
            if (newContact) contactId = newContact.id
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
            updated_at: new Date().toISOString(),
          }

          const { error: upsertErr } = await supabaseAdmin
            .from('whatsapp_messages')
            .upsert(msgToUpsert, { onConflict: 'user_id, message_id' })

          if (upsertErr) {
            console.error('[receive-webhook] Error upserting message:', upsertErr)
          }

          await supabaseAdmin
            .from('whatsapp_contacts')
            .update({
              last_message_at: timestamp,
              updated_at: new Date().toISOString(),
            })
            .eq('id', contactId)
        } catch (msgErr) {
          console.error('[receive-webhook] Error processing message:', msgErr)
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

          const updateQuery = supabaseAdmin
            .from('whatsapp_messages')
            .update({
              status: newStatus,
              is_read: isRead,
              updated_at: new Date().toISOString(),
            })
            .eq('message_id', messageId)

          if (userId) {
            updateQuery.eq('user_id', userId)
          }

          await updateQuery
        } catch (updErr) {
          console.error('[receive-webhook] Error processing message update:', updErr)
        }
      }
    } else if (event === 'presence') {
      try {
        const remoteJid = data.id
        const presence = data.presence

        if (remoteJid) {
          const isOnline = presence === 'available' || presence === 'composing'
          const presQuery = supabaseAdmin
            .from('whatsapp_contacts')
            .update({
              is_online: isOnline,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('remote_jid', remoteJid)

          if (userId) {
            presQuery.eq('user_id', userId)
          }

          await presQuery
        }
      } catch (presErr) {
        console.error('[receive-webhook] Error processing presence:', presErr)
      }
    } else if (event === 'connection') {
      try {
        const status = data.state
        let dbStatus = 'disconnected'
        if (status === 'open') dbStatus = 'connected'
        else if (status === 'connecting') dbStatus = 'qr_waiting'

        await supabaseAdmin
          .from('whatsapp_instances')
          .update({
            status: dbStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('instance_name', instanceName)
      } catch (connErr) {
        console.error('[receive-webhook] Error processing connection:', connErr)
      }
    }

    return new Response(JSON.stringify({ success: true, processed: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[receive-webhook] Fatal Error:', error.message)
    return new Response(JSON.stringify({ success: false, error: 'Internal error logged' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
