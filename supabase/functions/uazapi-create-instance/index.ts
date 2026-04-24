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
    
    // Simplificando sem usar regex para evitar erro de parsing
    let uazUrl = Deno.env.get('UAZAPI_URL') || ''
    if (uazUrl.endsWith('/')) {
        uazUrl = uazUrl.slice(0, -1)
    }
    
    const uazAdminToken = Deno.env.get('UAZAPI_ADMIN_TOKEN') || ''
    const instanceName = 'comercial_era'

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: integ } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('id', integrationId)
      .single()

    if (!integ) throw new Error('Integration not found')

    const response = await fetch(uazUrl + '/instance/create', {
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

    const data = await response.json()
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