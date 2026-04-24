import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const instanceName = Deno.env.get('INSTANCE_NAME')
    const UAZAPI_URL = Deno.env.get('UAZAPI_URL')
    const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')

    if (!instanceName || !UAZAPI_URL || !UAZAPI_TOKEN) {
      throw new Error('Credenciais UAZAPI não configuradas nas variáveis de ambiente')
    }

    const apiUrl = UAZAPI_URL.endsWith('/') ? UAZAPI_URL.slice(0, -1) : UAZAPI_URL

    const stateRes = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
      headers: { apikey: UAZAPI_TOKEN },
    }).catch((e) => {
      console.error('Error fetching connectionState:', e)
      return null
    })

    let stateData: any = { instance: { state: 'offline' } }
    if (stateRes && stateRes.ok) {
      stateData = await stateRes.json()
    }

    const state = stateData?.instance?.state || stateData?.state || 'offline'

    if (state === 'open') {
      return new Response(JSON.stringify({ state: 'open' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const connectRes = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
      headers: { apikey: UAZAPI_TOKEN },
    }).catch((e) => {
      console.error('Error fetching connect:', e)
      return null
    })

    let connectData: any = {}
    if (connectRes && connectRes.ok) {
      connectData = await connectRes.json()
    }

    return new Response(
      JSON.stringify({
        state: connectData?.instance?.state || state,
        base64: connectData?.base64 || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
