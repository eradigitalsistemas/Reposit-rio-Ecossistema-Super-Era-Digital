import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

async function generateAdminNotifications(supabase: any, adminId: string) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const in30Days = new Date(today)
  in30Days.setDate(in30Days.getDate() + 30)
  const in30DaysStr = in30Days.toISOString().split('T')[0]

  const in7Days = new Date(today)
  in7Days.setDate(in7Days.getDate() + 7)
  const in7DaysStr = in7Days.toISOString().split('T')[0]

  const newNotifs: any[] = []

  // 1. Vacation expiration (vacation_balance)
  const { data: balances } = await supabase
    .from('vacation_balance')
    .select('id, employee_id, expiration_date, days_remaining, employees(personal_data)')
    .gt('days_remaining', 0)
    .lte('expiration_date', in30DaysStr)
    .gte('expiration_date', todayStr)

  if (balances) {
    for (const b of balances) {
      const empName = b.employees?.personal_data?.nome || 'Colaborador'
      newNotifs.push({
        usuario_id: adminId,
        titulo: 'Vencimento de Férias',
        mensagem: `As férias de ${empName} vencem em ${b.expiration_date}. Restam ${b.days_remaining} dias.`,
        tipo: 'vencimento',
        referencia_id: `vacation_${b.id}`,
      })
    }
  }

  // 2. Experience period ending (employees)
  const { data: empsExp } = await supabase
    .from('employees')
    .select('id, personal_data, experience_end_date')
    .eq('status', 'Ativo')
    .lte('experience_end_date', in7DaysStr)
    .gte('experience_end_date', todayStr)

  if (empsExp) {
    for (const e of empsExp) {
      const empName = e.personal_data?.nome || 'Colaborador'
      newNotifs.push({
        usuario_id: adminId,
        titulo: 'Fim do Período de Experiência',
        mensagem: `O período de experiência de ${empName} termina em ${e.experience_end_date}.`,
        tipo: 'alerta',
        referencia_id: `experience_${e.id}`,
      })
    }
  }

  // 3. Missing docs (employees + documents)
  const { data: empsDocs } = await supabase
    .from('employees')
    .select('id, personal_data, hire_date')
    .eq('status', 'Ativo')

  if (empsDocs) {
    const mandatory = ['RG', 'CPF', 'Comprovante de Residência', 'Carteira de Trabalho']

    const activeIds = empsDocs.map((e: any) => e.id)
    if (activeIds.length > 0) {
      const { data: allDocs } = await supabase
        .from('documents')
        .select('employee_id, document_type')
        .in('employee_id', activeIds)

      const docsByEmp: Record<string, string[]> = {}
      if (allDocs) {
        for (const d of allDocs) {
          if (!docsByEmp[d.employee_id]) docsByEmp[d.employee_id] = []
          docsByEmp[d.employee_id].push(d.document_type)
        }
      }

      for (const e of empsDocs) {
        const existingDocs = docsByEmp[e.id] || []
        const missing = mandatory.filter((m) => !existingDocs.includes(m))

        if (missing.length > 0) {
          const empName = e.personal_data?.nome || 'Colaborador'
          newNotifs.push({
            usuario_id: adminId,
            titulo: 'Documentação Pendente',
            mensagem: `${empName} possui documentos pendentes: ${missing.join(', ')}`,
            tipo: 'alerta',
            referencia_id: `missing_docs_${e.id}`,
          })
        }
      }
    }
  }

  // 4. Frequent delays (time_entries)
  const currentYearMonth = todayStr.substring(0, 7)
  const startDateMonth = `${currentYearMonth}-01`
  const endDateMonth = `${currentYearMonth}-31`

  const { data: entries } = await supabase
    .from('time_entries')
    .select('employee_id, delay, employees(personal_data)')
    .gt('delay', 0)
    .gte('date', startDateMonth)
    .lte('date', endDateMonth)

  if (entries) {
    const delaysByEmp: Record<string, { count: number; name: string }> = {}
    for (const t of entries) {
      if (!delaysByEmp[t.employee_id]) {
        delaysByEmp[t.employee_id] = {
          count: 0,
          name: t.employees?.personal_data?.nome || 'Colaborador',
        }
      }
      delaysByEmp[t.employee_id].count += 1
    }

    for (const [empId, info] of Object.entries(delaysByEmp)) {
      if (info.count >= 3) {
        newNotifs.push({
          usuario_id: adminId,
          titulo: 'Atrasos Frequentes',
          mensagem: `${info.name} teve ${info.count} atrasos neste mês.`,
          tipo: 'alerta',
          referencia_id: `delays_${empId}_${currentYearMonth}`,
        })
      }
    }
  }

  if (newNotifs.length > 0) {
    await supabase
      .from('notificacoes')
      .upsert(newNotifs, { onConflict: 'usuario_id, referencia_id', ignoreDuplicates: true })
  }
}

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
    const functionIndex = pathParts.indexOf('notifications')

    if (functionIndex === -1) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const paramId = pathParts[functionIndex + 1]

    if (!paramId) {
      return new Response(JSON.stringify({ error: 'Parâmetro não informado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('id, perfil')
        .eq('id', paramId)
        .maybeSingle()

      if (!userProfile) {
        return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (userProfile.perfil === 'admin') {
        await generateAdminNotifications(supabase, paramId)
      }

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', paramId)
        .order('lida', { ascending: true })
        .order('data_criacao', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'PUT') {
      const { data: existing, error: errExist } = await supabase
        .from('notificacoes')
        .select('id')
        .eq('id', paramId)
        .maybeSingle()
      if (errExist || !existing) {
        return new Response(JSON.stringify({ error: 'Notificação não encontrada' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', paramId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ data, success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Método não permitido ou rota inválida' }), {
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
