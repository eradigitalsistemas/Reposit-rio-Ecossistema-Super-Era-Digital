import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

serve(async (req) => {
  try {
    const payload = await req.json()
    const { event, instance, data } = payload

    // Log para monitoramento
    console.log(`Recebido evento: ${event} para ${instance}`)

    // Roteamento inteligente
    if (event === 'messages' || event === 'messages.upsert') {
      await supabase.from('whatsapp_messages').upsert({
        messageid: data.key.id,
        chatid: data.key.remoteJid,
        text: data.message?.conversation || data.message?.extendedTextMessage?.text || '',
        from_me: data.key.fromMe,
        instance_name: instance
      })
    } else if (event === 'connection') {
      await supabase.from('whatsapp_instances')
        .update({ status: data.connection.status })
        .eq('id', instance)
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})