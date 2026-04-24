import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Tratamento de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const url = new URL(req.url)
    const phone = url.searchParams.get('phone')
    const instance_id = url.searchParams.get('instance_id')
    const limitStr = url.searchParams.get('limit')
    const offsetStr = url.searchParams.get('offset')

    // Validação de dados de entrada obrigatórios
    if (!phone || !instance_id) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'phone and instance_id are required parameters',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Paginação
    let limit = limitStr ? parseInt(limitStr, 10) : 50
    if (isNaN(limit) || limit < 1) limit = 50
    if (limit > 100) limit = 100

    let offset = offsetStr ? parseInt(offsetStr, 10) : 0
    if (isNaN(offset) || offset < 0) offset = 0

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Inicialização do cliente Supabase para verificar a autenticação (RLS)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Buscar o chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('phone', phone)
      .eq('instance_id', instance_id)
      .maybeSingle()

    if (chatError) {
      console.error('Error fetching chat:', chatError)
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: 'Database error fetching chat' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Se o chat não for encontrado, retornar resposta limpa sem falhar
    if (!chat) {
      return new Response(
        JSON.stringify({
          success: true,
          chat: null,
          messages: [],
          pagination: {
            limit,
            offset,
            total: 0,
            hasMore: false,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 2. Buscar as mensagens do chat
    const {
      data: messages,
      error: messagesError,
      count,
    } = await supabase
      .from('messages')
      .select('id, content, direction, status, timestamp', { count: 'exact' })
      .eq('chat_id', chat.id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'Database error fetching messages',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const total = count || 0
    const hasMore = offset + (messages?.length || 0) < total

    // 3. Resposta formatada de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        chat: {
          id: chat.id,
          phone: chat.phone,
          instance_id: chat.instance_id,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
        },
        messages: messages || [],
        pagination: {
          limit,
          offset,
          total,
          hasMore,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Internal Server Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
