import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN') ?? '';
const PROCESS_MEDIA_URL = `${SUPABASE_URL}/functions/v1/process-media`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function extractPhoneFromJid(jid: string | undefined | null): string | null {
  if (!jid) return null;
  const m = jid.match(/^(\d+)@/);
  return m ? m[1] : null;
}

function mapMessageType(uazType: string | undefined): string {
  if (!uazType) return 'text';
  const t = uazType.toLowerCase();
  if (t.includes('audio') || t.includes('ptt')) return 'audio';
  if (t.includes('image')) return 'image';
  if (t.includes('video')) return 'video';
  if (t.includes('document')) return 'document';
  if (t.includes('sticker')) return 'sticker';
  if (t.includes('location')) return 'location';
  if (t.includes('contact')) return 'contact';
  if (t.includes('reaction')) return 'reaction';
  if (t.includes('text') || t.includes('conversation')) return 'text';
  return 'text';
}

function extractText(message: any): string | null {
  if (!message) return null;
  return (
    message?.content?.text ??
    message?.content?.caption ??
    message?.content?.conversation ??
    message?.text ??
    message?.body ??
    null
  );
}

function extractMediaUrl(message: any): string | null {
  const c = message?.content;
  if (!c) return null;
  return c.url ?? c.directPath ?? c.mediaUrl ?? null;
}

async function fireProcessMedia(messageId: string) {
  try {
    await fetch(PROCESS_MEDIA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: messageId }),
    });
  } catch (_) {
    // fire-and-forget; failures are visible via transcription_status
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (auth) {
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (UAZAPI_TOKEN && token !== UAZAPI_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const eventType = payload.EventType ?? payload.event_type ?? payload.type ?? 'unknown';

  let eventId: string | null = null;
  try {
    const { data: evt, error: evtErr } = await supabase.from('whatsapp_events').insert({
      event_type: eventType,
      payload,
    }).select('id').single();
    if (evtErr) throw evtErr;
    eventId = evt?.id ?? null;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'event_insert_failed', detail: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  if (eventType !== 'messages') {
    return new Response(JSON.stringify({ ok: true, event_id: eventId, processed: 'event_only' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const chat = payload.chat ?? {};
    const message = payload.message ?? {};
    const remoteJid: string = chat.id ?? message.chatid ?? '';
    if (!remoteJid) {
      return new Response(JSON.stringify({ ok: true, event_id: eventId, processed: 'no_remote_jid' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const isGroup = remoteJid.includes('@g.us') || chat.isGroup === true;
    const phone = chat.phone ?? extractPhoneFromJid(remoteJid);
    const pushName = chat.name ?? chat.pushName ?? null;
    const profilePic = chat.imagePreview ?? chat.image ?? null;
    const lastMessageText = extractText(message);
    const uazMessageType = message.messageType ?? message.type;
    const mappedType = mapMessageType(uazMessageType);
    const mediaUrl = extractMediaUrl(message);
    const fromMe: boolean = message.fromMe ?? message.from_me ?? false;
    const uazapiMessageId: string = message.id ?? message.messageid ?? '';
    const tsMs = message.messageTimestamp ?? message.timestamp ?? Date.now();
    const tsIso = new Date(typeof tsMs === 'number' ? (tsMs > 1e12 ? tsMs : tsMs * 1000) : Date.now()).toISOString();

    const { data: contact, error: contactErr } = await supabase.from('whatsapp_contacts').upsert({
      remote_jid: remoteJid,
      phone_number: phone,
      push_name: pushName,
      profile_pic_url: profilePic,
      is_group: isGroup,
      last_message_at: tsIso,
      last_message_text: lastMessageText,
      last_message_type: mappedType,
      last_message_from_me: fromMe,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'remote_jid' }).select('id, is_group').single();
    if (contactErr) throw contactErr;

    const messageRow = {
      contact_id: contact!.id,
      message_id: uazapiMessageId || `${remoteJid}-${tsMs}`,
      uazapi_message_id: uazapiMessageId || null,
      from_me: fromMe,
      type: mappedType,
      text: lastMessageText,
      media_url: mediaUrl,
      media_type: mediaUrl ? mappedType : null,
      raw: payload,
      timestamp: tsIso,
      transcription_status: (mediaUrl && (mappedType === 'audio' || mappedType === 'image') && !contact!.is_group) ? 'pending' : null,
    };

    const { data: inserted, error: msgErr } = await supabase.from('whatsapp_messages').upsert(
      messageRow,
      { onConflict: 'uazapi_message_id', ignoreDuplicates: false }
    ).select('id, transcription_status').single();
    if (msgErr) throw msgErr;

    if (inserted && inserted.transcription_status === 'pending') {
      // fire-and-forget; process-media runs asynchronously
      fireProcessMedia(inserted.id);
    }

    return new Response(JSON.stringify({ ok: true, event_id: eventId, message_id: inserted?.id, queued_media: inserted?.transcription_status === 'pending' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: true, event_id: eventId, normalize_error: String(e) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});
