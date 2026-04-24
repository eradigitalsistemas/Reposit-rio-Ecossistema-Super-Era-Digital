import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { instanceName, chatid } = await req.json()
    const uazUrl = (Deno.env.get('UAZAPI_URL') || '').replace(/\/$/, '')
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''

    // Busca o histórico na UAZAPI
    const res = await fetch(`${uazUrl}/chat/findMessages/${instanceName}`, {
      method: 'POST',
      headers: { 'admintoken': uazAdminToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatid: chatid })
    })

    if (!res.ok) throw new Error('Falha ao buscar histórico na UAZAPI')

    const messages = await res.json()

    // Processa e salva no Supabase (usando Upsert para evitar duplicatas)
    if (Array.isArray(messages)) {
      const records = messages.map(m => ({
        messageid: m.key.id,
        chatid: chatid,
        text: m.message?.conversation || m.message?.extendedTextMessage?.text || '',
        from_me: m.key.fromMe,
        timestamp: m.messageTimestamp,
        instance_name: instanceName
      }))

      await supabase.from('whatsapp_messages').upsert(records, { onConflict: 'messageid' })
      
      return new Response(JSON.stringify({ success: true, count: records.length }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    return new Response(JSON.stringify({ success: true, count: 0 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})