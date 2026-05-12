import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const payload = await req.json()
    const { event, instance, data } = payload

    console.log(`Recebido evento: ${event} para ${instance}`)

    // Se houver receive-webhook v28 rodando, repassamos a bola pra ele garantir a consistência
    const receiveUrl = `${supabaseUrl}/functions/v1/receive-webhook`
    fetch(receiveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error)

    if (event === 'messages.update' || event === 'messages_update') {
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const msgId = item?.key?.id || item?.id
        const statusNum = item?.update?.status || item?.status
        if (msgId && statusNum) {
          let status = 'sent'
          if (statusNum === 2) status = 'delivered'
          if (statusNum === 3) status = 'read'
          if (statusNum === 4) status = 'played'
          if (statusNum === 5) status = 'failed'

          const upd: any = { status, updated_at: new Date().toISOString() }
          if (status === 'delivered') upd.delivered_at = new Date().toISOString()
          if (status === 'read' || status === 'played') {
            upd.is_read = true
            upd.read_at = new Date().toISOString()
            upd.delivered_at = new Date().toISOString() // Read implica entregue
          }

          await supabase
            .from('whatsapp_messages')
            .update(upd)
            .or(`message_id.eq.${msgId},uazapi_message_id.eq.${msgId}`)
        }
      }
    } else if (event === 'connection') {
      await supabase
        .from('whatsapp_instances')
        .update({ status: data?.connection?.status || data?.state || 'disconnected' })
        .eq('instance_id', instance)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
