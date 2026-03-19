import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Auth Header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { action, cliente_id, document } = await req.json()

    if (!cliente_id) {
      throw new Error('cliente_id is required')
    }

    // Ensure the client exists and get current documents
    const { data: client, error: clientErr } = await supabaseClient
      .from('clientes_externos')
      .select('id, documentos')
      .eq('id', cliente_id)
      .single()

    if (clientErr || !client) {
      throw new Error('Client not found')
    }

    if (action === 'add_metadata') {
      if (!document) throw new Error('Document metadata is required')

      const currentDocs = Array.isArray(client.documentos) ? client.documentos : []
      const updatedDocs = [...currentDocs, document]

      // Update the JSONB column
      const { error: updateErr } = await supabaseClient
        .from('clientes_externos')
        .update({ documentos: updatedDocs })
        .eq('id', cliente_id)

      if (updateErr) throw updateErr

      return new Response(JSON.stringify({ success: true, documentos: updatedDocs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list') {
      return new Response(JSON.stringify({ success: true, documentos: client.documentos || [] }), {
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
