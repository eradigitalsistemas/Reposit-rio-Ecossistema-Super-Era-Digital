import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );

    if (authError || !user) {
      console.error(JSON.stringify({ stage: 'auth_failed', error: authError?.message || 'No user' }));
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(JSON.stringify({ stage: 'auth_validated', userId: user.id }));

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const instance_id = body.instance_id?.trim();
    const phone = body.phone?.trim();
    const message = body.message;
    const media_url = body.media_url;
    const media_type = body.media_type;

    if (!instance_id || !phone || !message) {
      console.error(JSON.stringify({ stage: 'validation_failed', missing: { instance_id: !instance_id, phone: !phone, message: !message } }));
      return new Response(JSON.stringify({ error: 'Missing required fields: instance_id, phone, message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('id, instance_id, instance_name, status, config, user_id')
      .eq('instance_id', instance_id)
      .single();

    if (instanceError || !instance) {
      console.error(JSON.stringify({ stage: 'instance_not_found', instance_id }));
      return new Response(JSON.stringify({ error: 'Instance not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (instance.status !== 'connected') {
      console.error(JSON.stringify({ stage: 'instance_disconnected', instanceId: instance.instance_id, status: instance.status }));
      return new Response(JSON.stringify({ error: 'Instância desconectada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(JSON.stringify({ stage: 'instance_found', instanceId: instance.instance_id, status: instance.status }));

    const baseUrl = (instance.config?.base_url || Deno.env.get('UAZAPI_URL') || '').replace(/[\/]+$/, '');
    if (!baseUrl) {
      console.error(JSON.stringify({ stage: 'base_url_missing' }));
      return new Response(JSON.stringify({ error: 'Base URL not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const remoteJid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;

    const { data: existingContact } = await supabase
      .from('whatsapp_contacts')
      .select('id')
      .eq('instance_id', instance.instance_id)
      .eq('remote_jid', remoteJid)
      .maybeSingle();

    let contactId: string;
    if (!existingContact) {
      const { data: newContact, error: contactInsertError } = await supabase
        .from('whatsapp_contacts')
        .insert({
          instance_id: instance.instance_id,
          remote_jid: remoteJid,
          push_name: phone,
          phone_number: phone,
          user_id: instance.user_id,
        })
        .select('id')
        .single();

      if (contactInsertError || !newContact) {
        console.error(JSON.stringify({ stage: 'contact_insert_failed', error: contactInsertError?.message, remoteJid }));
        return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      contactId = newContact.id;
    } else {
      contactId = existingContact.id;
    }

    console.log(JSON.stringify({ stage: 'contact_resolved', contactId, isNew: !existingContact }));

    const correlationId = crypto.randomUUID();
    const isMedia = !!media_url;
    const msgType = isMedia ? (media_type || 'image') : 'text';
    const timestamp = Math.floor(Date.now() / 1000);

    const { data: pendingMsg, error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: instance.user_id,
        instance_id: instance.instance_id,
        contact_id: contactId,
        remote_jid: remoteJid,
        from_me: true,
        type: msgType,
        text: message,
        media_url: media_url || null,
        media_type: media_type || null,
        status: 'pending',
        correlation_id: correlationId,
        message_id: correlationId,
        timestamp,
      })
      .select('id')
      .single();

    if (insertError || !pendingMsg) {
      console.error(JSON.stringify({ stage: 'message_insert_failed', error: insertError?.message, correlationId }));
      return new Response(JSON.stringify({ error: 'Failed to insert message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(JSON.stringify({ stage: 'message_inserted', messageId: pendingMsg.id, correlationId }));

    const endpoint = isMedia ? `${baseUrl}/send/media` : `${baseUrl}/send/text`;
    const payload = isMedia
      ? { number: phone, type: media_type, file: media_url, text: message }
      : { number: phone, text: message };

    console.log(JSON.stringify({ stage: 'uazapi_call', endpoint, isMedia }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let uazapiRes: Response;
    try {
      uazapiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          token: instance.instance_id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (e: any) {
      clearTimeout(timeoutId);
      const errorMsg = e.name === 'AbortError' ? 'Timeout exceeded' : e.message;
      console.error(JSON.stringify({ stage: 'uazapi_fetch_error', error: errorMsg, correlationId }));
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('correlation_id', correlationId);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: e.name === 'AbortError' ? 503 : 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    clearTimeout(timeoutId);

    console.log(JSON.stringify({ stage: 'uazapi_response', ok: uazapiRes.ok, status: uazapiRes.status, correlationId }));

    let uazapiData: any;
    try {
      uazapiData = await uazapiRes.json();
    } catch {
      uazapiData = {};
    }

    if (!uazapiRes.ok) {
      const errorMsg = uazapiData?.error || uazapiData?.message || 'Erro desconhecido na UAZAPI';
      console.error(JSON.stringify({ stage: 'uazapi_not_ok', error: errorMsg, correlationId }));
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq('correlation_id', correlationId);
      return new Response(
        JSON.stringify({ success: false, error: errorMsg, uazapi_response: uazapiData }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const messageId = uazapiData?.messageId || uazapiData?.id || uazapiData?.key?.id || correlationId;

    const { error: updateError } = await supabase
      .from('whatsapp_messages')
      .update({
        status: 'sent',
        message_id: messageId,
        uazapi_message_id: messageId,
        updated_at: new Date().toISOString(),
      })
      .eq('correlation_id', correlationId);

    if (updateError) {
      console.error(JSON.stringify({ stage: 'update_sent_failed', error: updateError.message, correlationId }));
    }

    return new Response(
      JSON.stringify({ success: true, message_id: pendingMsg.id, uazapi_message_id: messageId, status: 'sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (e: any) {
    console.error(JSON.stringify({ stage: 'uncaught_error', error: e.message }));
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});