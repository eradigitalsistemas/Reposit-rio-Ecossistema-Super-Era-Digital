import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

const timeEntrySchema = z.object({
  employee_id: z.string().uuid('ID de colaborador inválido'),
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')
    .refine((val) => {
      const entryDate = new Date(`${val}T00:00:00-03:00`)
      const now = new Date()
      return entryDate <= now
    }, 'A data não pode estar no futuro'),
  entry_type: z.enum(['entrada', 'intervalo_saida', 'intervalo_entrada', 'saida'], {
    errorMap: () => ({
      message: 'entry_type deve ser um dos: entrada, intervalo_saida, intervalo_entrada, saida',
    }),
  }),
  timestamp: z
    .string()
    .datetime({ offset: true })
    .refine((val) => val.endsWith('-03:00'), 'O timestamp deve estar no fuso horário UTC-03:00'),
  notes: z.string().max(500).optional(),
})

const updateSchema = z
  .object({
    timestamp: z
      .string()
      .datetime({ offset: true })
      .refine((val) => val.endsWith('-03:00'), 'O timestamp deve estar no fuso horário UTC-03:00')
      .optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Nenhum campo para atualizar',
  })

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
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
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('id', user.id)
      .single()
    const role = userProfile?.perfil || 'colaborador'

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const functionIndex = pathParts.indexOf('time-entries')

    if (functionIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Endpoint não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const params = pathParts.slice(functionIndex + 1)

    if (req.method === 'GET') {
      // Legacy endpoints support (Frontend backwards compatibility)
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

        function detectAnomalies(entries: any[]): any[] {
          const anomalies: any[] = []
          if (!entries || entries.length === 0) return anomalies
          const sorted = [...entries].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          if (sorted[0]?.entry_type !== 'entrada') {
            anomalies.push({
              type: 'EXIT_WITHOUT_ENTRY',
              message: 'Registro iniciado sem entrada',
              severity: 'high',
            })
          }
          const intOut = sorted.find((e) => e.entry_type === 'intervalo_saida')
          const intIn = sorted.find((e) => e.entry_type === 'intervalo_entrada')
          if (intOut && intIn) {
            const intMins = Math.floor(
              (new Date(intIn.timestamp).getTime() - new Date(intOut.timestamp).getTime()) / 60000,
            )
            if (intMins < 30) {
              anomalies.push({
                type: 'SHORT_BREAK',
                message: `Intervalo curto: ${intMins}min`,
                severity: 'medium',
              })
            }
          }
          const entrada = sorted.find((e) => e.entry_type === 'entrada')
          const saida = sorted.find((e) => e.entry_type === 'saida')
          if (entrada && saida) {
            const totalMins = Math.floor(
              (new Date(saida.timestamp).getTime() - new Date(entrada.timestamp).getTime()) / 60000,
            )
            if (totalMins > 12 * 60) {
              anomalies.push({
                type: 'EXCESSIVE_HOURS',
                message: `Dia longo: ${Math.floor(totalMins / 60)}h ${totalMins % 60}min`,
                severity: 'medium',
              })
            }
          }
          return anomalies
        }

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

          const anomalies = detectAnomalies(records as any[])

          dailyRecords.push({
            date,
            entries: records,
            hours_worked: parseFloat(dayHours.toFixed(2)),
            overtime: parseFloat(dailyOvertime.toFixed(2)),
            delay: 0,
            anomalies,
          })
        }

        totals.hours_worked = parseFloat(totals.hours_worked.toFixed(2))
        totals.overtime = parseFloat(totals.overtime.toFixed(2))

        return new Response(JSON.stringify({ data: dailyRecords, totals }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // GET /api/time-entries/:id
      if (params.length === 1) {
        const id = params[0]
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (error || !data) {
          return new Response(
            JSON.stringify({ error: 'NOT_FOUND', message: 'Registro de ponto não encontrado' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // GET /api/time-entries
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      const employee_id = url.searchParams.get('employee_id')
      const date_from = url.searchParams.get('date_from')
      const date_to = url.searchParams.get('date_to')
      const entry_type = url.searchParams.get('entry_type')

      let query = supabase.from('time_entries').select('*', { count: 'exact' })

      if (employee_id) query = query.eq('employee_id', employee_id)
      if (date_from) query = query.gte('entry_date', date_from)
      if (date_to) query = query.lte('entry_date', date_to)
      if (entry_type) query = query.eq('entry_type', entry_type)

      query = query.range(offset, offset + limit - 1).order('timestamp', { ascending: false })

      const { data, error, count } = await query
      if (error) throw error

      return new Response(
        JSON.stringify({
          data: data || [],
          pagination: {
            limit,
            offset,
            total: count || 0,
            has_more: count !== null ? offset + limit < count : false,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const parsed = timeEntrySchema.safeParse(body)

      if (!parsed.success) {
        const firstError = parsed.error.errors[0]
        return new Response(
          JSON.stringify({
            error: 'VALIDATION_ERROR',
            message: firstError.message,
            details: {
              field: firstError.path.join('.'),
              value: body[firstError.path[0]],
              expected: firstError.code,
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { employee_id, entry_date, entry_type, timestamp, notes } = parsed.data

      if (role !== 'rh' && role !== 'admin') {
        const { data: userEmployeeId } = await supabase.rpc('get_user_employee_id')
        if (userEmployeeId !== employee_id) {
          return new Response(
            JSON.stringify({
              error: 'UNAUTHORIZED',
              message: 'Você não tem permissão para registrar ponto de outro colaborador',
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
      }

      const { data: existing } = await supabase
        .from('time_entries')
        .select('id')
        .eq('employee_id', employee_id)
        .eq('entry_date', entry_date)
        .eq('entry_type', entry_type)
        .maybeSingle()

      if (existing) {
        return new Response(
          JSON.stringify({
            error: 'DUPLICATE_ENTRY',
            message: `Já existe um registro de '${entry_type}' para este colaborador em ${entry_date}`,
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { data: orgData } = await supabase.rpc('get_user_org_id')
      const orgId = orgData || '00000000-0000-0000-0000-000000000001'

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          organization_id: orgId,
          employee_id,
          entry_date,
          entry_type,
          timestamp,
          notes,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        const msg = error.message
        if (msg.includes('DUPLICATE_ENTRY:')) {
          return new Response(
            JSON.stringify({
              error: 'DUPLICATE_ENTRY',
              message: msg.split('DUPLICATE_ENTRY:')[1]?.trim() || msg,
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
        if (msg.includes('SEQUENCE_ERROR:')) {
          return new Response(
            JSON.stringify({
              error: 'SEQUENCE_ERROR',
              message: msg.split('SEQUENCE_ERROR:')[1]?.trim() || msg,
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
        if (msg.includes('SCHEDULE_ERROR:')) {
          return new Response(
            JSON.stringify({
              error: 'SCHEDULE_ERROR',
              message: msg.split('SCHEDULE_ERROR:')[1]?.trim() || msg,
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
        if (msg.includes('só pode ocorrer após') || msg.includes('Já existe um registro')) {
          return new Response(
            JSON.stringify({
              error: 'SEQUENCE_ERROR',
              message: msg,
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
        throw error
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'PUT') {
      if (params.length !== 1) {
        return new Response(
          JSON.stringify({ error: 'BAD_REQUEST', message: 'ID do registro não fornecido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const id = params[0]

      if (role !== 'rh' && role !== 'admin') {
        return new Response(
          JSON.stringify({
            error: 'FORBIDDEN',
            message: 'Apenas RH pode editar registros de ponto',
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const body = await req.json()
      const parsed = updateSchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({
            error: 'VALIDATION_ERROR',
            message: 'Dados inválidos para atualização',
            details: parsed.error.errors,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update(parsed.data)
        .eq('id', id)
        .select('id, timestamp, notes, updated_at')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'NOT_FOUND', message: 'Registro de ponto não encontrado' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'DELETE') {
      if (params.length !== 1) {
        return new Response(
          JSON.stringify({ error: 'BAD_REQUEST', message: 'ID do registro não fornecido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const id = params[0]

      if (role !== 'rh' && role !== 'admin') {
        return new Response(
          JSON.stringify({
            error: 'FORBIDDEN',
            message: 'Apenas RH pode deletar registros de ponto',
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { data: existing, error: existError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('id', id)
        .maybeSingle()
      if (existError) throw existError
      if (!existing) {
        return new Response(
          JSON.stringify({ error: 'NOT_FOUND', message: 'Registro de ponto não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { error } = await supabase.from('time_entries').delete().eq('id', id)
      if (error) throw error

      return new Response(null, { status: 204, headers: corsHeaders })
    }

    return new Response(
      JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Método não permitido' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Internal Server Error:', error)
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Erro interno no servidor',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
