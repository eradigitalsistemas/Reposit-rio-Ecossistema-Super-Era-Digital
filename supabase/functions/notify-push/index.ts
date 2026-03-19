import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhookSecret = req.headers.get('x-webhook-secret')
    const isWebhook = webhookSecret === 'super-secret-webhook-key-123'

    if (!isWebhook) {
      throw new Error('Unauthorized')
    }

    const { usuario_id, notification } = await req.json()

    if (!usuario_id || !notification) {
      throw new Error('Missing payload')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured')
    }

    webpush.setVapidDetails('mailto:admin@eradigital.com', vapidPublicKey, vapidPrivateKey)

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, subscription_data')
      .eq('usuario_id', usuario_id)

    if (error) throw error

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sendPromises = subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription_data, JSON.stringify(notification))
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired or invalid, remove it
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        } else {
          console.error('Error sending push:', err)
        }
      }
    })

    await Promise.all(sendPromises)

    return new Response(JSON.stringify({ success: true, count: subs.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
