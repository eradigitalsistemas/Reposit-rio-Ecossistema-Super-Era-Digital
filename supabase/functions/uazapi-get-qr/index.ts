import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })

  try {
    const uazUrl = (Deno.env.get('UAZAPI_URL') || '').replace(/\/$/, '')
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''

    // Testaremos a rota mais simples possível e mudaremos o header para Authorization
    const url = uazUrl + "/instance/list"
    
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        'Authorization': 'Bearer ' + uazAdminToken,
        'admintoken': uazAdminToken // Testando ambos
      }
    })
    
    const text = await res.text()
    
    return new Response(JSON.stringify({ 
      endpoint: url,
      status: res.status, 
      body: text 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})