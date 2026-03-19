import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.45.4'
import { corsHeaders } from '../_shared/cors.ts'

const WEBHOOK_SECRET = 'super-secret-webhook-key-123'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_dummy_key_for_testing'

// WhatsApp Configuration Placeholder
const WHATSAPP_API_URL =
  Deno.env.get('WHATSAPP_API_URL') || 'https://api.whatsapp-provider.com/v1/messages'
const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN') || 'dummy_token'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendEmail(to: string[], subject: string, html: string) {
  if (!to || to.length === 0) return
  console.log(`Sending email to ${to.join(', ')} with subject: ${subject}`)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CRM Notifications <onboarding@resend.dev>',
        to: to,
        subject: subject,
        html: html,
      }),
    })

    if (!res.ok) {
      console.error('Failed to send email:', await res.text())
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

async function sendWhatsApp(phone: string, message: string) {
  if (!phone) return
  console.log(`Sending WhatsApp to ${phone} with message: ${message}`)

  // Placeholder for WhatsApp API integration (e.g. Twilio or Evolution API)
  /*
  try {
    const res = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        number: phone,
        text: message
      })
    })
    
    if (!res.ok) {
      console.error('Failed to send WhatsApp:', await res.text())
    }
  } catch (error) {
    console.error('Error sending WhatsApp:', error)
  }
  */
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify webhook secret
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const payload = await req.json()
    const { type, record } = payload

    if (type === 'demand_status_change') {
      const { titulo, status, responsavel_id, usuario_id } = record

      const userIdsToNotify = [usuario_id]
      if (responsavel_id && responsavel_id !== usuario_id) {
        userIdsToNotify.push(responsavel_id)
      }

      const { data: users, error } = await supabase
        .from('usuarios')
        .select('email, nome')
        .in('id', userIdsToNotify)

      if (error) throw error

      const emails = users.map((u: any) => u.email).filter(Boolean)

      const textMessage = `Status update: The demand '${titulo}' is now '${status}'.`
      const htmlMessage = `<p>Status update: The demand <strong>${titulo}</strong> is now <strong>${status}</strong>.</p>`

      await sendEmail(emails, `Demand Status Updated: ${titulo}`, htmlMessage)

      // Attempt WhatsApp placeholder implementation
      // await sendWhatsApp('+5511999999999', textMessage)

      return new Response(JSON.stringify({ success: true, notified: emails.length }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    } else if (type === 'client_document_upload') {
      const { nome } = record

      const { data: admins, error } = await supabase
        .from('usuarios')
        .select('email, nome')
        .eq('perfil', 'admin')

      if (error) throw error

      const emails = admins.map((u: any) => u.email).filter(Boolean)

      const textMessage = `New document: A new file has been attached to the client '${nome}'.`
      const htmlMessage = `<p>New document: A new file has been attached to the client <strong>${nome}</strong>.</p>`

      await sendEmail(emails, `New Document Uploaded for ${nome}`, htmlMessage)

      return new Response(JSON.stringify({ success: true, notified: emails.length }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown event type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
