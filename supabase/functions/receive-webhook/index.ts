/**
 * Supabase Edge Function: receive-webhook v3
 * Recebe webhooks da Uazapi (WhatsApp Business API), valida instância,
 * persiste evento bruto + contato + mensagem, atualiza status de leitura/entrega.
 * Timestamp blindado com normalizeTimestamp.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
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
    if (!ts || ts === '') {
      return new Date().toISOString();
    }
    if (typeof ts === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T/.test(ts)) {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          return d.toISOString();
        }
      } else {
        const num = Number(ts);
        if (isFinite(num) && num > 0) {
          return normalizeNumber(num);
        }
      }
    } else if (typeof ts === 'number') {
      if (isFinite(ts) && ts > 0) {
        return normalizeNumber(ts);
      }
    }
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function normalizeNumber(num: number): string {
  let ms = num > 9999999999n ? num : num * 1000;
  if (ms < 946684800000 || ms > 4102444800000) {
    return new Date().toISOString();
  }
  const d = new Date(ms);
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

function cleanPhone(jid: string): string {
  return jid.replace(/[^0-9]/g, '');
}

function extractInstanceName(body: unknown): string {
  const b = body as Record<string, unknown>;
  return ((b.instanceName || b.instance || '') as string).trim() || '';
}

function extractEventType(body: unknown): string {
  const b = body as Record<string, unknown>;
  return ((b.EventType || b.event_type || 'unknown') as string).trim() || 'unknown';
}

function mapMessageType(rawType: string): string {
  const t = rawType.toLowerCase();
  if (t.includes('conversation') || t === 'text') return 'text';
  if (t.includes('image')) return 'image';
  if (t.includes('audio')) return 'audio';
  if (t.includes('video')) return 'video';
  if (t.includes('document')) return 'document';
  if (t.includes('sticker')) return 'sticker';
  if (t.includes('location')) return 'location';
  return 'unknown';
}

function mapStatus(state: string): string {
  const s = state.toLowerCase();
  switch (s) {
    case 'delivered': return 'delivered';
    case 'read': return 'read';
    case 'played': return 'played';
    case 'sent': return 'sent';
    default: return 'sent';
  }
}

async function processMessage(
  supabaseClient: typeof supabase,
  body: unknown,
  instance: { id: string; instance_id: string; user_id?: string }
): Promise<void> {
  const b = body as Record<string, unknown>;
  const chat = b.chat as Record<string, unknown> | undefined;
  const message = b.message as Record<string, unknown> | undefined;

  if (!message) {
    console.log(JSON.stringify({ stage: 'ignored', reason: 'no_message' }));
    return;
  }

  const remoteJid = (chat?.wa_chatid as string || message.chatid as string || '').trim();
  if (!remoteJid) {
    console.log(JSON.stringify({ stage: 'ignored', reason: 'no_remote_jid' }));
    return;
  }

  // Upsert contact
  const contactUpsert = {
    instance_id: instance.instance_id,
    remote_jid: remoteJid,
    push_name: (chat?.wa_contactName as string || chat?.wa_name as string || message.senderName as string || null),
    profile_pic_url: chat?.imagePreview as string | null,
    phone: (chat?.phone as string || cleanPhone(remoteJid)) || null,
    is_group: !!(chat?.wa_isGroup as boolean),
    is_archived: !!(chat?.wa_archived as boolean),
    is_pinned: !!(chat?.wa_isPinned as boolean),
    is_blocked: !!(chat?.wa_isBlocked as boolean),
    updated_at: new Date().toISOString(),
  };

  const { data: contact, error: contactError } = await supabaseClient
    .from('whatsapp_contacts')
    .upsert(contactUpsert, { onConflict: 'remote_jid' })
    .select('id')
    .single();

  if (contactError || !contact) {
    console.log(JSON.stringify({
      stage: 'contact_db_error',
      error: contactError?.message,
      remoteJid,
    }));
    return;
  }

  const contactId = contact.id;

  // Build message row
  const messageRow = {
    message_id: message.messageid as string,
    contact_id: contactId,
    instance_id: instance.instance_id,
    from_me: !!(message.fromMe as boolean),
    type: mapMessageType(message.type as string || message.messageType as string || ''),
    text: (message.text as string || message.content as string || null),
    media_url: null,
    media_type: message.mediaType as string | null,
    media_mime_type: null,
    timestamp: normalizeTimestamp(message.messageTimestamp),
    status: (message.fromMe as boolean) ? 'sent' : 'delivered',
    is_read: false,
    sender_phone: cleanPhone((message.sender_pn as string || message.sender as string || '')),
    sender_name: message.senderName as string | null,
    reply_to_message_id: message.quoted as string | null,
    raw_payload: b,
    correlation_id: null,
    uazapi_message_id: message.id as string | null,
  };

  const { error: msgError } = await supabaseClient
    .from('whatsapp_messages')
    .upsert(messageRow, { onConflict: 'message_id' });

  if (msgError) {
    console.log(JSON.stringify({
      stage: 'messages_db_error',
      error: msgError.message,
      message_id: messageRow.message_id,
    }));
  } else {
    console.log(JSON.stringify({
      stage: 'persisted',
      contactId,
      messageId: messageRow.message_id,
    }));
  }
}

async function processMessageUpdate(
  supabaseClient: typeof supabase,
  body: unknown,
  instance: { instance_id: string }
): Promise<void> {
  const b = body as Record<string, unknown>;
  const event = b.event as Record<string, unknown> | undefined;

  if (!event) {
    console.log(JSON.stringify({ stage: 'ignored', reason: 'no_event' }));
    return;
  }

  const state = (b.state as string || event.Type as string || '').trim();
  const messageIds = (event.MessageIDs as string[] || []);

  if (!messageIds.length) {
    return;
  }

  const status = mapStatus(state);
  const isRead = status === 'read';

  const { count, error: updateError } = await supabaseClient
    .from('whatsapp_messages')
    .update({ status, is_read: isRead })
    .eq('instance_id', instance.instance_id)
    .in('message_id', messageIds);

  if (updateError) {
    console.log(JSON.stringify({
      stage: 'status_updated',
      error: updateError.message,
      status,
    }));
  } else {
    console.log(JSON.stringify({
      stage: 'status_updated',
      count: count || 0,
      status,
      messageIdsCount: messageIds.length,
    }));
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  // Health check
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Method not allowed
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (parseError) {
    console.log(JSON.stringify({ stage: 'raw_body_received', error: 'invalid_json', parseError: String(parseError) }));
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }

  console.log(JSON.stringify({ stage: 'raw_body_received', body_size: JSON.stringify(body).length }));

  try {
    const instanceName = extractInstanceName(body);
    const eventType = extractEventType(body);

    console.log(JSON.stringify({ stage: 'normalized', instanceName, eventType }));

    if (!instanceName) {
      console.log(JSON.stringify({ stage: 'instance_validation', failed: true, reason: 'empty_instance_name' }));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { data: instance, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('id, instance_id, user_id')
      .eq('instance_name', instanceName)
      .single();

    if (instanceError || !instance) {
      console.log(JSON.stringify({
        stage: 'instance_validation',
        failed: true,
        instanceName,
        error: instanceError?.message,
      }));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(JSON.stringify({ stage: 'instance_validation', success: true, instanceId: instance.id }));

    // Log raw event
    const { error: eventError } = await supabase
      .from('whatsapp_events')
      .insert({
        instance_name: instanceName,
        event_type: eventType,
        payload: body,
      });

    if (eventError) {
      console.log(JSON.stringify({ stage: 'event_logged', error: eventError.message }));
    } else {
      console.log(JSON.stringify({ stage: 'event_logged', success: true }));
    }

    // Process by event type
    if (eventType === 'messages') {
      await processMessage(supabase, body, instance);
    } else if (eventType === 'messages_update') {
      await processMessageUpdate(supabase, body, instance);
    } else {
      console.log(JSON.stringify({ stage: 'ignored', eventType, reason: 'unsupported_event_type' }));
    }

    console.log(JSON.stringify({ stage: 'persisted' }));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.log(JSON.stringify({ stage: 'fatal_error', error: String(e) }));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});