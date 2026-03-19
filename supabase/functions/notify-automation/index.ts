import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.45.4'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const WEBHOOK_SECRET = 'super-secret-webhook-key-123'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_dummy_key_for_testing'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sendEmail(to: string[], subject: string, html: string) {
  if (!to || to.length === 0) return

  try {
    await fetch('https://api.resend.com/emails', {
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
  } catch (error) {
    // Silently handle
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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

      const htmlMessage = `<p>Status update: The demand <strong>${titulo}</strong> is now <strong>${status}</strong>.</p>`

      await sendEmail(emails, `Demand Status Updated: ${titulo}`, htmlMessage)

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
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
