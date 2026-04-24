import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')

    // 1. VALIDAÇÃO DE SEGURANÇA
    if (!token || token !== webhookSecret) {
      console.error('Invalid token or missing Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let payload
    try {
      payload = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Bad Request', message: 'Payload JSON inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { phone, message, instance_id, timestamp, messageId } = payload

    // 2. VALIDAÇÃO DE DADOS
    if (!phone || !message || !instance_id) {
      console.error('Missing required fields:', { phone, message, instance_id })
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Campos obrigatórios: phone, message, instance_id',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Processing inbound message for phone: ${phone}, instance: ${instance_id}`)

    // 3. PROCESSAMENTO
    let chat_id: string

    // Busca chat existente
    const { data: existingChat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('phone', phone)
      .eq('instance_id', instance_id)
      .maybeSingle()

    if (chatError) {
      console.error('Error fetching chat:', chatError)
      throw new Error('Database error fetching chat')
    }

    if (existingChat) {
      chat_id = existingChat.id
      console.log(`Found existing chat: ${chat_id}`)
    } else {
      // a) Cria novo chat
      const { data: newChat, error: createChatError } = await supabase
        .from('chats')
        .insert({ phone, instance_id })
        .select('id')
        .single()

      if (createChatError) {
        console.error('Error creating chat:', createChatError)
        throw new Error('Database error creating chat')
      }
      chat_id = newChat.id
      console.log(`Created new chat: ${chat_id}`)

      // b) Cria contato se não existir
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('phone', phone)
        .maybeSingle()

      if (!existingContact) {
        const { error: createContactError } = await supabase
          .from('contacts')
          .insert({ phone, instance_id })

        if (createContactError) {
          console.error('Error creating contact:', createContactError)
        } else {
          console.log(`Created new contact for phone: ${phone}`)
        }
      }
    }

    // Insere mensagem em "messages"
    // Nota: O status 'pending' é utilizado para respeitar a constraint CHECK do banco (in 'pending', 'sent', 'read', 'failed')
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id,
        content: message,
        direction: 'inbound',
        status: 'pending',
        timestamp: timestamp || new Date().toISOString(),
      })
      .select('id, timestamp')
      .single()

    if (messageError) {
      console.error('Error inserting message:', messageError)
      throw new Error('Database error inserting message')
    }

    console.log(`Inserted message successfully: ${newMessage.id}`)

    // 4. ATUALIZAÇÃO DE STATUS DO CONTATO
    const { error: updateContactError } = await supabase
      .from('contacts')
      .update({
        is_online: true,
        last_seen: new Date().toISOString(),
      })
      .eq('phone', phone)

    if (updateContactError) {
      console.error('Error updating contact status:', updateContactError)
    }

    // 5. REGISTRO DE LOG (Confirmação de disparo para UI)
    await supabase.from('sync_logs').insert({
      entity_type: 'webhook_receive',
      entity_id: newMessage.id,
      status: 'success',
      error_message: null,
    })

    // 6. RESPOSTA DE SUCESSO
    return new Response(
      JSON.stringify({
        success: true,
        messageId: newMessage.id,
        chatId: chat_id,
        timestamp: newMessage.timestamp,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error: any) {
    console.error('Internal Server Error:', error)

    // Tenta registrar o erro no log se possível (não aguarda para não travar)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (supabaseUrl && supabaseServiceKey) {
      const sb = createClient(supabaseUrl, supabaseServiceKey)
      sb.from('sync_logs')
        .insert({
          entity_type: 'webhook_receive',
          entity_id: 'error',
          status: 'failed',
          error_message: error.message || 'Internal Server Error',
        })
        .then()
    }

    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: 'Falha ao processar mensagem' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
