import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.22.4'
import { corsHeaders } from '../_shared/cors.ts'

const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }
  if (record.count >= 10) return false
  record.count++
  return true
}

const sanitizeHtml = (str: string) => {
  if (!str) return str
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const personalSchema = z.object({
  nome: z.string().min(3).max(100).transform(sanitizeHtml),
  email: z
    .string()
    .email('Email inválido. Formato esperado: usuario@dominio.com')
    .max(255)
    .transform(sanitizeHtml),
  telefone: z.string().min(1, 'Telefone é obrigatório').transform(sanitizeHtml),
  data_nascimento: z.string().optional().or(z.literal('')),
  endereco: z.string().min(5).max(200).transform(sanitizeHtml),
  foto_url: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((s) => sanitizeHtml(s || '')),
})

const educationsSchema = z
  .array(
    z.object({
      instituicao: z.string().min(2).max(150).transform(sanitizeHtml),
      curso: z.string().min(2).max(150).transform(sanitizeHtml),
      data_inicio: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
        .refine(
          (d) => new Date(d) >= new Date('1950-01-01') && new Date(d) <= new Date(),
          'Data inicial fora do intervalo',
        ),
      data_fim: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
        .optional()
        .or(z.literal('')),
    }),
  )
  .superRefine((eds, ctx) => {
    eds.forEach((ed, i) => {
      if (ed.data_fim && ed.data_fim !== '') {
        if (new Date(ed.data_fim) < new Date(ed.data_inicio)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'data_fim não pode ser anterior à data de início',
            path: [i, 'data_fim'],
          })
        }
      }
    })
  })

const experiencesSchema = z
  .array(
    z.object({
      empresa: z.string().min(2).max(150).transform(sanitizeHtml),
      cargo: z.string().min(2).max(150).transform(sanitizeHtml),
      data_inicio: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
        .refine(
          (d) => new Date(d) >= new Date('1950-01-01') && new Date(d) <= new Date(),
          'Data inicial fora do intervalo',
        ),
      data_fim: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
        .optional()
        .or(z.literal('')),
      descricao: z
        .string()
        .max(500)
        .optional()
        .transform((s) => sanitizeHtml(s || '')),
    }),
  )
  .superRefine((exps, ctx) => {
    exps.forEach((exp, i) => {
      if (exp.data_fim && exp.data_fim !== '') {
        if (new Date(exp.data_fim) < new Date(exp.data_inicio)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'data_fim não pode ser anterior à data de início',
            path: [i, 'data_fim'],
          })
        }
      }
    })
  })

const discSchema = z.object({
  q1: z.string().min(1).transform(sanitizeHtml),
  q2: z.string().min(1).transform(sanitizeHtml),
  q3: z.string().min(1).transform(sanitizeHtml),
  q4: z.string().min(1).transform(sanitizeHtml),
  q5: z.string().min(1).transform(sanitizeHtml),
  q6: z.string().min(1).transform(sanitizeHtml),
  q7: z.string().min(1).transform(sanitizeHtml),
  q8: z.string().min(1).transform(sanitizeHtml),
  q9: z.string().min(1).transform(sanitizeHtml),
  q10: z.string().min(1).transform(sanitizeHtml),
  q11: z.string().min(1).transform(sanitizeHtml),
  q12: z.string().min(1).transform(sanitizeHtml),
})

const formSchema = z.object({
  personal: personalSchema,
  educations: educationsSchema,
  experiences: experiencesSchema,
  disc: discSchema,
  lgpd: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos de privacidade'),
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`)
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const parsed = formSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.errors[0]?.message || 'Dados inválidos'
      console.warn('Validation failed:', parsed.error.errors)
      return new Response(JSON.stringify({ error: errorMsg, details: parsed.error.errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = parsed.data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.personal.email)
      .maybeSingle()

    let userId = existingUser?.id

    if (userId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          nome: data.personal.nome,
          telefone: data.personal.telefone,
          data_nascimento: data.personal.data_nascimento || null,
          endereco: data.personal.endereco,
          foto_url: data.personal.foto_url || null,
        })
        .eq('id', userId)

      if (updateError) throw new Error(`Failed to update user: ${updateError.message}`)

      await supabase.from('educations').delete().eq('user_id', userId)
      await supabase.from('experiences').delete().eq('user_id', userId)
      await supabase.from('disc_results').delete().eq('user_id', userId)
    } else {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.personal.email,
          nome: data.personal.nome,
          telefone: data.personal.telefone,
          data_nascimento: data.personal.data_nascimento || null,
          endereco: data.personal.endereco,
          foto_url: data.personal.foto_url || null,
        })
        .select()
        .single()

      if (userError || !newUser) throw new Error(`Failed to create user: ${userError?.message}`)
      userId = newUser.id
    }

    if (data.educations.length > 0) {
      await supabase.from('educations').insert(
        data.educations.map((ed: any) => ({
          user_id: userId,
          instituicao: ed.instituicao,
          curso: ed.curso,
          data_inicio: ed.data_inicio,
          data_fim: ed.data_fim || null,
        })),
      )
    }

    if (data.experiences.length > 0) {
      await supabase.from('experiences').insert(
        data.experiences.map((ex: any) => ({
          user_id: userId,
          empresa: ex.empresa,
          cargo: ex.cargo,
          data_inicio: ex.data_inicio,
          data_fim: ex.data_fim || null,
          descricao: ex.descricao || null,
        })),
      )
    }

    let scoreD = 0,
      scoreI = 0,
      scoreS = 0,
      scoreC = 0
    Object.values(data.disc).forEach((answer) => {
      if (answer === 'D') scoreD++
      if (answer === 'I') scoreI++
      if (answer === 'S') scoreS++
      if (answer === 'C') scoreC++
    })

    const scores = [
      { type: 'Dominância (D)', value: scoreD },
      { type: 'Influência (I)', value: scoreI },
      { type: 'Estabilidade (S)', value: scoreS },
      { type: 'Conformidade (C)', value: scoreC },
    ]
    scores.sort((a, b) => b.value - a.value)

    let tipoPerfil = scores[0].type
    if (scores[0].value === scores[1].value) {
      tipoPerfil = `${scores[0].type} / ${scores[1].type}`
    }

    await supabase.from('disc_results').insert({
      user_id: userId,
      tipo_perfil: tipoPerfil,
      pontuacao_d: scoreD,
      pontuacao_i: scoreI,
      pontuacao_s: scoreS,
      pontuacao_c: scoreC,
    })

    // Integração com Banco de Talentos
    const { error: candidateError } = await supabase.from('candidates').upsert(
      {
        email: data.personal.email,
        name: data.personal.nome,
        profession: data.experiences[0]?.cargo || 'Não informado',
        resume_data: {
          personal: data.personal,
          educations: data.educations,
          experiences: data.experiences,
          disc: data.disc,
        },
        disc_result: {
          type: tipoPerfil,
          scores: scores,
        },
        status: 'Novo',
      },
      { onConflict: 'email' },
    )

    if (candidateError) {
      console.error('Falha ao integrar com banco de talentos:', candidateError)
    }

    // Processamento paralelo para envio de e-mails / sincronização externa adicional
    try {
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          user_id: userId,
          email: data.personal.email,
          nome: data.personal.nome,
        }),
      }).catch((err) => console.error('Background fetch process-resume failed:', err))
    } catch (err) {
      console.error('Failed to trigger process-resume:', err)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: 'Currículo validado e integrado ao Banco de Talentos com sucesso',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Internal Server Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro interno no servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
