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
    const uazToken = Deno.env.get('UAZAPI_TOKEN') || ''
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''

    if (!uazUrl || (!uazToken && !uazAdminToken)) {
      throw new Error('UAZAPI is not globally configured.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: integ } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('id', integrationId)
      .single()
    if (!integ) throw new Error('Missing configuration')

    const instanceName = integ.user_id

    if (integ.instance_name !== instanceName) {
      await supabase
        .from('user_integrations')
        .update({ instance_name: instanceName })
        .eq('id', integrationId)
    }

    // 1. Check if instance exists via status
    const stateRes = await fetch(`${uazUrl}/instance/status`, {
      method: 'GET',
      headers: { token: instanceName },
    })

    let needsCreation = false

    if (stateRes.status === 404) {
      needsCreation = true
    } else if (!stateRes.ok) {
      const errorText = await stateRes.text()
      console.warn('UAZAPI status failed:', errorText)
      return new Response(
        JSON.stringify({ error: `UAZAPI status failed (${stateRes.status}): ${errorText}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else {
      const stateData = await stateRes.json()
      if (stateData.status === 'open' || stateData.instance?.status === 'open') {
        let isWebhookEnabled = (integ as any).is_webhook_enabled

        if (!isWebhookEnabled) {
          const webhookUrl = `${supabaseUrl}/functions/v1/uazapi-webhook`
          const hookRes = await fetch(`${uazUrl}/instance/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', token: instanceName },
            body: JSON.stringify({
              url: webhookUrl,
              enabled: true,
            }),
          })
          isWebhookEnabled = hookRes.ok
          if (hookRes.ok) console.log(`[WEBHOOK] Proactively configured for ${instanceName}`)
          else console.warn(`[WEBHOOK] Failed for ${instanceName}:`, await hookRes.text())
        }

        await supabase
          .from('user_integrations')
          .update({
            status: 'CONNECTED',
            is_webhook_enabled: isWebhookEnabled,
          } as any)
          .eq('id', integrationId)

        return new Response(JSON.stringify({ connected: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Proactive webhook check if instance exists but not connected
    if (!needsCreation && !(integ as any).is_webhook_enabled) {
      const webhookUrl = `${supabaseUrl}/functions/v1/uazapi-webhook`
      const webhookRes = await fetch(`${uazUrl}/instance/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: instanceName },
        body: JSON.stringify({
          url: webhookUrl,
          enabled: true,
        }),
      })
      if (webhookRes.ok) {
        console.log(`[WEBHOOK] Proactively configured for ${instanceName}`)
        await supabase
          .from('user_integrations')
          .update({ is_webhook_enabled: true } as any)
          .eq('id', integrationId)
        ;(integ as any).is_webhook_enabled = true
      }
    }

    // 2. If needs creation, create it
    if (needsCreation) {
      const createRes = await fetch(`${uazUrl}/instance/create`, {
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

      if (!createRes.ok) {
        const errorText = await createRes.text()
        if (createRes.status === 429) {
          throw new Error('UAZAPI error: Limite de instâncias atingido (429)')
        }
        console.warn('UAZAPI create failed:', errorText)

        if (
          createRes.status === 409 ||
          errorText.includes('already exists') ||
          errorText.includes('Duplicated instance')
        ) {
          // It exists now, let's continue
        } else {
          return new Response(
            JSON.stringify({
              error: `UAZAPI Create failed (${createRes.status}): ${errorText}`,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
      } else {
        // Post-creation webhook
        const webhookUrl = `${supabaseUrl}/functions/v1/uazapi-webhook`
        await fetch(`${uazUrl}/instance/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', token: instanceName },
          body: JSON.stringify({ url: webhookUrl, enabled: true }),
        })

        await supabase
          .from('user_integrations')
          .update({
            status: 'WAITING_QR',
          } as any)
          .eq('id', integrationId)
      }
    }

    // 3. Get Connect (returns QR)
    const connectRes = await fetch(`${uazUrl}/instance/connect`, {
      method: 'GET',
      headers: { token: instanceName },
    })

    if (!connectRes.ok) {
      const errorText = await connectRes.text()
      console.warn('Evolution connect failed:', errorText)
      return new Response(
        JSON.stringify({ error: `Evolution Connect failed (${connectRes.status}): ${errorText}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const connectData = await connectRes.json()

    if (connectData.instance?.state === 'open' || connectData.state === 'open') {
      let isWebhookEnabled = (integ as any).is_webhook_enabled
      if (!isWebhookEnabled) {
        const webhookUrl = `${supabaseUrl}/functions/v1/uazapi-webhook`
        const webhookRes = await fetch(`${uazUrl}/instance/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', token: instanceName },
          body: JSON.stringify({
            url: webhookUrl,
            enabled: true,
          }),
        })
        isWebhookEnabled = webhookRes.ok
      }
      await supabase
        .from('user_integrations')
        .update({
          status: 'CONNECTED',
          is_webhook_enabled: isWebhookEnabled,
        } as any)
        .eq('id', integrationId)

      return new Response(JSON.stringify({ connected: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update status to WAITING_QR so the UI can reflect the disconnected state accurately
    await supabase
      .from('user_integrations')
      .update({
        status: 'WAITING_QR',
      } as any)
      .eq('id', integrationId)

    const base64 = connectData.base64
    if (!base64) {
      return new Response(JSON.stringify({ error: 'qr_not_ready_yet' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ base64 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
