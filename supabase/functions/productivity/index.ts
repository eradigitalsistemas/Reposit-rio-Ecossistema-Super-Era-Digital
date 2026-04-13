import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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
    const functionIndex = pathParts.indexOf('productivity')

    if (functionIndex === -1) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const type = pathParts[functionIndex + 1] // 'team' or employee_id
    const paramId = pathParts[functionIndex + 2] // department_id if type === 'team'

    const period = url.searchParams.get('period') || 'month'
    const now = new Date()
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    if (period === 'quarter') {
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    let userIdsToQuery: string[] = []
    let employeesData: any[] = []

    if (type === 'team' && paramId) {
      const department_id = paramId
      const { data: employees, error: empErr } = await supabase
        .from('employees')
        .select('id, personal_data')
        .eq('department_id', department_id)
        .eq('status', 'Ativo')

      if (empErr) throw empErr

      if (!employees || employees.length === 0) {
        return new Response(
          JSON.stringify({
            data: {
              closed_demands: 0,
              avg_resolution_time_hours: 0,
              completion_rate: 0,
              employees: [],
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const emails = employees.map((e) => e.personal_data?.email).filter(Boolean)
      if (emails.length > 0) {
        const { data: usuarios, error: usuErr } = await supabase
          .from('usuarios')
          .select('id, email, nome')
          .in('email', emails)
        if (usuErr) throw usuErr
        if (usuarios) {
          userIdsToQuery = usuarios.map((u) => u.id)
          employeesData = usuarios
        }
      }
    } else if (type && type !== 'team') {
      const employee_id = type
      const { data: employee } = await supabase
        .from('employees')
        .select('id, personal_data')
        .eq('id', employee_id)
        .maybeSingle()

      let email = employee?.personal_data?.email

      if (!employee) {
        // Fallback if employee_id passed is actually the auth/usuario id
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('id, email, nome')
          .eq('id', employee_id)
          .maybeSingle()

        if (!usuario) {
          return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        userIdsToQuery = [usuario.id]
        employeesData = [usuario]
      } else if (email) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('id, email, nome')
          .eq('email', email)
          .maybeSingle()

        if (usuario) {
          userIdsToQuery = [usuario.id]
          employeesData = [usuario]
        } else {
          return new Response(
            JSON.stringify({ error: 'Colaborador não possui acesso ao sistema de Kanban' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
      }
    } else {
      return new Response(JSON.stringify({ error: 'Parâmetros inválidos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (userIdsToQuery.length === 0) {
      return new Response(
        JSON.stringify({
          data: {
            closed_demands: 0,
            avg_resolution_time_hours: 0,
            completion_rate: 0,
            employees: [],
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { data: demands, error: demErr } = await supabase
      .from('demandas')
      .select('id, status, data_atribuicao, data_conclusao, responsavel_id')
      .in('responsavel_id', userIdsToQuery)

    if (demErr) throw demErr

    let globalClosedCount = 0
    let globalTotalResolutionTimeMs = 0
    let globalTotalAssigned = 0

    const employeeMetrics = employeesData.map((emp) => {
      const empDemands = (demands || []).filter((d) => d.responsavel_id === emp.id)
      let closedCount = 0
      let totalResolutionTimeMs = 0
      let totalAssigned = 0

      empDemands.forEach((d) => {
        const isClosed = d.status === 'Concluído'
        const closedInPeriod =
          isClosed && d.data_conclusao && new Date(d.data_conclusao) >= startDate
        const assignedInPeriod = d.data_atribuicao && new Date(d.data_atribuicao) >= startDate
        const activeInPeriod = !isClosed || closedInPeriod

        if (activeInPeriod || assignedInPeriod) {
          totalAssigned++
          globalTotalAssigned++
        }

        if (closedInPeriod) {
          closedCount++
          globalClosedCount++
          if (d.data_conclusao && d.data_atribuicao) {
            const resolutionTimeMs =
              new Date(d.data_conclusao).getTime() - new Date(d.data_atribuicao).getTime()
            if (resolutionTimeMs > 0) {
              totalResolutionTimeMs += resolutionTimeMs
              globalTotalResolutionTimeMs += resolutionTimeMs
            }
          }
        }
      })

      return {
        id: emp.id,
        nome: emp.nome,
        email: emp.email,
        closed_demands: closedCount,
        avg_resolution_time_hours:
          closedCount > 0
            ? parseFloat((totalResolutionTimeMs / closedCount / (1000 * 60 * 60)).toFixed(2))
            : 0,
        completion_rate:
          totalAssigned > 0 ? parseFloat(((closedCount / totalAssigned) * 100).toFixed(2)) : 0,
      }
    })

    const result = {
      period,
      start_date: startDate.toISOString(),
      closed_demands: globalClosedCount,
      avg_resolution_time_hours:
        globalClosedCount > 0
          ? parseFloat(
              (globalTotalResolutionTimeMs / globalClosedCount / (1000 * 60 * 60)).toFixed(2),
            )
          : 0,
      completion_rate:
        globalTotalAssigned > 0
          ? parseFloat(((globalClosedCount / globalTotalAssigned) * 100).toFixed(2))
          : 0,
      employees: employeeMetrics,
    }

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
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
