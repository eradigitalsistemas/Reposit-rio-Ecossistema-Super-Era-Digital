import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Auth Header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: profile } = await supabaseAdmin
      .from('usuarios')
      .select('perfil')
      .eq('id', user.id)
      .single()
    if (profile?.perfil !== 'admin') throw new Error('Forbidden')

    const { action, payload } = await req.json()

    if (action === 'create_user') {
      const { email, password, name, perfil, telefone } = payload
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, perfil, telefone },
      })
      if (createError) throw createError

      return new Response(JSON.stringify({ user: newAuthUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update_user') {
      const { id, name, perfil, telefone, password } = payload

      const updateData: any = {
        user_metadata: { full_name: name, perfil, telefone },
      }
      if (password) {
        updateData.password = password
      }

      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        updateData,
      )
      if (updateAuthError) throw updateAuthError

      const { error: updateProfileError } = await supabaseAdmin
        .from('usuarios')
        .update({ nome: name, perfil, telefone })
        .eq('id', id)

      if (updateProfileError) throw updateProfileError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete_user') {
      const { id } = payload

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (deleteError) throw deleteError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
