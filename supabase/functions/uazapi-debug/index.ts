import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Pega instância real (ignora user fake de demo)
    const { data: integrations } = await supabase
      .from('user_integrations')
      .select('*')
      .neq('user_id', '11111111-1111-1111-1111-111111111111')
      .limit(1)

    const integ = integrations?.[0]

    const uazUrl = (Deno.env.get('UAZAPI_URL') || '').replace(/\/$/, '')
    const uazToken = Deno.env.get('UAZAPI_TOKEN') || ''
    const instance = integ?.instance_name || ''

    if (!uazUrl || !instance) {
      return new Response(
        JSON.stringify(
          {
            debug: {
              integration: integ,
              env_uaz_url: Deno.env.get('UAZAPI_URL') ? 'SET' : 'NOT SET',
              env_uaz_token: Deno.env.get('UAZAPI_TOKEN') ? 'SET' : 'NOT SET',
              resolved_url: uazUrl,
              resolved_instance: instance,
            },
          },
          null,
          2,
        ),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || 'contact/all'
    const limitParam = parseInt(url.searchParams.get('limit') || '15')

    let apiUrl = ''

    if (endpoint === 'findChats' || endpoint === 'contact/all') {
      apiUrl = `${uazUrl}/contact/all`
    } else if (endpoint === 'findContacts') {
      apiUrl = `${uazUrl}/contact/all`
    } else if (endpoint === 'findMessages' || endpoint === 'message/all') {
      apiUrl = `${uazUrl}/message/all`
    }

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { token: uazToken, 'Content-Type': 'application/json' },
    })

    const raw = await res.json()

    // Limita resultado para não explodir o browser
    const preview = Array.isArray(raw) ? raw.slice(0, limitParam) : raw

    return new Response(
      JSON.stringify({ _meta: { endpoint, instance, status: res.status }, data: preview }, null, 2),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
