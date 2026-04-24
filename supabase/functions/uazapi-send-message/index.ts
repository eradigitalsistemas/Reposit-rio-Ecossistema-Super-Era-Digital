import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { lead_id, message, phone, user_id, instanceName = 'kanban_vendas' } = await req.json()

    if (!lead_id || !message || !user_id || !phone) {
      throw new Error('Campos obrigatórios ausentes')
    }

    const UAZAPI_URL = Deno.env.get('UAZAPI_URL')
    const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: insertErr } = await supabase.from('historico_leads').insert({
      lead_id,
      usuario_id: user_id,
      contato_nome: 'WhatsApp',
      forma_contato: 'WhatsApp',
      detalhes: `Você: ${message}`,
    })

    if (insertErr) throw insertErr

    let newStatus = 'Interessado'
    let qualityScore = 50
    const msgLower = message.toLowerCase()

    if (
      msgLower.includes('comprar') ||
      msgLower.includes('preço') ||
      msgLower.includes('fechar') ||
      msgLower.includes('contrato')
    ) {
      newStatus = 'Muito Interessado'
      qualityScore = 90
    } else if (
      msgLower.includes('não quero') ||
      msgLower.includes('caro') ||
      msgLower.includes('depois')
    ) {
      newStatus = 'Não Interessado'
      qualityScore = 20
    } else {
      qualityScore = Math.min(100, 50 + message.length / 2)
      if (qualityScore > 75) newStatus = 'Muito Interessado'
    }

    await supabase
      .from('leads')
      .update({
        status_interesse: newStatus,
        observacoes: `Qualificação IA WA: Score ${Math.round(qualityScore)}/100.`,
      })
      .eq('id', lead_id)

    if (UAZAPI_URL && UAZAPI_TOKEN) {
      const apiUrl = UAZAPI_URL.endsWith('/') ? UAZAPI_URL.slice(0, -1) : UAZAPI_URL
      const formattedPhone = phone.replace(/\D/g, '')

      const res = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: { apikey: UAZAPI_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: formattedPhone,
          options: { delay: 1200 },
          textMessage: { text: message },
        }),
      })

      if (!res.ok) {
        console.error('Erro ao enviar via UAZAPI:', await res.text())
      }
    }

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
