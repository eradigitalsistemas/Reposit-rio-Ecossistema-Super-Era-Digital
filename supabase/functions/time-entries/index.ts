import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'zod'
import { corsHeaders } from '../_shared/cors.ts'
import { timeToDecimal, calculateTimeEntry } from '../_shared/time.ts'

const timeEntrySchema = z.object({
  employee_id: z.string().uuid('ID de colaborador inválido'),
  action: z.enum(['entry', 'exit', 'break']),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')
    .optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:mm ou HH:mm:ss)')
    .optional(),
  break_duration: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Duração do intervalo inválida')
    .optional(),
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

    if (req.method === 'GET') {
      if (params.length === 2) {
        const [employee_id, date] = params
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('employee_id', employee_id)
          .eq('date', date)
          .maybeSingle()

        if (error) throw error

        return new Response(JSON.stringify({ data: data || null }), {
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
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (error) throw error

        const totals = { hours_worked: 0, overtime: 0, delay: 0, days_worked: data.length }

        data.forEach((entry) => {
          totals.hours_worked += Number(entry.hours_worked || 0)
          totals.overtime += Number(entry.overtime || 0)
          totals.delay += Number(entry.delay || 0)
        })

        totals.hours_worked = parseFloat(totals.hours_worked.toFixed(2))
        totals.overtime = parseFloat(totals.overtime.toFixed(2))
        totals.delay = parseFloat(totals.delay.toFixed(2))

        return new Response(JSON.stringify({ data, totals }), {
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

      const { employee_id, action, date: reqDate, time: reqTime, break_duration } = parsed.data

      let date = reqDate
      let time = reqTime

      if (!date || !time) {
        const now = new Date()
        const utcMinus3 = new Date(now.getTime() - 3 * 60 * 60 * 1000) // UTC-03:00 fixo
        if (!date) date = utcMinus3.toISOString().split('T')[0]
        if (!time) time = utcMinus3.toISOString().split('T')[1].substring(0, 8)
      }

      if (time.length === 5) time += ':00'

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

      const { data: record } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('date', date)
        .maybeSingle()

      const headers = { ...corsHeaders, 'Content-Type': 'application/json' }

      if (action === 'entry') {
        if (record && record.entry_time) {
          return new Response(JSON.stringify({ error: 'Já existe entrada registrada hoje' }), {
            status: 400,
            headers,
          })
        }

        const delay = timeToDecimal(time) > 8 ? parseFloat((timeToDecimal(time) - 8).toFixed(2)) : 0

        if (record) {
          const { data, error } = await supabase
            .from('time_entries')
            .update({ entry_time: time, delay })
            .eq('id', record.id)
            .select()
            .single()
          if (error) throw error
          return new Response(JSON.stringify({ data, success: true }), { status: 201, headers })
        } else {
          const { data, error } = await supabase
            .from('time_entries')
            .insert({
              employee_id,
              date,
              entry_time: time,
              delay,
            })
            .select()
            .single()
          if (error) throw error
          return new Response(JSON.stringify({ data, success: true }), { status: 201, headers })
        }
      }

      if (action === 'exit') {
        if (!record || !record.entry_time) {
          return new Response(JSON.stringify({ error: 'Registre entrada antes de saída' }), {
            status: 400,
            headers,
          })
        }
        if (record.exit_time) {
          return new Response(JSON.stringify({ error: 'Já existe saída registrada hoje' }), {
            status: 400,
            headers,
          })
        }

        const breakStr = break_duration || record.break_duration || '01:00:00'
        let calcResult
        try {
          calcResult = calculateTimeEntry(record.entry_time, time, breakStr)
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 400, headers })
        }

        const { data, error } = await supabase
          .from('time_entries')
          .update({
            exit_time: time,
            hours_worked: calcResult.hoursWorked,
            overtime: calcResult.overtime,
            break_duration: breakStr,
          })
          .eq('id', record.id)
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ data, success: true }), { status: 201, headers })
      }

      if (action === 'break') {
        if (!record || !record.entry_time) {
          return new Response(JSON.stringify({ error: 'Registre entrada antes do intervalo' }), {
            status: 400,
            headers,
          })
        }
        const breakStr = break_duration || '01:00:00'

        let updateData: any = { break_duration: breakStr }

        if (record.exit_time) {
          try {
            const calcResult = calculateTimeEntry(record.entry_time, record.exit_time, breakStr)
            updateData.hours_worked = calcResult.hoursWorked
            updateData.overtime = calcResult.overtime
          } catch (err: any) {
            return new Response(JSON.stringify({ error: err.message }), { status: 400, headers })
          }
        }

        const { data, error } = await supabase
          .from('time_entries')
          .update(updateData)
          .eq('id', record.id)
          .select()
          .single()
        if (error) throw error
        return new Response(JSON.stringify({ data, success: true }), { status: 201, headers })
      }
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
