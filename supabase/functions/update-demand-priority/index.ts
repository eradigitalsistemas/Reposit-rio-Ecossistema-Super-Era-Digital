import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const cronSecret = req.headers.get('x-cron-secret')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: authHeader ? { Authorization: authHeader } : {} } },
    )

    const serviceRoleClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey ?? '')

    let userId = null
    let isGlobal = false

    if (token === serviceRoleKey || cronSecret === 'super-secret-cron-key-123') {
      isGlobal = true
    } else if (authHeader) {
      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser()
      if (authError || !user) {
        throw new Error('Unauthorized')
      }
      userId = user.id
    } else {
      throw new Error('Unauthorized')
    }

    const now = new Date()
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
    const endOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999),
    )

    let query = serviceRoleClient
      .from('demandas')
      .update({ prioridade: 'Urgente' })
      .eq('prioridade', 'Pode Ficar para Amanhã')
      .gte('data_vencimento', startOfToday.toISOString())
      .lte('data_vencimento', endOfToday.toISOString())

    if (!isGlobal && userId) {
      query = query.eq('usuario_id', userId)
    }

    const { data, error } = await query.select()

    if (error) throw error

    return new Response(JSON.stringify({ updated: data?.length || 0, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
