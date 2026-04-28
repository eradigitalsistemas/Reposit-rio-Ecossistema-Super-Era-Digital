import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log(JSON.stringify({ stage: 'auth_failed', error: 'Authorization header missing' }));
      return new Response(JSON.stringify({ success: false, error: 'Authorization header missing' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.log(JSON.stringify({ stage: 'auth_failed', error: authError?.message || 'Invalid token' }));
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    const { instance_id, phone, message } = body;
    if (!instance_id || !phone || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Fetch instance
    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('id, instance_id, instance_name, user_id, status, config')
      .eq('instance_id', instance_id)
      .single();
    if (instanceError || !instance) {
      return new Response(JSON.stringify({ success: false, error: 'Instance not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Resolve base URL
    const baseUrl = (instance.config?.base_url || Deno.env.get('UAZAPI_URL') || '').replace(/\/+$/, '');

    // Normalize phone - CORREÇÃO BUG 2 APLICADA ABAIXO
    const cleanPhone = phone.replace(/[^0-9]/g, ''); 
    const remoteJid = phone.includes('@') ? phone : `${cleanPhone}@s.whatsapp.net`;

    // Resolve contact
    let { data: contact } = await supabase
      .from('whatsapp_contacts')
      .select('id')
      .eq('remote_jid', remoteJid)
      .eq('instance_id', instance.instance_id)
      .single();

    if (!contact) {
      const { error: contactInsertError } = await supabase.from('whatsapp_contacts').insert({
        instance_id: instance.instance_id,
        remote_jid: remoteJid,
        phone_number: cleanPhone,
        push_name: cleanPhone,
        user_id: user.id,
      });
      
      ({ data: contact } = await supabase
        .from('whatsapp_contacts')
        .select('id')
        .eq('remote_jid', remoteJid)
        .eq('instance_id', instance.instance_id)
        .single());
    }

    const correlationId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    // Insert message
    const { data: insertedMsg, error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: correlationId,
        correlation_id: correlationId,
        instance_id: instance.instance_id,
        contact_id: contact.id,
        from_me: true,
        type: 'text',
        text: message,
        status: 'pending',
        timestamp: nowIso,
        user_id: user.id,
      })
      .select('id')
      .single();

    // Call uazapi
    const res = await fetch(`${baseUrl}/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: instance.instance_id,
      },
      body: JSON.stringify({ number: cleanPhone, text: message }),
    });

    if (res.ok) {
      const uazapiResponse = await res.json();
      const messageId = uazapiResponse?.id || correlationId;
      await supabase
        .from('whatsapp_messages')
        .update({ status: 'sent', message_id: messageId })
        .eq('correlation_id', correlationId);

      return new Response(JSON.stringify({ success: true, status: 'sent' }), {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'uazapi rejected' }), {
        status: 502,
        headers: corsHeaders,
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});