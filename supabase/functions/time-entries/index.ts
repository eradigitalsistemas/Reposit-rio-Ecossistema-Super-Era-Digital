import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

const timeEntrySchema = z.object({
  employee_id: z.string().uuid('ID de colaborador inválido'),
  action: z.enum(['entrada', 'intervalo_saida', 'intervalo_entrada', 'saida']),
  notes: z.string().optional(),
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const functionIndex = pathParts.indexOf('time-entries')

    if (functionIndex === -1) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const params = pathParts.slice(functionIndex + 1)
    const orgId = '00000000-0000-0000-0000-000000000001'

    if (req.method === 'GET') {
      if (params.length === 2) {
        const [employee_id, date] = params
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('employee_id', employee_id)
          .eq('entry_date', date)
          .order('timestamp', { ascending: true })

        if (error) throw error

        return new Response(JSON.stringify({ data: data || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (params.length === 3) {
        const [employee_id, month, year] = params
        const startDate = `${year}-${month.padStart(2, '0')}-01`
        const lastDay = new Date(Number(year), Number(month), 0).getDate()
        const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('employee_id', employee_id)
          .gte('entry_date', startDate)
          .lte('entry_date', endDate)
          .order('timestamp', { ascending: true })

        if (error) throw error

        const grouped = (data || []).reduce((acc: any, curr: any) => {
          if (!acc[curr.entry_date]) acc[curr.entry_date] = []
          acc[curr.entry_date].push(curr)
          return acc
        }, {})

        const dailyRecords = []
        const totals = { hours_worked: 0, overtime: 0, delay: 0, days_worked: 0 }

        for (const [date, records] of Object.entries(grouped)) {
          totals.days_worked++
          let dayHours = 0
          let entry = null,
            intOut = null,
            intIn = null,
            out = null

          for (const r of records as any[]) {
            if (r.entry_type === 'entrada') entry = new Date(r.timestamp)
            if (r.entry_type === 'intervalo_saida') intOut = new Date(r.timestamp)
            if (r.entry_type === 'intervalo_entrada') intIn = new Date(r.timestamp)
            if (r.entry_type === 'saida') out = new Date(r.timestamp)
          }

          if (entry && out) {
            let workMs = out.getTime() - entry.getTime()
            if (intOut && intIn) {
              workMs -= intIn.getTime() - intOut.getTime()
            }
            dayHours = workMs / (1000 * 60 * 60)
          }
          totals.hours_worked += dayHours

          const dailyOvertime = dayHours > 8 ? dayHours - 8 : 0
          totals.overtime += dailyOvertime

          dailyRecords.push({
            date,
            entries: records,
            hours_worked: parseFloat(dayHours.toFixed(2)),
            overtime: parseFloat(dailyOvertime.toFixed(2)),
            delay: 0,
          })
        }

        totals.hours_worked = parseFloat(totals.hours_worked.toFixed(2))
        totals.overtime = parseFloat(totals.overtime.toFixed(2))

        return new Response(JSON.stringify({ data: dailyRecords, totals }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ error: 'Parâmetros inválidos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const parsed = timeEntrySchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { employee_id, action, notes } = parsed.data

      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('id')
        .eq('id', employee_id)
        .single()
      if (empErr || !emp) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const now = new Date()
      const utcMinus3 = new Date(now.getTime() - 3 * 60 * 60 * 1000)
      const dateStr = utcMinus3.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          organization_id: orgId,
          employee_id,
          entry_date: dateStr,
          entry_type: action,
          timestamp: utcMinus3.toISOString(),
          notes,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ data, success: true }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Internal Server Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
