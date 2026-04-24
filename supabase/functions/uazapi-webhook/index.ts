import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()

    const eventType = body.event || body.event_type

    if (eventType === 'messages.upsert' || eventType === 'message') {
      const msg = body.data?.message || body.message || body.data

      if (msg.key?.fromMe || msg.fromMe) {
        return new Response('ok', { status: 200 })
      }

      const remoteJid = msg.key?.remoteJid || msg.remoteJid
      if (!remoteJid || remoteJid.includes('@g.us')) {
        return new Response('ok', { status: 200 })
      }

      const phone = remoteJid.split('@')[0]
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.text ||
        'Mensagem recebida'

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      const phoneDigits = phone.substring(2)

      const { data: leads } = await supabase
        .from('leads')
        .select('id, usuario_id')
        .ilike('telefone', `%${phoneDigits}%`)
        .limit(1)

      if (leads && leads.length > 0) {
        const lead = leads[0]

        await supabase.from('historico_leads').insert({
          lead_id: lead.id,
          usuario_id: lead.usuario_id,
          contato_nome: 'WhatsApp (Lead)',
          forma_contato: 'WhatsApp',
          detalhes: `Lead respondeu: ${text}`,
        })
      }
    }

    return new Response('ok', { status: 200, headers: corsHeaders })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return new Response('error', { status: 500, headers: corsHeaders })
  }
})
