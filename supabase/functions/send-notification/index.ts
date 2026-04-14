import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_dummy_key_for_testing'
const WEBHOOK_SECRET = 'super-secret-webhook-key-123'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const secret = req.headers.get('x-webhook-secret')
  const isWebhook = secret === WEBHOOK_SECRET

  try {
    const body = await req.json()
    
    let to: string[] = ['comercial@areradigital.com.br']
    let subject = 'Nova Notificação'
    let html = '<p>Você tem uma nova notificação.</p>'
    let from = 'Era Digital Notificações <onboarding@resend.dev>'
    let reply_to = undefined
    let attachments = undefined

    // Processamento de gatilho do banco de dados (Webhook)
    if (isWebhook && body.type === 'INSERT' && body.table) {
      const { table, record } = body
      
      if (table === 'leads') {
        subject = `Novo Lead de Contato: ${record.nome}`
        html = `
          <h2>Novo Lead Recebido</h2>
          <p><strong>Nome:</strong> ${record.nome}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Telefone:</strong> ${record.telefone || 'Não informado'}</p>
          <p><strong>Empresa:</strong> ${record.empresa || 'Não informado'}</p>
          <p><strong>Estágio:</strong> ${record.estagio || 'Não informado'}</p>
          <p><strong>Observações:</strong> ${record.observacoes || 'Nenhuma'}</p>
        `
        reply_to = record.email
      } else if (table === 'leads_erp') {
        subject = `Novo Interesse em ERP: ${record.empresa || record.email}`
        html = `
          <h2>Novo Lead ERP Recebido</h2>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Telefone:</strong> ${record.telefone || 'Não informado'}</p>
          <p><strong>Empresa:</strong> ${record.empresa || 'Não informado'}</p>
        `
        reply_to = record.email
      } else if (table === 'leads_certificados') {
        subject = `Novo Interesse em Certificado: ${record.email}`
        html = `
          <h2>Novo Lead de Certificado Recebido</h2>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Telefone:</strong> ${record.telefone || 'Não informado'}</p>
          <p><strong>Tipo de Certificado:</strong> ${record.tipo_certificado || 'Não informado'}</p>
        `
        reply_to = record.email
      } else if (table === 'candidates') {
        subject = `Novo Candidato no Banco de Talentos: ${record.name}`
        html = `
          <h2>Novo Currículo Recebido</h2>
          <p><strong>Nome:</strong> ${record.name}</p>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Profissão:</strong> ${record.profession || 'Não informado'}</p>
          <p>Acesse o painel administrativo para ver os detalhes completos.</p>
        `
        reply_to = record.email
      } else {
        return new Response(JSON.stringify({ success: true, ignored: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else {
      // Envio direto via API (ex: para outras Edge Functions)
      if (body.to && body.subject && body.html) {
        to = Array.isArray(body.to) ? body.to : [body.to]
        subject = body.subject
        html = body.html
        from = body.from || from
        reply_to = body.reply_to
        attachments = body.attachments
      } else {
        throw new Error('Payload inválido ou webhook não autorizado')
      }
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        reply_to,
        attachments,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Resend API error: ${res.status} - ${errorText}`)
    }

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
