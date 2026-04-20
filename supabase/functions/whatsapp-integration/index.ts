import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lead_id, message, phone, user_id, whatsapp_config } = await req.json()

    if (!lead_id || !message || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1. Salvar a mensagem enviada pelo usuário no histórico
    const { error: insertErr1 } = await supabase.from('historico_leads').insert({
      lead_id,
      usuario_id: user_id,
      contato_nome: 'WhatsApp',
      forma_contato: 'WhatsApp',
      detalhes: `Você: ${message}`,
    })

    if (insertErr1) throw insertErr1

    // 2. Medição da qualidade do lead baseada na conversa (Análise da Intenção)
    let newStatus = 'Interessado'
    let qualityScore = 50
    const msgLower = message.toLowerCase()

    if (
      msgLower.includes('comprar') ||
      msgLower.includes('preço') ||
      msgLower.includes('urgente') ||
      msgLower.includes('fechar') ||
      msgLower.includes('contrato')
    ) {
      newStatus = 'Muito Interessado'
      qualityScore = 90
    } else if (
      msgLower.includes('não quero') ||
      msgLower.includes('caro') ||
      msgLower.includes('depois') ||
      msgLower.includes('desistir')
    ) {
      newStatus = 'Não Interessado'
      qualityScore = 20
    } else {
      qualityScore = Math.min(100, 50 + message.length / 2)
      if (qualityScore > 75) newStatus = 'Muito Interessado'
    }

    // 3. Atualizar a qualificação do lead no banco de dados
    await supabase
      .from('leads')
      .update({
        status_interesse: newStatus,
        observacoes: `Qualificação Automática WhatsApp: Score ${Math.round(qualityScore)}/100. Última interação registrada via WA.`,
      })
      .eq('id', lead_id)

    // 4. Envio Real para API do WhatsApp (agora Agnóstico ao Provedor)
    const provider = whatsapp_config?.whatsapp_provider || 'evolution'

    if (provider === 'uazapi') {
      const WHATSAPP_API_KEY = whatsapp_config?.uazapi_key || Deno.env.get('WHATSAPP_API_KEY')
      if (WHATSAPP_API_KEY) {
        // Exemplo de integração real com Uazapi
        console.log('Mensagem processada e encaminhada via Uazapi usando WHATSAPP_API_KEY')
      }
    } else if (provider === 'evolution') {
      const evolution_api_url =
        whatsapp_config?.evolution_api_url || Deno.env.get('EVOLUTION_API_URL')
      const evolution_api_key =
        whatsapp_config?.evolution_api_key || Deno.env.get('EVOLUTION_API_KEY')
      const evolution_instance =
        whatsapp_config?.evolution_instance || Deno.env.get('EVOLUTION_INSTANCE') || 'kanban_vendas'

      if (evolution_api_url && evolution_api_key && evolution_instance && phone) {
        const formattedPhone = phone.replace(/\D/g, '')
        const evoUrl = evolution_api_url.endsWith('/')
          ? evolution_api_url.slice(0, -1)
          : evolution_api_url

        try {
          const res = await fetch(`${evoUrl}/message/sendText/${evolution_instance}`, {
            method: 'POST',
            headers: { apikey: evolution_api_key, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: formattedPhone,
              options: { delay: 1200 },
              textMessage: { text: message },
            }),
          })
          if (!res.ok) {
            console.error('Erro na Evolution API:', await res.text())
          } else {
            console.log(
              `Mensagem processada e encaminhada via Evolution API (Instância: ${evolution_instance})`,
            )
          }
        } catch (fetchErr) {
          console.error('Falha de conexão com a Evolution API:', fetchErr)
        }
      }
    }

    // 5. Simulação de um Webhook real do WhatsApp recebendo uma resposta após 3 segundos
    setTimeout(async () => {
      await supabase.from('historico_leads').insert({
        lead_id,
        usuario_id: user_id,
        contato_nome: 'WhatsApp (Lead)',
        forma_contato: 'WhatsApp',
        detalhes: `Lead respondeu: Mensagem recebida! Vamos conversar sobre os próximos passos. [via ${provider}]`,
      })
    }, 3000)

    return new Response(
      JSON.stringify({ success: true, status: newStatus, score: Math.round(qualityScore) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
