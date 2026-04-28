/*
Supabase Edge Function para receber webhooks da Uazapi (WhatsApp).
Versão v4 (fix timestamptz com ISO strings).
*/

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function normalizeTimestamp(ts: unknown): string {
  try {
    if (ts == null || ts === '') {
      return new Date().toISOString();
    }
    if (typeof ts === 'string' && /^\\d{4}-\\d{2}-\\d{2}T/.test(ts)) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }
    let num: number;
    if (typeof ts === 'number') {
      num = ts;
    } else if (typeof ts === 'string') {
      num = Number(ts);
      if (!isFinite(num) || num <= 0) {
        return new Date().toISOString();
      }
    } else {
      return new Date().toISOString();
    }
    if (num < 9999999999) {
      num *= 1000;
    }
    if (num < 946684800000 || num > 4102444800000) {
      return new Date().toISOString();
    }
    const d = new Date(num);
    if (isNaN(d.getTime())) {
      return new Date().toISOString();
    }
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function cleanPhone(jid: string): string {
  return jid.replace(/[^\\d]/g, '');
}

function extractInstanceName(body: any): string {
  return (body.instanceName || body.instance || '').toString().trim();
}

function extractEventType(body: any): string {
  return (body.EventType || body.event_type || 'unknown').toString().trim();
}

function mapMessageType(raw: string): string {
  const type = raw.toLowerCase();
  if (type.includes('conversation') || type.includes('text')) return 'text';
  if (type.includes('image')) return 'image';
  if (type.includes('audio')) return 'audio';
  if (type.includes('video')) return 'video';
  if (type.includes('document')) return 'document';
  if (type.includes('sticker')) return 'sticker';
  if (type.includes('location')) return 'location';
  return 'unknown';
}

function mapStatus(state: string): string {
  const s = state.toLowerCase();
  switch (s) {
    case 'delivered':
    case 'delivery':
      return 'delivered';
    case 'read':
    case 'receipt':
      return 'read';
    case 'played':
      return 'played';
    case 'sent':
      return 'sent';
    default:
      return 'sent';
  }
}

function extractMediaUrl(message: any): string | null {
  const content = message.content;
  if (typeof content === 'object' && content && content.URL) {
    return content.URL;
  }
  if (typeof content === 'string' && content.startsWith('http')) {
    return content;
  }
  return null;
}

function extractText(message: any): string | null {
  if (message.text) return message.text;
  const content = message.content;
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object' && content.text) return content.text;
  return null;
}

async function processMessage(supabase: any, instance: any, body: any) {
  console.log(JSON.stringify({ stage: 'processMessage_start' }));
  const chat = body.chat;
  const message = body.message;
  if (!message) {
    console.log(JSON.stringify({ stage: 'no_message_ignored' }));
    return;
  }
  const remoteJid = chat?.wa_chatid || message.chatid || '';
  if (!remoteJid) {
    console.log(JSON.stringify({ stage: 'no_remote_jid_ignored' }));
    return;
  }
  const phoneNumber = chat?.phone ? cleanPhone(chat.phone) : cleanPhone(remoteJid);
  const pushName = chat?.wa_contactName || chat?.wa_name || message.senderName || null;
  const profilePicUrl = chat?.imagePreview || null;
  const { data: contact, error: contactError } = await supabase
    .from('whatsapp_contacts')
    .upsert(
      {
        instance_id: instance.instance_id,
        remote_jid: remoteJid,
        push_name: pushName,
        profile_pic_url: profilePicUrl,
        phone_number: phoneNumber,
        is_group: !!chat?.wa_isGroup,
        is_archived: !!chat?.wa_archived,
        is_pinned: !!chat?.wa_isPinned,
        is_blocked: !!chat?.wa_isBlocked,
        user_id: instance.user_id || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'remote_jid' }
    )
    .select('id')
    .single();
  if (contactError || !contact) {
    console.log(JSON.stringify({ stage: 'contact_db_error', error: contactError?.message }));
    return;
  }
  const contactId = contact.id;
  const messageRow = {
    message_id: message.messageid,
    correlation_id: message.id,
    instance_id: instance.instance_id,
    contact_id: contactId,
    from_me: !!message.fromMe,
    type: mapMessageType(message.type || message.messageType || ''),
    text: extractText(message),
    media_url: extractMediaUrl(message),
    media_type: message.mediaType || null,
    media_mime_type: typeof message.content === 'object' ? (message.content?.mimetype || null) : null,
    status: message.fromMe ? 'sent' : '',
    timestamp: normalizeTimestamp(message.messageTimestamp),
    is_read: false,
    sender_phone: cleanPhone(message.sender_pn || message.sender || ''),
    sender_name: message.senderName || null,
    reply_to_message_id: (typeof message.quoted === 'string' && message.quoted) ? message.quoted : null,
    raw_payload: body,
    uazapi_message_id: message.id || null,
    user_id: instance.user_id || null,
    created_at: new Date().toISOString(),
  };
  const { error: msgError } = await supabase
    .from('whatsapp_messages')
    .upsert(messageRow, { onConflict: 'message_id' });
  if (msgError) {
    console.log(JSON.stringify({ stage: 'messages_db_error', error: msgError.message }));
  } else {
    console.log(JSON.stringify({ stage: 'message_persisted' }));
  }
}

async function processMessageUpdate(supabase: any, instance: any, body: any) {
  console.log(JSON.stringify({ stage: 'processMessageUpdate_start' }));
  const event = body.event;
  if (!event) {
    console.log(JSON.stringify({ stage: 'no_event_ignored' }));
    return;
  }
  const state = body.state || event.Type || '';
  const messageIds = event.MessageIDs || [];
  if (!messageIds.length) {
    console.log(JSON.stringify({ stage: 'no_messageIds_ignored' }));
    return;
  }
  const status = mapStatus(state);
  const isRead = status === 'read';
  const { count } = await supabase
    .from('whatsapp_messages')
    .update({ status, is_read: isRead })
    .eq('instance_id', instance.instance_id)
    .in('message_id', messageIds);
  console.log(JSON.stringify({ stage: 'status_updated', count: count ?? 0, status, total: messageIds.length }));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    console.log(JSON.stringify({ stage: 'body_parsed' }));

    const instanceName = extractInstanceName(body);
    const eventType = extractEventType(body);
    console.log(JSON.stringify({ stage: 'normalized', instanceName, eventType }));

    if (!instanceName) {
      console.log(JSON.stringify({ stage: 'instance_validation_failed', instanceName }));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('id, instance_id, user_id')
      .eq('instance_name', instanceName)
      .single();

    if (instanceError || !instance) {
      console.log(JSON.stringify({ stage: 'instance_not_found', instanceName, error: instanceError?.message }));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    supabase
      .from('whatsapp_events')
      .insert({ instance_name: instanceName, event_type: eventType, payload: body })
      .catch((e) => {
        console.log(JSON.stringify({ stage: 'event_insert_error', error: e.message }));
      });

    if (eventType === 'messages') {
      await processMessage(supabase, instance, body);
    } else if (eventType === 'messages_update') {
      await processMessageUpdate(supabase, instance, body);
    } else {
      console.log(JSON.stringify({ stage: 'ignored_event', eventType }));
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log(JSON.stringify({ stage: 'fatal_error', error: (error as Error).message }));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});