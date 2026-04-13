import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'zod'
import { corsHeaders } from '../_shared/cors.ts'
import { isValidCPF } from '../_shared/validations.ts'

const personalDataSchema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    telefone: z.string().optional(),
  })
  .passthrough()

const employeeSchema = z.object({
  cpf: z.string().refine(isValidCPF, 'CPF inválido'),
  rg: z.string().optional().nullable(),
  personal_data: personalDataSchema,
  professional_data: z.record(z.any()).optional().nullable(),
  salary: z.number().positive('Salário deve ser positivo').optional().nullable(),
  department_id: z.string().uuid('Departamento inválido').optional().nullable(),
  status: z.enum(['Ativo', 'Afastado', 'Demitido', 'Em Experiência']).default('Ativo'),
  hire_date: z.string().refine((date) => {
    // Treat date input as midnight UTC to avoid timezone shift on future check
    const hireDate = new Date(`${date}T00:00:00Z`)
    const today = new Date()
    return hireDate <= today
  }, 'Data de contratação não pode ser no futuro'),
  experience_end_date: z.string().optional().nullable(),
  candidate_id: z.string().uuid().optional().nullable(),
})

const updateEmployeeSchema = employeeSchema.partial()

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
    const functionIndex = pathParts.indexOf('employees')
    const id = functionIndex !== -1 ? pathParts[functionIndex + 1] : null

    // GET /employees -> List with pagination and filters
    if (req.method === 'GET' && !id) {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const status = url.searchParams.get('status')
      const department_id = url.searchParams.get('department_id')
      const hire_date = url.searchParams.get('hire_date')

      const offset = (page - 1) * limit

      let query = supabase.from('employees').select('*', { count: 'exact' })

      if (status) query = query.eq('status', status)
      if (department_id) query = query.eq('department_id', department_id)
      if (hire_date) query = query.eq('hire_date', hire_date)

      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      return new Response(JSON.stringify({ data, meta: { total: count, page, limit } }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /employees/:id -> Read one
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase.from('employees').select('*').eq('id', id).single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /employees -> Create
    if (req.method === 'POST' && !id) {
      const body = await req.json()
      const parsed = employeeSchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { data, error } = await supabase.from('employees').insert(parsed.data).select().single()

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Conflito de dados: CPF ou RG já cadastrado' }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        throw error
      }

      await supabase.from('logs_auditoria').insert({
        usuario_id: user.id,
        acao: 'Criação de Colaborador',
        detalhes: `Novo colaborador inserido com sucesso (CPF: ${parsed.data.cpf})`,
        dados_novos: data,
      })

      return new Response(JSON.stringify({ data, success: true }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PUT /employees/:id -> Update
    if (req.method === 'PUT' && id) {
      const body = await req.json()
      const parsed = updateEmployeeSchema.safeParse(body)

      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { data: oldData, error: oldError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()
      if (oldError || !oldData) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('employees')
        .update(parsed.data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Conflito de dados: CPF ou RG já cadastrado' }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
        throw error
      }

      const changedFields: Record<string, { from: any; to: any }> = {}
      for (const key of Object.keys(parsed.data)) {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(data[key])) {
          changedFields[key] = { from: oldData[key], to: data[key] }
        }
      }

      if (Object.keys(changedFields).length > 0) {
        await supabase.from('logs_auditoria').insert({
          usuario_id: user.id,
          acao: 'Alteração de Colaborador',
          detalhes: `Campos alterados: ${Object.keys(changedFields).join(', ')}`,
          dados_anteriores: oldData,
          dados_novos: data,
        })
      }

      return new Response(JSON.stringify({ data, success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /employees/:id -> Soft delete
    if (req.method === 'DELETE' && id) {
      const { data: oldData, error: oldError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()
      if (oldError || !oldData) {
        return new Response(JSON.stringify({ error: 'Colaborador não encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (oldData.status === 'Demitido') {
        return new Response(JSON.stringify({ error: 'Colaborador já está demitido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabase
        .from('employees')
        .update({ status: 'Demitido' })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      await supabase.from('logs_auditoria').insert({
        usuario_id: user.id,
        acao: 'Demissão de Colaborador',
        detalhes: `Status alterado para Demitido (soft delete)`,
        dados_anteriores: oldData,
        dados_novos: data,
      })

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
