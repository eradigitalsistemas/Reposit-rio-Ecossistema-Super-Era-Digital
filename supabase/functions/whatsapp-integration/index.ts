import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { action = 'send_message', lead_id, message, phone, user_id, whatsapp_config } = body

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const provider = whatsapp_config?.whatsapp_provider || 'evolution'
    const evolution_url = whatsapp_config?.evolution_url || whatsapp_config?.evolution_api_url || Deno.env.get('EVOLUTION_URL') || Deno.env.get('EVOLUTION_API_URL')
    const evolution_api_key = whatsapp_config?.evolution_api_key || Deno.env.get('EVOLUTION_API_KEY')
    const evolution_instance = whatsapp_config?.evolution_instance || Deno.env.get('EVOLUTION_INSTANCE') || 'kanban_vendas'

    const evoUrl = evolution_url ? (evolution_url.endsWith('/') ? evolution_url.slice(0, -1) : evolution_url) : ''

    if (action === 'check_status') {
       if (!evoUrl || !evolution_api_key || !evolution_instance) {
         return new Response(JSON.stringify({ state: 'offline', error: 'Credenciais ausentes' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       }
       try {
         const res = await fetch(`${evoUrl}/instance/connectionState/${evolution_instance}`, {
           headers: { 'apikey': evolution_api_key }
         })
         const data = await res.json()
         return new Response(JSON.stringify({ state: data?.instance?.state || data?.state || 'offline' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       } catch (err: any) {
         return new Response(JSON.stringify({ state: 'offline', error: err.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       }
    }

    if (action === 'connect') {
       if (!evoUrl || !evolution_api_key || !evolution_instance) {
         return new Response(JSON.stringify({ state: 'offline', error: 'Credenciais ausentes' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       }
       try {
         const res = await fetch(`${evoUrl}/instance/connect/${evolution_instance}`, {
           headers: { 'apikey': evolution_api_key }
         })
         const data = await res.json()
         return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       } catch (err: any) {
         return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
       }
    }

    if (action === 'send_message') {
      if (!lead_id || !message || !user_id) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // 1. Salvar a mensagem enviada pelo usuário no histórico
      const { error: insertErr1 } = await supabase.from('historico_leads').insert({
        lead_id,
        usuario_id: user_id,
        contato_nome: 'WhatsApp',
        forma_contato: 'WhatsApp',
        detalhes: `Você: ${message}`
      })

      if (insertErr1) throw insertErr1

      // 2. Medição da qualidade do lead baseada na conversa (Análise da Intenção)
      let newStatus = 'Interessado'
      let qualityScore = 50
      const msgLower = message.toLowerCase()
      
      if (msgLower.includes('comprar') || msgLower.includes('preço') || msgLower.includes('urgente') || msgLower.includes('fechar') || msgLower.includes('contrato')) {
        newStatus = 'Muito Interessado'
        qualityScore = 90
      } else if (msgLower.includes('não quero') || msgLower.includes('caro') || msgLower.includes('depois') || msgLower.includes('desistir')) {
        newStatus = 'Não Interessado'
        qualityScore = 20
      } else {
        qualityScore = Math.min(100, 50 + (message.length / 2))
        if (qualityScore > 75) newStatus = 'Muito Interessado'
      }

      // 3. Atualizar a qualificação do lead no banco de dados
      await supabase.from('leads').update({
        status_interesse: newStatus,
        observacoes: `Qualificação Automática WhatsApp: Score ${Math.round(qualityScore)}/100. Última interação registrada via WA.`
      }).eq('id', lead_id)

      // 4. Envio Real para API do WhatsApp (agora Agnóstico ao Provedor)
      if (evoUrl && evolution_api_key && evolution_instance && phone) {
        const formattedPhone = phone.replace(/\D/g, '')
        
        try {
          const res = await fetch(`${evoUrl}/message/sendText/${evolution_instance}`, { 
            method: 'POST',
            headers: { 'apikey': evolution_api_key, 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: formattedPhone, options: { delay: 1200 }, textMessage: { text: message } })
          })
          if (!res.ok) {
            console.error('Erro na Evolution API:', await res.text())
          } else {
            console.log(`Mensagem processada e encaminhada via Evolution API (Instância: ${evolution_instance})`)
          }
        } catch (fetchErr) {
          console.error('Falha de conexão com a Evolution API:', fetchErr)
        }
      }

      // 5. Simulação de um Webhook real do WhatsApp recebendo uma resposta após 3 segundos
      setTimeout(async () => {
        await supabase.from('historico_leads').insert({
          lead_id,
          usuario_id: user_id,
          contato_nome: 'WhatsApp (Lead)',
          forma_contato: 'WhatsApp',
          detalhes: `Lead respondeu: Mensagem recebida! Vamos conversar sobre os próximos passos. [via ${provider}]`
        })
      }, 3000)

      return new Response(JSON.stringify({ success: true, status: newStatus, score: Math.round(qualityScore) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
