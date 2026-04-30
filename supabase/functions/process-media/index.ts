import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const UAZAPI_URL = (Deno.env.get('UAZAPI_URL') ?? '').replace(/\/$/, '');
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getDecryptedUrl(uazapiMessageId: string): Promise<{ url: string; mime: string }> {
  const res = await fetch(`${UAZAPI_URL}/message/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'token': UAZAPI_TOKEN },
    body: JSON.stringify({ id: uazapiMessageId }),
  });
  if (!res.ok) throw new Error(`UAZAPI download failed ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const url: string | undefined = json.fileURL ?? json.fileUrl ?? json.url;
  const mime: string = json.mimetype ?? json.mimeType ?? 'application/octet-stream';
  if (!url) throw new Error(`UAZAPI returned no fileURL. Keys: ${Object.keys(json).join(',')}`);
  return { url, mime };
}

async function fetchBlob(url: string, mime: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch decrypted failed ${res.status}`);
  const buf = await res.arrayBuffer();
  return new Blob([buf], { type: mime });
}

function filenameFor(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes('ogg')) return 'audio.ogg';
  if (m.includes('mp3') || m.includes('mpeg')) return 'audio.mp3';
  if (m.includes('m4a') || m.includes('mp4')) return 'audio.m4a';
  if (m.includes('wav')) return 'audio.wav';
  if (m.includes('webm')) return 'audio.webm';
  if (m.includes('jpeg') || m.includes('jpg')) return 'image.jpg';
  if (m.includes('png')) return 'image.png';
  if (m.includes('webp')) return 'image.webp';
  return 'file.bin';
}

async function transcribeAudio(blob: Blob, mime: string): Promise<string> {
  const form = new FormData();
  form.append('file', blob, filenameFor(mime));
  form.append('model', 'whisper-1');
  form.append('language', 'pt');
  form.append('response_format', 'text');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Whisper failed ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.text()).trim();
}

async function describeImage(imageUrl: string): Promise<string> {
  // GPT-4o-mini accepts public URLs directly
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Descreva esta imagem de forma concisa em portugues do Brasil em ate 2 frases. Se houver texto visivel, transcreva-o ao final apos "Texto: ".' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      }],
      max_tokens: 300,
    }),
  });
  if (!res.ok) throw new Error(`Vision failed ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let messageId: string | null = null;
  try {
    const body = await req.json();
    messageId = body.message_id;
    if (!messageId) return new Response(JSON.stringify({ error: 'message_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const { data: msg, error: fetchErr } = await supabase
      .from('whatsapp_messages')
      .select('id, type, contact_id, transcription_status, uazapi_message_id')
      .eq('id', messageId)
      .single();
    if (fetchErr || !msg) throw new Error(`Message not found: ${fetchErr?.message ?? 'no row'}`);
    if (msg.transcription_status === 'completed') {
      return new Response(JSON.stringify({ skipped: 'already_completed' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (msg.contact_id) {
      const { data: contact } = await supabase.from('whatsapp_contacts').select('is_group').eq('id', msg.contact_id).single();
      if (contact?.is_group) {
        await supabase.from('whatsapp_messages').update({ transcription_status: 'skipped_group', transcription_completed_at: new Date().toISOString() }).eq('id', messageId);
        return new Response(JSON.stringify({ skipped: 'group_chat' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (!msg.uazapi_message_id) throw new Error('No uazapi_message_id on message');
    await supabase.from('whatsapp_messages').update({ transcription_status: 'processing' }).eq('id', messageId);

    const { url: decryptedUrl, mime } = await getDecryptedUrl(msg.uazapi_message_id);

    if (msg.type === 'audio') {
      const blob = await fetchBlob(decryptedUrl, mime);
      const text = await transcribeAudio(blob, mime);
      await supabase.from('whatsapp_messages').update({
        transcription: text,
        transcription_status: 'completed',
        transcription_completed_at: new Date().toISOString(),
        transcription_error: null,
      }).eq('id', messageId);
      return new Response(JSON.stringify({ ok: true, type: 'audio', length: text.length, preview: text.slice(0, 120) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (msg.type === 'image') {
      const description = await describeImage(decryptedUrl);
      await supabase.from('whatsapp_messages').update({
        media_description: description,
        transcription_status: 'completed',
        transcription_completed_at: new Date().toISOString(),
        transcription_error: null,
      }).eq('id', messageId);
      return new Response(JSON.stringify({ ok: true, type: 'image', length: description.length, preview: description.slice(0, 120) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    await supabase.from('whatsapp_messages').update({ transcription_status: 'skipped_unsupported_type' }).eq('id', messageId);
    return new Response(JSON.stringify({ skipped: 'unsupported_type', type: msg.type }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    if (messageId) {
      await supabase.from('whatsapp_messages').update({
        transcription_status: 'failed',
        transcription_error: errMsg.slice(0, 1000),
        transcription_completed_at: new Date().toISOString(),
      }).eq('id', messageId);
    }
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
