import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const cronSecret = req.headers.get('x-cron-secret')
    const authHeader = req.headers.get('Authorization')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const token = authHeader?.replace('Bearer ', '')
    const isCron = cronSecret === 'super-secret-cron-key-123'
    const isServiceRole = token === serviceRoleKey

    if (!isCron && !isServiceRole) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey ?? '',
      { auth: { persistSession: false } },
    )

    const now = new Date().toISOString()

    const { data: demandsToUpdate, error: fetchError } = await serviceRoleClient
      .from('demandas')
      .select('id')
      .eq('prioridade', 'Pode Ficar para Amanhã')
      .neq('status', 'Concluído')
      .lte('data_vencimento', now)

    if (fetchError) throw fetchError

    if (!demandsToUpdate || demandsToUpdate.length === 0) {
      return new Response(JSON.stringify({ updated: 0, data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ids = demandsToUpdate.map((d) => d.id)

    const { data, error } = await serviceRoleClient
      .from('demandas')
      .update({ prioridade: 'Urgente' })
      .in('id', ids)
      .select()

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
