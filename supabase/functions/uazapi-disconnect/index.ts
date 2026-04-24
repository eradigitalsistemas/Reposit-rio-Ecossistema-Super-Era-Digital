import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const body = await req.json().catch(() => ({}))
    const instanceName = body.instanceName || body.uazapi_instance || 'comercial_era'
    const UAZAPI_URL = body.uazapi_url || Deno.env.get('UAZAPI_URL')
    const UAZAPI_TOKEN = body.uazapi_token || Deno.env.get('UAZAPI_TOKEN')

    if (!UAZAPI_URL || !UAZAPI_TOKEN) {
      throw new Error('Credenciais UAZAPI não configuradas nas variáveis de ambiente')
    }

    const apiUrl = UAZAPI_URL.endsWith('/') ? UAZAPI_URL.slice(0, -1) : UAZAPI_URL

    const res = await fetch(`${apiUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: { 'apikey': UAZAPI_TOKEN }
    }).catch(e => {
      console.error('Error fetching logout:', e)
      return null
    })
    
    let data = {}
    if (res && res.ok) {
      data = await res.json()
    }
    
    return new Response(JSON.stringify({ success: true, data }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
