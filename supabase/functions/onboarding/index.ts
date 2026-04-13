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
    const functionIndex = pathParts.indexOf('onboarding')

    if (functionIndex === -1) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const employee_id = pathParts[functionIndex + 1]
    const subAction = pathParts[functionIndex + 2]
    const taskId = pathParts[functionIndex + 3]

    if (!employee_id) {
      return new Response(JSON.stringify({ error: 'ID do colaborador não informado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /onboarding/:employee_id
    if (req.method === 'POST' && !subAction) {
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employee_id)
        .single()
      if (empErr || !emp) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (emp.status !== 'Ativo') {
        return new Response(JSON.stringify({ error: 'Colaborador não está ativo' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: existing, error: extErr } = await supabase
        .from('onboarding_checklist')
        .select('id')
        .eq('employee_id', employee_id)
        .limit(1)
      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({ error: 'Checklist já existe' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const tasks = [
        { employee_id, task_id: 'email', task_name: 'Criar email corporativo' },
        { employee_id, task_id: 'user', task_name: 'Criar usuário no sistema' },
        { employee_id, task_id: 'equip', task_name: 'Entregar equipamento' },
        { employee_id, task_id: 'contract', task_name: 'Assinatura de contrato' },
        { employee_id, task_id: 'exam', task_name: 'Exame admissional' },
      ]

      const { data: inserted, error: insErr } = await supabase
        .from('onboarding_checklist')
        .insert(tasks)
        .select()
      if (insErr) throw insErr

      let experienceEndDate = emp.experience_end_date
      if (!experienceEndDate && emp.hire_date) {
        const hireDate = new Date(`${emp.hire_date}T12:00:00Z`)
        hireDate.setDate(hireDate.getDate() + 90)
        experienceEndDate = hireDate.toISOString().split('T')[0]
        await supabase
          .from('employees')
          .update({ experience_end_date: experienceEndDate })
          .eq('id', employee_id)
      }

      return new Response(
        JSON.stringify({ data: inserted, experience_end_date: experienceEndDate, success: true }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // GET /onboarding/:employee_id
    if (req.method === 'GET' && !subAction) {
      const { data, error } = await supabase
        .from('onboarding_checklist')
        .select('*')
        .eq('employee_id', employee_id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PUT /onboarding/:employee_id/tasks/:task_id
    if (req.method === 'PUT' && subAction === 'tasks' && taskId) {
      const body = await req.json()
      const completed = body.completed === true
      let completed_at = new Date()

      if (body.completed_at) {
        const parsedDate = new Date(body.completed_at)
        if (isNaN(parsedDate.getTime())) {
          return new Response(JSON.stringify({ error: 'Data inválida' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        completed_at = parsedDate
      }

      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('hire_date')
        .eq('id', employee_id)
        .single()
      if (empErr || !emp) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (completed && emp.hire_date) {
        const hireDate = new Date(`${emp.hire_date}T00:00:00Z`)
        if (completed_at < hireDate) {
          return new Response(
            JSON.stringify({
              error: 'Data de conclusão não pode ser anterior a data de contratação',
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
      }

      const { data: task, error: taskErr } = await supabase
        .from('onboarding_checklist')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('id', taskId)
        .single()
      if (taskErr || !task) {
        return new Response(JSON.stringify({ error: 'Tarefa não encontrada' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: updated, error: updErr } = await supabase
        .from('onboarding_checklist')
        .update({
          completed,
          completed_at: completed ? completed_at.toISOString() : null,
          assigned_to: completed ? user.id : null,
        })
        .eq('id', taskId)
        .select()
        .single()

      if (updErr) throw updErr

      return new Response(JSON.stringify({ data: updated, success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /onboarding/:employee_id/documents
    if (req.method === 'GET' && subAction === 'documents') {
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employee_id)
        .single()
      if (empErr || !emp) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: docs, error: docsErr } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', employee_id)
      if (docsErr) throw docsErr

      const mandatoryTypes = ['RG', 'CPF', 'Comprovante de Residência', 'Carteira de Trabalho']
      const existingTypes = docs.map((d) => d.document_type)
      const missingDocs = mandatoryTypes.filter((t) => !existingTypes.includes(t))

      let experienceAlert = false
      let daysToExperienceEnd = null

      if (emp.experience_end_date) {
        const today = new Date()
        const expDate = new Date(`${emp.experience_end_date}T12:00:00Z`)
        const diffTime = expDate.getTime() - today.getTime()
        daysToExperienceEnd = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (daysToExperienceEnd <= 7 && daysToExperienceEnd >= 0) {
          experienceAlert = true
        }
      }

      return new Response(
        JSON.stringify({
          documents: docs,
          missing_mandatory_documents: missingDocs,
          document_alert: missingDocs.length > 0,
          experience_period: {
            end_date: emp.experience_end_date,
            days_remaining: daysToExperienceEnd,
            alert: experienceAlert,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
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
