import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { instanceName = 'kanban_vendas' } = await req.json().catch(() => ({}))
    const UAZAPI_URL = Deno.env.get('UAZAPI_URL')
    const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')

    if (!UAZAPI_URL || !UAZAPI_TOKEN) {
      throw new Error('Credenciais UAZAPI não configuradas nas variáveis de ambiente')
    }

    const apiUrl = UAZAPI_URL.endsWith('/') ? UAZAPI_URL.slice(0, -1) : UAZAPI_URL

    const res = await fetch(`${apiUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: { apikey: UAZAPI_TOKEN },
    })

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
