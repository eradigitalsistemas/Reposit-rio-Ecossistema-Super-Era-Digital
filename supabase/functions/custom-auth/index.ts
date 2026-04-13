import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type, x-cron-secret',
}

const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }
  if (record.count >= 5) return false
  record.count++
  return true
}

import { validatePassword, validateEmail } from '../_shared/validations.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  try {
    const body = await req.json()
    const { action, payload } = body

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

    const logEvent = async (email: string, eventType: string, details: string) => {
      await supabaseAdmin.from('auth_logs').insert({
        ip_address: ip,
        email,
        event_type: eventType,
        details,
      })
    }

    if (action === 'login') {
      const { email, password } = payload

      if (!validateEmail(email)) {
        return new Response(JSON.stringify({ error: 'Email inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!checkRateLimit(ip)) {
        await logEvent(email, 'login_failed', 'Rate limit exceeded')
        return new Response(
          JSON.stringify({ error: 'Muitas tentativas de login. Tente novamente em 1 minuto.' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })

      if (error) {
        await logEvent(email, 'login_failed', error.message)
        return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await logEvent(email, 'login_success', 'User logged in successfully')
      return new Response(JSON.stringify({ session: data.session, user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'register') {
      const { email, password, name, role } = payload

      if (!validateEmail(email)) {
        return new Response(JSON.stringify({ error: 'Email inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!validatePassword(password)) {
        return new Response(
          JSON.stringify({
            error:
              'A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números.',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { data: existingUser } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Email já cadastrado.' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, perfil: role || 'colaborador' },
      })

      if (error) {
        await logEvent(email, 'register_failed', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      await logEvent(email, 'register_success', 'User registered successfully')
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'refresh') {
      const { refresh_token } = payload
      const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token })
      if (error) {
        return new Response(JSON.stringify({ error: 'Token inválido ou expirado' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      return new Response(
        JSON.stringify({
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (action === 'logout') {
      const { email } = payload

      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        })
        await supabaseUser.auth.signOut()
      }

      await logEvent(email || 'unknown', 'logout', 'User logged out')
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
