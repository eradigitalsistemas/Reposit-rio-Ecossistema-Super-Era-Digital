import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'zod'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

const candidateSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]{10,20}$/, 'Telefone em formato inválido'),
  salary_expectation: z.number().positive('Pretensão salarial deve ser um número positivo'),
  disc_result: z.enum(['D', 'I', 'S', 'C'], {
    errorMap: () => ({ message: 'Resultado DISC inválido. Valores permitidos: D, I, S, C' }),
  }),
  experience: z.any().optional(),
  education: z.any().optional(),
})

async function verifySignature(secret: string, signature: string, bodyText: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText))
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const expectedSignatureHex = signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return signature === expectedSignatureHex
}

async function handleRequest(
  req: Request,
  requestId: string,
  timestamp: string,
): Promise<Response> {
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')

  const rawBody = await req.text()

  if (webhookSecret) {
    const signature = req.headers.get('x-webhook-signature')
    if (!signature) {
      console.warn(`[${requestId}] Missing signature`)
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const isValid = await verifySignature(webhookSecret, signature, rawBody)
    if (!isValid) {
      console.warn(`[${requestId}] Invalid signature`)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch (e) {
    console.warn(`[${requestId}] Invalid JSON`)
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log(
    `[${requestId}] Received webhook:`,
    JSON.stringify({ timestamp, email: payload.email }),
  )

  const parseResult = candidateSchema.safeParse(payload)
  if (!parseResult.success) {
    console.warn(`[${requestId}] Validation failed:`, parseResult.error.errors)
    return new Response(
      JSON.stringify({
        error: 'Bad Request',
        details: parseResult.error.errors,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  const data = parseResult.data

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: existing, error: searchError } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', data.email)
    .maybeSingle()

  if (searchError) {
    throw new Error(`Database error: ${searchError.message}`)
  }

  if (existing) {
    console.warn(`[${requestId}] Email already exists: ${data.email}`)
    return new Response(
      JSON.stringify({
        error: 'Conflict',
        message: 'Email already exists',
      }),
      {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  const resumeData = {
    phone: data.phone,
    salary_expectation: data.salary_expectation,
    experience: data.experience,
    education: data.education,
  }

  const discResult = {
    result: data.disc_result,
  }

  const { data: newCandidate, error: insertError } = await supabase
    .from('candidates')
    .insert({
      name: data.name,
      email: data.email,
      resume_data: resumeData,
      disc_result: discResult,
      status: 'Novo',
    })
    .select('id')
    .single()

  if (insertError) {
    throw new Error(`Insert error: ${insertError.message}`)
  }

  console.log(`[${requestId}] Successfully created candidate ${newCandidate.id}`)

  return new Response(
    JSON.stringify({
      success: true,
      id: newCandidate.id,
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => {
      reject(new Error('TIMEOUT'))
    }, 25000)
  })

  try {
    return await Promise.race([handleRequest(req, requestId, timestamp), timeoutPromise])
  } catch (error: any) {
    if (error.message === 'TIMEOUT') {
      console.error(`[${requestId}] Request timeout`)
      return new Response(
        JSON.stringify({
          error: 'Service Unavailable',
          message: 'Request processing timed out. Please retry.',
          tracking_id: requestId,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.error(`[${requestId}] Internal Server Error:`, error.message)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        tracking_id: requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
