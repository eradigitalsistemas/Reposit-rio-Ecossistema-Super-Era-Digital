// receive-webhook v18 - fix timestamp ms/s, instance_id UUID, media preview
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN') || ''

const VERSION = 'v18-2026-04-28'
const INSTANCE_UUID = 'da5f1f9f-7d94-4b41-b1e5-b09e3148f983'
const INSTANCE_NAME_CANON = 'comercial_era'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const REST_HEADERS = {
  apikey: SERVICE_ROLE,
  Authorization: 'Bearer ' + SERVICE_ROLE,
  'Content-Type': 'application/json',
}

function jsonResp(status, body) {
  return new Response(JSON.stringify({ ...body, version: VERSION }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function safeErr(e) {
  if (!e) return { message: 'unknown' }
  if (typeof e === 'string') return { message: e }
  if (e instanceof Error)
    return { name: e.name, message: e.message, stack: String(e.stack || '').slice(0, 500) }
  if (typeof e === 'object') {
    const o = e
    return {
      message: String(o.message || ''),
      code: String(o.code || ''),
      details: String(o.details || ''),
      hint: String(o.hint || ''),
      status: String(o.status || ''),
    }
  }
  return { message: String(e) }
}

async function pgInsert(table, row) {
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: { ...REST_HEADERS, Prefer: 'return=representation' },
      body: JSON.stringify(row),
    })
    if (!r.ok) {
      const txt = await r.text()
      return { data: null, error: { status: r.status, message: txt } }
    }
    const data = await r.json()
    return { data: Array.isArray(data) ? data[0] : data, error: null }
  } catch (e) {
    return { data: null, error: safeErr(e) }
  }
}

async function pgUpsert(table, row, onConflict) {
  try {
    const url = SUPABASE_URL + '/rest/v1/' + table + '?on_conflict=' + onConflict
    const r = await fetch(url, {
      method: 'POST',
      headers: { ...REST_HEADERS, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(row),
    })
    if (!r.ok) {
      const txt = await r.text()
      return { data: null, error: { status: r.status, message: txt } }
    }
    const data = await r.json()
    return { data: Array.isArray(data) ? data[0] : data, error: null }
  } catch (e) {
    return { data: null, error: safeErr(e) }
  }
}

function getEventType(p) {
  return String((p && (p.EventType || p.event || p.type)) || 'unknown')
}
function getInstanceName(p) {
  return String((p && (p.instanceName || p.instance || p.owner)) || INSTANCE_NAME_CANON)
}

function extractText(msg) {
  if (!msg) return null
  if (msg.content) {
    if (typeof msg.content.text === 'string' && msg.content.text) return msg.content.text
    if (typeof msg.content.caption === 'string' && msg.content.caption) return msg.content.caption
    if (typeof msg.content.conversation === 'string' && msg.content.conversation)
      return msg.content.conversation
  }
  if (typeof msg.text === 'string' && msg.text) return msg.text
  return null
}

function mapType(messageType, content) {
  const t = String(messageType || '').toLowerCase()
  if (t.indexOf('audio') >= 0 || t === 'ptt' || (content && content.PTT)) return 'audio'
  if (t.indexOf('image') >= 0) return 'image'
  if (t.indexOf('video') >= 0) return 'video'
  if (t.indexOf('document') >= 0) return 'document'
  if (t.indexOf('sticker') >= 0) return 'sticker'
  if (t.indexOf('contact') >= 0) return 'contact'
  if (t.indexOf('location') >= 0) return 'location'
  if (t.indexOf('reaction') >= 0) return 'reaction'
  return 'text'
}

function previewForType(text, type) {
  if (text && text.trim()) return text
  switch (type) {
    case 'audio':
      return '[\u00c1udio]'
    case 'image':
      return '[Imagem]'
    case 'video':
      return '[V\u00eddeo]'
    case 'document':
      return '[Documento]'
    case 'sticker':
      return '[Figurinha]'
    case 'contact':
      return '[Contato]'
    case 'location':
      return '[Localiza\u00e7\u00e3o]'
    case 'reaction':
      return '[Rea\u00e7\u00e3o]'
    default:
      return ''
  }
}

function parseTimestamp(raw, fallbackIso) {
  const n = Number(raw || 0)
  if (!n || !isFinite(n)) return fallbackIso
  const ms = n > 1e12 ? n : n * 1000
  const d = new Date(ms)
  if (isNaN(d.getTime())) return fallbackIso
  const minMs = 1577836800000
  const maxMs = 4102444800000
  if (ms < minMs || ms > maxMs) return fallbackIso
  return d.toISOString()
}

function resolveInstanceId(instanceName) {
  if (instanceName === INSTANCE_NAME_CANON) return INSTANCE_UUID
  return INSTANCE_UUID
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResp(405, { error: 'method_not_allowed' })

  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (auth) {
    const tok = auth.replace(/^Bearer /i, '').trim()
    if (UAZAPI_TOKEN && tok && tok !== UAZAPI_TOKEN && tok.indexOf('eyJ') !== 0) {
      return jsonResp(401, { error: 'Invalid token' })
    }
  }

  let payload
  try {
    payload = await req.json()
  } catch (_e) {
    return jsonResp(400, { error: 'invalid_json' })
  }

  const eventType = getEventType(payload)
  const instanceName = getInstanceName(payload)
  const instanceId = resolveInstanceId(instanceName)

  let eventId = null
  const evRes = await pgInsert('whatsapp_events', {
    instance_name: instanceName,
    event_type: eventType,
    payload: payload,
  })
  if (evRes.error) console.error('event_insert_error', evRes.error)
  else if (evRes.data) eventId = evRes.data.id

  if (eventType !== 'messages') {
    return jsonResp(200, { ok: true, event_id: eventId, event_type: eventType })
  }

  try {
    const chat = (payload && payload.chat) || {}
    const message = (payload && payload.message) || {}
    const remoteJid = chat.wa_chatid || message.chatid || chat.id || ''
    if (!remoteJid) return jsonResp(200, { ok: true, event_id: eventId, warn: 'no_remote_jid' })

    const isGroup = remoteJid.endsWith('@g.us') || Boolean(chat.isGroup) || Boolean(message.isGroup)
    const phone = chat.phone || (remoteJid.indexOf('@') >= 0 ? remoteJid.split('@')[0] : remoteJid)
    const pushName = chat.name || chat.wa_name || message.senderName || null
    const profilePic = chat.imagePreview || chat.image || null
    const nowIso = new Date().toISOString()
    const rawText = extractText(message)
    const mappedType = mapType(message.messageType, message.content)
    const fromMe = Boolean(message.fromMe)
    const previewText = previewForType(rawText, mappedType)

    const ctRes = await pgUpsert(
      'whatsapp_contacts',
      {
        remote_jid: remoteJid,
        phone_number: phone,
        push_name: pushName,
        profile_pic_url: profilePic,
        is_group: isGroup,
        instance_id: instanceId,
        last_message_at: nowIso,
        last_message_text: previewText,
        last_message_type: mappedType,
        last_message_from_me: fromMe,
        updated_at: nowIso,
      },
      'remote_jid',
    )
    if (ctRes.error) console.error('contact_upsert_error', ctRes.error)
    const contactId = ctRes.data ? ctRes.data.id : null

    const uazapiMsgId = message.id || message.messageid || null
    if (!uazapiMsgId) {
      return jsonResp(200, {
        ok: true,
        event_id: eventId,
        contact_id: contactId,
        warn: 'no_message_id',
      })
    }

    const mediaUrl =
      (message.content &&
        (message.content.URL || message.content.url || message.content.directPath)) ||
      null
    const mediaMime = (message.content && message.content.mimetype) || null
    const tsIso = parseTimestamp(message.messageTimestamp, nowIso)
    const transcriptionStatus =
      (mappedType === 'audio' || mappedType === 'image') && !isGroup && mediaUrl ? 'pending' : null

    const msgRow = {
      contact_id: contactId,
      message_id: uazapiMsgId,
      uazapi_message_id: uazapiMsgId,
      instance_id: instanceId,
      from_me: fromMe,
      type: mappedType,
      text: rawText,
      media_url: mediaUrl,
      media_type: mediaMime,
      timestamp: tsIso,
      raw: payload,
      status: fromMe ? 'sent' : 'received',
      transcription_status: transcriptionStatus,
      updated_at: nowIso,
    }

    const msgRes = await pgUpsert('whatsapp_messages', msgRow, 'uazapi_message_id')
    if (msgRes.error)
      console.error('message_upsert_error', msgRes.error, 'row_summary', {
        id: uazapiMsgId,
        type: mappedType,
        ts: tsIso,
      })

    const msgId = msgRes.data ? msgRes.data.id : null
    const needsMedia = msgRes.data && msgRes.data.transcription_status === 'pending'

    if (needsMedia && msgId) {
      const dispatchUrl = SUPABASE_URL + '/functions/v1/process-media'
      fetch(dispatchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + SERVICE_ROLE,
        },
        body: JSON.stringify({ message_id: msgId }),
      }).catch((e) => console.error('dispatch_error', safeErr(e)))
    }

    return jsonResp(200, {
      ok: true,
      event_id: eventId,
      contact_id: contactId,
      message_id: msgId,
      type: mappedType,
      media_dispatched: Boolean(needsMedia),
    })
  } catch (e) {
    console.error('processing_exception', safeErr(e))
    return jsonResp(200, { ok: true, event_id: eventId, warn: 'processing_error', err: safeErr(e) })
  }
})
