import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { integrationId } = await req.json()
    if (!integrationId) throw new Error('Missing integrationId')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const uazUrlRaw = Deno.env.get('UAZAPI_URL') || ''
    const uazUrl = uazUrlRaw.replace(/\/$/, '')
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''

    if (!uazUrl || !uazAdminToken) {
      throw new Error('UAZAPI is not globally configured.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: integ } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('id', integrationId)
      .single()
    if (!integ) {
      throw new Error('Integration not found')
    }

    const instanceName = 'comercial_era'

    if (integ.instance_name !== instanceName) {
      await supabase
        .from('user_integrations')
        .update({ instance_name: instanceName })
        .eq('id', integrationId)
    }

    const response = await fetch(`${uazUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        admintoken: uazAdminToken,
      },
      body: JSON.stringify({
        instanceName: instanceName,
        token: instanceName,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.warn('UAZAPI returned error on create:', text)

      if (response.status === 429) {
        throw new Error('UAZAPI error: Limite de instâncias atingido (429)')
      }

      if (
        response.status === 409 ||
        text.includes('already exists') ||
        text.includes('Duplicated instance')
      ) {
        const stateRes = await fetch(`${uazUrl}/instance/status`, {
          method: 'GET',
          headers: { token: instanceName },
        })

        if (stateRes.ok) {
          const stateData = await stateRes.json()
          if (stateData.status === 'open' || stateData.instance?.status === 'open') {
            const webhookUrl = `${supabaseUrl}/functions/v1/uazapi-webhook`
            const hookRes = await fetch(`${uazUrl}/instance/webhook`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: instanceName },
              body: JSON.stringify({
                url: webhookUrl,
                enabled: true,
              }),
            })
            const isWebhookEnabled = hookRes.ok

            await supabase
              .from('user_integrations')
              .update({
                status: 'CONNECTED',
                is_webhook_enabled: isWebhookEnabled,
              } as any)
              .eq('id', integrationId)

            if (hookRes.ok) console.log(`[WEBHOOK] Proactively configured for ${instanceName}`)
            else console.warn(`[WEBHOOK] Failed for ${instanceName}:`, await hookRes.text())

            return new Response(JSON.stringify({ success: true, connected: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
        }
      }

      return new Response(
        JSON.stringify({ error: `UAZAPI Create failed (${response.status}): ${text}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // After successfully creating instance, configure webhook
    const webhookUrl = `${supabaseUrl}/functions/v1/uazapi-webhook`
    const webhookRes = await fetch(`${uazUrl}/instance/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', token: instanceName },
      body: JSON.stringify({
        url: webhookUrl,
        enabled: true,
      }),
    })

    let isWebhookEnabled = false
    if (webhookRes.ok) {
      isWebhookEnabled = true
      console.log(`[WEBHOOK] Configured successfully for ${instanceName}`)
    } else {
      console.warn(`[WEBHOOK] Failed to set webhook for ${instanceName}:`, await webhookRes.text())
    }

    await supabase
      .from('user_integrations')
      .update({
        status: 'WAITING_QR',
        is_webhook_enabled: isWebhookEnabled,
      } as any)
      .eq('id', integrationId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
