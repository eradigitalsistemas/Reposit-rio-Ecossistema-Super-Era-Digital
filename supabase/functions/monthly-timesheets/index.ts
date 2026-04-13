import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { z } from 'zod'
import { corsHeaders } from '../_shared/cors.ts'

const generateSchema = z.object({
  year: z.number().int().min(2020, 'Ano deve ser maior ou igual a 2020'),
  month: z.number().int().min(1, 'Mês deve ser entre 1 e 12').max(12, 'Mês deve ser entre 1 e 12'),
  regenerate: z.boolean().default(false),
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
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
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

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const functionIndex = pathParts.indexOf('monthly-timesheets')

    if (functionIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Endpoint não encontrado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const params = pathParts.slice(functionIndex + 1)
    const action = params[0]

    // Obter Role e Org ID do usuário
    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('id', user.id)
      .single()
    const role = userProfile?.perfil || 'colaborador'

    const { data: orgIdData } = await supabase.rpc('get_user_org_id')
    const orgId = orgIdData || '00000000-0000-0000-0000-000000000001'

    // POST /api/monthly-timesheets/generate
    if (req.method === 'POST' && action === 'generate') {
      if (role !== 'rh' && role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'FORBIDDEN', message: 'Apenas RH pode gerar folha' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const body = await req.json().catch(() => ({}))
      const parsed = generateSchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({
            error: 'VALIDATION_ERROR',
            message: 'Dados inválidos para geração',
            details: parsed.error.errors,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { year, month, regenerate } = parsed.data

      // Não permitir gerar mês futuro
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1 // 1-12

      if (year > currentYear || (year === currentYear && month > currentMonth)) {
        return new Response(
          JSON.stringify({
            error: 'INVALID_PERIOD',
            message: 'Não é possível gerar folha para período futuro',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      if (!regenerate) {
        const { count, error: countErr } = await supabase
          .from('monthly_timesheets')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('year', year)
          .eq('month', month)

        if (countErr) throw countErr

        if (count && count > 0) {
          return new Response(
            JSON.stringify({
              error: 'ALREADY_EXISTS',
              message: `Folha para ${month}/${year} já foi gerada. Use regenerate=true para sobrescrever`,
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
      }

      // Buscar colaboradores ativos
      const { data: employees, error: empErr } = await supabase
        .from('employees')
        .select('id')
        .in('status', ['Ativo', 'Em Experiência'])

      if (empErr) throw empErr

      if (!employees || employees.length === 0) {
        return new Response(
          JSON.stringify({ error: 'NO_DATA', message: 'Nenhum colaborador ativo encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const summary = {
        total_hours_worked: 0,
        total_extra_hours: 0,
        total_delays_minutes: 0,
        total_absences: 0,
      }

      let processed = 0
      let failed = 0

      // Process in batches of 10 to avoid overloading the DB connections
      const batchSize = 10
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize)
        await Promise.all(
          batch.map(async (emp) => {
            try {
              const { data: res, error: rpcErr } = await supabase.rpc('calculate_monthly_totals', {
                p_organization_id: orgId,
                p_employee_id: emp.id,
                p_year: year,
                p_month: month,
              })

              if (rpcErr) throw rpcErr

              if (res) {
                summary.total_hours_worked += Number(res.total_hours_worked) || 0
                summary.total_extra_hours += Number(res.total_extra_hours) || 0
                summary.total_delays_minutes += Number(res.total_delays_minutes) || 0
                summary.total_absences += Number(res.absences) || 0

                // Atualizar generated_by no registro que acabou de ser criado pelo RPC
                await supabase
                  .from('monthly_timesheets')
                  .update({ generated_by: user.id })
                  .eq('organization_id', orgId)
                  .eq('employee_id', emp.id)
                  .eq('year', year)
                  .eq('month', month)
              }
              processed++
            } catch (err) {
              console.error(`Failed to process employee ${emp.id}:`, err)
              failed++
            }
          }),
        )
      }

      return new Response(
        JSON.stringify({
          status: 'generated',
          year,
          month,
          employees_processed: processed,
          employees_failed: failed,
          generated_at: new Date().toISOString(),
          generated_by: user.id,
          summary: {
            total_hours_worked: parseFloat(summary.total_hours_worked.toFixed(2)),
            total_extra_hours: parseFloat(summary.total_extra_hours.toFixed(2)),
            total_delays_minutes: summary.total_delays_minutes,
            total_absences: summary.total_absences,
          },
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // GET /api/monthly-timesheets
    if (req.method === 'GET' && !action) {
      const year = url.searchParams.get('year')
      const month = url.searchParams.get('month')
      const employee_id = url.searchParams.get('employee_id')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase.from('monthly_timesheets').select('*', { count: 'exact' })

      if (year) query = query.eq('year', parseInt(year))
      if (month) query = query.eq('month', parseInt(month))
      if (employee_id) query = query.eq('employee_id', employee_id)

      query = query.range(offset, offset + limit - 1).order('generated_at', { ascending: false })

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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // GET /api/monthly-timesheets/:id AND /api/monthly-timesheets/:id/details
    if (req.method === 'GET' && action) {
      const id = action
      const isDetails = params[1] === 'details'

      const { data: timesheet, error: tsErr } = await supabase
        .from('monthly_timesheets')
        .select('*')
        .eq('id', id)
        .single()

      if (tsErr || !timesheet) {
        return new Response(
          JSON.stringify({ error: 'NOT_FOUND', message: 'Folha não encontrada' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      if (!isDetails) {
        return new Response(JSON.stringify(timesheet), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Se for /details, gerar o detalhamento diário usando calculate_daily_hours
      const daysInMonth = new Date(timesheet.year, timesheet.month, 0).getDate()
      const promises = []

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${timesheet.year}-${String(timesheet.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        promises.push(
          supabase
            .rpc('calculate_daily_hours', {
              p_organization_id: timesheet.organization_id,
              p_employee_id: timesheet.employee_id,
              p_date: dateStr,
            })
            .then((res) => res.data),
        )
      }

      const dailyBreakdown = await Promise.all(promises)

      // Filtrar resultados nulos ou com erro do RPC
      const validBreakdown = dailyBreakdown.filter(Boolean)
      validBreakdown.sort((a: any, b: any) => a.date.localeCompare(b.date))

      return new Response(
        JSON.stringify({
          id: timesheet.id,
          employee_id: timesheet.employee_id,
          year: timesheet.year,
          month: timesheet.month,
          daily_breakdown: validBreakdown,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Internal Server Error:', error)
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Erro interno no servidor',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
