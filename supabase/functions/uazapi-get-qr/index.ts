import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { integrationId } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    let uazUrl = Deno.env.get('UAZAPI_URL') || ''
    if (uazUrl.endsWith('/')) uazUrl = uazUrl.slice(0, -1)
    
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''
    const instanceName = 'comercial_era' // Nome fixo para garantir consistência

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Tentar criar (se já existir, a API ignora ou retorna 409)
    await fetch(uazUrl + '/instance/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'admintoken': uazAdminToken,
      },
      body: JSON.stringify({
        instanceName: instanceName,
        token: instanceName,
      }),
    })

    // 2. Buscar o QR Code
    const connectRes = await fetch(uazUrl + '/instance/connect', {
      method: 'GET',
      headers: { token: instanceName },
    })

    const data = await connectRes.json()
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})