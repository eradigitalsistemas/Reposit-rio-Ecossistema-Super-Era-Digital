import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const uazUrl = (Deno.env.get('UAZAPI_URL') || '').replace(/\/$/, '')
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''

    // Testaremos a rota mais simples possível e mudaremos o header para Authorization
    const url = uazUrl + '/instance/list'

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + uazAdminToken,
        admintoken: uazAdminToken, // Testando ambos
      },
    })

    const text = await res.text()

    return new Response(
      JSON.stringify({
        endpoint: url,
        status: res.status,
        body: text,
      }),
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
