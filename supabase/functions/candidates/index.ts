import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'zod'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

const updateCandidateSchema = z.object({
  status: z.enum(['Novo', 'Entrevistado', 'Rejeitado', 'Contratado']).optional(),
  observations: z.string().max(5000, 'Observações não podem exceder 5000 caracteres').optional(),
})

const convertSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional().nullable(),
  department_id: z.string().uuid('Departamento inválido').optional().nullable(),
  salary: z.number().positive('Salário deve ser positivo'),
  hire_date: z.string(),
  personal_data: z.record(z.any()).optional(),
  professional_data: z.record(z.any()).optional(),
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
    const candidatesIndex = pathParts.indexOf('candidates')

    if (candidatesIndex === -1) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const id = pathParts.length > candidatesIndex + 1 ? pathParts[candidatesIndex + 1] : null
    const action = pathParts.length > candidatesIndex + 2 ? pathParts[candidatesIndex + 2] : null

    // GET /candidates -> List with filters, search, pagination
    if (req.method === 'GET' && !id) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const search = url.searchParams.get('search')
      const status = url.searchParams.get('status')
      const start_date = url.searchParams.get('start_date')
      const end_date = url.searchParams.get('end_date')
      const min_salary = parseFloat(url.searchParams.get('min_salary') || '')
      const max_salary = parseFloat(url.searchParams.get('max_salary') || '')
      const profession = url.searchParams.get('profession')
      const sort_by = url.searchParams.get('sort_by') || 'created_at'
      const sort_order = url.searchParams.get('sort_order') || 'desc'

      if (search && search.length < 2) {
        return new Response(
          JSON.stringify({ error: 'Busca muito ampla. Digite pelo menos 2 caracteres.' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const offset = (page - 1) * limit

      let query = supabase.from('candidates').select('*', { count: 'exact' })

      if (status) query = query.eq('status', status)
      if (start_date) query = query.gte('created_at', start_date)
      if (end_date) query = query.lte('created_at', end_date)
      if (profession) query = query.ilike('profession', `%${profession}%`)

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,profession.ilike.%${search}%`,
        )
      }

      query = query.order(sort_by === 'nome' ? 'name' : 'created_at', {
        ascending: sort_order === 'asc',
      })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      let results = data
      if (!isNaN(min_salary) || !isNaN(max_salary)) {
        results = results.filter((c) => {
          const salary = c.resume_data?.salary_expectation || 0
          if (!isNaN(min_salary) && salary < min_salary) return false
          if (!isNaN(max_salary) && salary > max_salary) return false
          return true
        })
      }

      return new Response(JSON.stringify({ data: results, meta: { total: count, page, limit } }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /candidates/:id -> Read complete
    if (req.method === 'GET' && id && !action) {
      const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Candidato não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PUT /candidates/:id -> Update status, observations
    if (req.method === 'PUT' && id && !action) {
      const body = await req.json()
      const parsed = updateCandidateSchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { data: existing, error: findError } = await supabase
        .from('candidates')
        .select('id')
        .eq('id', id)
        .single()
      if (findError || !existing) {
        return new Response(JSON.stringify({ error: 'Candidato não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('candidates')
        .update(parsed.data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      return new Response(JSON.stringify({ data, success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /candidates/:id/convert -> Convert to employee
    if (req.method === 'POST' && id && action === 'convert') {
      const body = await req.json()
      const parsed = convertSchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single()
      if (candidateError || !candidate) {
        return new Response(JSON.stringify({ error: 'Candidato não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .or(`cpf.eq.${parsed.data.cpf}${parsed.data.rg ? `,rg.eq.${parsed.data.rg}` : ''}`)
        .maybeSingle()
      if (existingEmployee) {
        return new Response(
          JSON.stringify({ error: 'Conflito de dados: CPF ou RG já cadastrado' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const employeeData = {
        candidate_id: id,
        cpf: parsed.data.cpf,
        rg: parsed.data.rg,
        department_id: parsed.data.department_id,
        salary: parsed.data.salary,
        hire_date: parsed.data.hire_date,
        personal_data: {
          nome: candidate.name,
          email: candidate.email,
          telefone: candidate.resume_data?.phone || '',
          ...parsed.data.personal_data,
        },
        professional_data: {
          profession: candidate.profession,
          disc_result: candidate.disc_result,
          ...parsed.data.professional_data,
        },
        status: 'Ativo',
      }

      const { data: newEmployee, error: employeeError } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single()
      if (employeeError) {
        if (employeeError.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Conflito de dados: CPF ou RG já cadastrado' }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        throw employeeError
      }

      await supabase.from('candidates').update({ status: 'Contratado' }).eq('id', id)

      await supabase.from('logs_auditoria').insert({
        usuario_id: user.id,
        acao: 'Conversão de Candidato',
        detalhes: `Candidato ${candidate.name} convertido para colaborador (CPF: ${parsed.data.cpf})`,
        dados_novos: newEmployee,
      })

      return new Response(JSON.stringify({ data: newEmployee, success: true }), {
        status: 201,
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
