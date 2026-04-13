import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.22.4'
import { corsHeaders } from '../_shared/cors.ts'
import { calculateBalance, daysBetween } from '../_shared/vacations.ts'

const requestSchema = z
  .object({
    employee_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    type: z.enum(['Gozar', 'Vender']).default('Gozar'),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'A data final deve ser posterior ou igual à data inicial',
  })

const updateSchema = z.object({
  status: z.enum(['Aprovado', 'Rejeitado']),
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
    } = await supabase.auth.getUser()

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const functionIndex = pathParts.indexOf('vacation-requests')
    const paramId = pathParts[functionIndex + 1]

    if (req.method === 'GET' && paramId) {
      const { data, error } = await supabase
        .from('vacation_requests')
        .select('*')
        .eq('employee_id', paramId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST' && !paramId) {
      const body = await req.json()
      const parsed = requestSchema.safeParse(body)
      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { employee_id, start_date, end_date, type } = parsed.data

      try {
        const balance = await calculateBalance(supabase, employee_id)

        if (balance.months_worked < 12) {
          return new Response(
            JSON.stringify({ error: 'Colaborador não atingiu 12 meses de contratação' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }

        const requestedDays = daysBetween(start_date, end_date)
        if (requestedDays > balance.available) {
          return new Response(JSON.stringify({ error: 'Saldo insuficiente para este período' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const { data: overlaps, error: overlapErr } = await supabase
          .from('vacation_requests')
          .select('id')
          .eq('employee_id', employee_id)
          .in('status', ['Aprovado', 'Pendente'])
          .lte('start_date', end_date)
          .gte('end_date', start_date)

        if (overlapErr) throw overlapErr
        if (overlaps && overlaps.length > 0) {
          return new Response(JSON.stringify({ error: 'Período sobrepõe férias já aprovadas' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        const { data, error } = await supabase
          .from('vacation_requests')
          .insert({
            employee_id,
            start_date,
            end_date,
            type,
            status: 'Pendente',
          })
          .select()
          .single()

        if (error) throw error
        return new Response(JSON.stringify({ data, success: true }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (err: any) {
        if (err.message === 'Colaborador não encontrado') {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        throw err
      }
    }

    if (req.method === 'PUT' && paramId) {
      const body = await req.json()
      const parsed = updateSchema.safeParse(body)
      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: 'Dados inválidos', details: parsed.error.errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { status } = parsed.data

      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('perfil')
        .eq('id', user?.id)
        .single()
      if (!userProfile || userProfile.perfil !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Acesso negado: Apenas RH pode aprovar ou rejeitar' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const updateData: any = { status }
      if (status === 'Aprovado') {
        updateData.approved_by = user?.id
        updateData.approval_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updateData)
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
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
