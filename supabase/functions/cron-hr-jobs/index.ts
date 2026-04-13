import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastErr
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw lastErr
}

async function logExecution(
  jobName: string,
  status: string,
  recordsProcessed: number,
  errors: any[],
) {
  await supabase.from('cron_logs').insert({
    job_name: jobName,
    status,
    records_processed: recordsProcessed,
    errors: JSON.stringify(errors),
    completed_at: new Date().toISOString(),
  })
}

// Job 1: Cálculo diário de férias
async function calculateVacations() {
  let processed = 0
  let errors = []
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .in('status', ['Ativo', 'Em Experiência'])

    if (error) throw error

    const today = new Date()
    const currentYear = today.getUTCFullYear()
    const currentMonth = today.getUTCMonth()
    const currentDay = today.getUTCDate()

    for (const emp of employees || []) {
      try {
        const hireDate = new Date(emp.hire_date)
        const hireYear = hireDate.getUTCFullYear()
        let years = currentYear - hireYear

        if (
          currentMonth < hireDate.getUTCMonth() ||
          (currentMonth === hireDate.getUTCMonth() && currentDay < hireDate.getUTCDate())
        ) {
          years--
        }

        if (years > 0) {
          for (let y = 1; y <= years; y++) {
            const targetYear = hireYear + y
            const { data: existing } = await supabase
              .from('vacation_balance')
              .select('id')
              .eq('employee_id', emp.id)
              .eq('year', targetYear)
              .single()

            if (!existing) {
              const expirationDate = new Date(hireDate)
              expirationDate.setUTCFullYear(targetYear + 1)

              await withRetry(() =>
                supabase.from('vacation_balance').insert({
                  employee_id: emp.id,
                  year: targetYear,
                  days_accrued: 30,
                  days_remaining: 30,
                  days_used: 0,
                  expiration_date: expirationDate.toISOString().split('T')[0],
                }),
              )
              processed++
            }
          }
        }
      } catch (err: any) {
        errors.push({ employee_id: emp.id, error: err.message })
      }
    }
    await logExecution(
      'calculate_vacations',
      errors.length > 0 ? 'partial_success' : 'success',
      processed,
      errors,
    )
  } catch (err: any) {
    await logExecution('calculate_vacations', 'failed', processed, [err.message])
  }
}

// Job 2: Notificação de vencimento de férias
async function notifyVacationExpiration() {
  let processed = 0
  let errors = []
  try {
    const today = new Date()
    const future30 = new Date(today)
    future30.setUTCDate(today.getUTCDate() + 30)
    const future30Str = future30.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    const { data: balances, error } = await supabase
      .from('vacation_balance')
      .select('*, employees!inner(department_id, status)')
      .gt('days_remaining', 0)
      .lte('expiration_date', future30Str)
      .gte('expiration_date', todayStr)

    if (error) throw error

    const activeBalances =
      balances?.filter((b: any) => ['Ativo', 'Em Experiência'].includes(b.employees?.status)) || []

    for (const bal of activeBalances) {
      try {
        const refId = `vacation_exp_${bal.id}_30d`
        const { data: existing } = await supabase
          .from('notificacoes')
          .select('id')
          .eq('referencia_id', refId)
          .single()

        if (!existing) {
          const { data: admins } = await supabase
            .from('usuarios')
            .select('id')
            .eq('perfil', 'admin')
          const adminIds = admins?.map((a) => a.id) || []

          let managerId = null
          if (bal.employees?.department_id) {
            const { data: dept } = await supabase
              .from('departments')
              .select('manager_id')
              .eq('id', bal.employees.department_id)
              .single()
            managerId = dept?.manager_id
          }

          const notifyIds = new Set([...adminIds, ...(managerId ? [managerId] : [])])

          for (const uid of notifyIds) {
            await withRetry(() =>
              supabase.from('notificacoes').insert({
                usuario_id: uid,
                titulo: 'Férias Vencendo',
                mensagem: `As férias do colaborador ID ${bal.employee_id} (Ano ${bal.year}) vencem em ${bal.expiration_date}.`,
                tipo: 'alerta',
                referencia_id: refId,
              }),
            )
            processed++
          }
        }
      } catch (err: any) {
        errors.push({ balance_id: bal.id, error: err.message })
      }
    }
    await logExecution(
      'notify_vacation_expiration',
      errors.length > 0 ? 'partial_success' : 'success',
      processed,
      errors,
    )
  } catch (err: any) {
    await logExecution('notify_vacation_expiration', 'failed', processed, [err.message])
  }
}

// Job 3: Notificação de período de experiência
async function notifyProbationEnding() {
  let processed = 0
  let errors = []
  try {
    const today = new Date()
    const future7 = new Date(today)
    future7.setUTCDate(today.getUTCDate() + 7)
    const future7Str = future7.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, experience_end_date, department_id')
      .in('status', ['Ativo', 'Em Experiência'])
      .lte('experience_end_date', future7Str)
      .gte('experience_end_date', todayStr)

    if (error) throw error

    for (const emp of employees || []) {
      try {
        const refId = `probation_end_${emp.id}_7d`
        const { data: existing } = await supabase
          .from('notificacoes')
          .select('id')
          .eq('referencia_id', refId)
          .single()

        if (!existing) {
          const { data: admins } = await supabase
            .from('usuarios')
            .select('id')
            .eq('perfil', 'admin')
          const adminIds = admins?.map((a) => a.id) || []

          let managerId = null
          if (emp.department_id) {
            const { data: dept } = await supabase
              .from('departments')
              .select('manager_id')
              .eq('id', emp.department_id)
              .single()
            managerId = dept?.manager_id
          }

          const notifyIds = new Set([...adminIds, ...(managerId ? [managerId] : [])])

          for (const uid of notifyIds) {
            await withRetry(() =>
              supabase.from('notificacoes').insert({
                usuario_id: uid,
                titulo: 'Período de Experiência Terminando',
                mensagem: `O período de experiência do colaborador ID ${emp.id} termina em ${emp.experience_end_date}.`,
                tipo: 'alerta',
                referencia_id: refId,
              }),
            )
            processed++
          }
        }
      } catch (err: any) {
        errors.push({ employee_id: emp.id, error: err.message })
      }
    }
    await logExecution(
      'notify_probation_ending',
      errors.length > 0 ? 'partial_success' : 'success',
      processed,
      errors,
    )
  } catch (err: any) {
    await logExecution('notify_probation_ending', 'failed', processed, [err.message])
  }
}

// Job 4: Notificação de documentação faltando
async function notifyMissingDocs() {
  let processed = 0
  let errors = []
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, documents(id, status)')
      .in('status', ['Ativo', 'Em Experiência'])

    if (error) throw error

    for (const emp of employees || []) {
      try {
        // @ts-ignore
        const docs = emp.documents || []
        const hasMissing =
          docs.length === 0 ||
          docs.some((d: any) => d.status === 'Pendente' || d.status === 'Vencido')

        if (hasMissing) {
          const refId = `missing_docs_${emp.id}`

          const { data: existing } = await supabase
            .from('notificacoes')
            .select('id')
            .eq('referencia_id', refId)
            .single()

          if (!existing) {
            const { data: admins } = await supabase
              .from('usuarios')
              .select('id')
              .eq('perfil', 'admin')
            const adminIds = admins?.map((a) => a.id) || []

            for (const uid of adminIds) {
              await withRetry(() =>
                supabase.from('notificacoes').insert({
                  usuario_id: uid,
                  titulo: 'Documentação Pendente',
                  mensagem: `O colaborador ID ${emp.id} possui documentação pendente, vencida ou inexistente.`,
                  tipo: 'alerta',
                  referencia_id: refId,
                }),
              )
              processed++
            }
          }
        }
      } catch (err: any) {
        errors.push({ employee_id: emp.id, error: err.message })
      }
    }
    await logExecution(
      'notify_missing_docs',
      errors.length > 0 ? 'partial_success' : 'success',
      processed,
      errors,
    )
  } catch (err: any) {
    await logExecution('notify_missing_docs', 'failed', processed, [err.message])
  }
}

// Job 5: Atualização de status de experiência
async function updateProbationStatus() {
  let processed = 0
  let errors = []
  try {
    const todayStr = new Date().toISOString().split('T')[0]

    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, experience_end_date')
      .eq('status', 'Em Experiência')
      .lt('experience_end_date', todayStr)

    if (error) throw error

    for (const emp of employees || []) {
      try {
        await withRetry(() =>
          supabase.from('employees').update({ status: 'Ativo' }).eq('id', emp.id),
        )
        processed++
      } catch (err: any) {
        errors.push({ employee_id: emp.id, error: err.message })
      }
    }
    await logExecution(
      'update_probation_status',
      errors.length > 0 ? 'partial_success' : 'success',
      processed,
      errors,
    )
  } catch (err: any) {
    await logExecution('update_probation_status', 'failed', processed, [err.message])
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = body.action || 'all'

    if (action === 'midnight' || action === 'all') {
      await calculateVacations()
      await updateProbationStatus()
    }

    if (action === 'morning' || action === 'all') {
      await notifyVacationExpiration()
      await notifyProbationEnding()
      await notifyMissingDocs()
    }

    return new Response(JSON.stringify({ success: true, action }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
