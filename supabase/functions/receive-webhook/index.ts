// receive-webhook v27 — Status tracking (delivered/read/played)
// Evolução da v26 (mantida 100%) + handler para EventType = messages_update
// Atualizações UAZAPI mapeadas:
//   Delivered  -> status='delivered',  delivered_at = now do evento
//   Read       -> status='read',       read_at      = now do evento, is_read=true
//   Played     -> status='played',     read_at      = now do evento (áudio ouvido)
//   Failed     -> status='failed'
//   FileDownloaded e outros -> ignorados para status (apenas log)

const VERSION = 'v27-status-tracking-2026-05-07'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_TOKEN') ?? ''

const REST = `${SUPABASE_URL}/rest/v1`
const PROCESS_MEDIA_URL = `${SUPABASE_URL}/functions/v1/process-media`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const baseHeaders = () => ({
  'Content-Type': 'application/json',
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
})

function safeErr(err) {
  if (!err) return { message: 'unknown' }
  if (typeof err === 'string') return { message: err }
  const e = err
  return {
    message: e?.message ?? String(err),
    code: e?.code,
    details: e?.details,
    hint: e?.hint,
    name: e?.name,
  }
}

function parseTimestamp(raw) {
  if (raw === null || raw === undefined || raw === '') return new Date().toISOString()
  // Aceita ISO string (ex: "2026-05-07T13:38:22Z")
  if (typeof raw === 'string' && raw.includes('T')) {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear()
      if (y >= 2020 && y <= 2100) return d.toISOString()
    }
  }
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return new Date().toISOString()
  // Detecta s vs ms automaticamente
  const ms = n < 1e12 ? n * 1000 : n
  const d = new Date(ms)
  if (isNaN(d.getTime())) return new Date().toISOString()
  const year = d.getUTCFullYear()
  if (year < 2020 || year > 2100) return new Date().toISOString()
  return d.toISOString()
}

async function rest(method, path, body, extraHeaders = {}) {
  try {
    const res = await fetch(`${REST}${path}`, {
      method,
      headers: { ...baseHeaders(), ...extraHeaders },
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }
    if (!res.ok) {
      return { ok: false, status: res.status, data: null, error: data }
    }
    return { ok: true, status: res.status, data }
  } catch (err) {
    return { ok: false, status: 0, data: null, error: safeErr(err) }
  }
}

function mapMessageType(messageType) {
  if (!messageType) return 'text'
  const t = messageType.toLowerCase()
  if (t.includes('conversation') || t.includes('extendedtext')) return 'text'
  if (t.includes('audio') || t.includes('ptt')) return 'audio'
  if (t.includes('image')) return 'image'
  if (t.includes('video')) return 'video'
  if (t.includes('document')) return 'document'
  if (t.includes('sticker')) return 'sticker'
  if (t.includes('reaction')) return 'reaction'
  if (t.includes('contact')) return 'contact'
  if (t.includes('location')) return 'location'
  return 'text'
}

function previewForMedia(type, text) {
  if (text && text.trim()) return text
  switch (type) {
    case 'audio':
      return '[\u00C1udio]'
    case 'image':
      return '[Imagem]'
    case 'video':
      return '[V\u00EDdeo]'
    case 'document':
      return '[Documento]'
    case 'sticker':
      return '[Figurinha]'
    case 'reaction':
      return '[Rea\u00E7\u00E3o]'
    case 'contact':
      return '[Contato]'
    case 'location':
      return '[Localiza\u00E7\u00E3o]'
    default:
      return ''
  }
}

function extractText(message) {
  if (!message) return null
  return (
    message?.text ??
    message?.content?.text ??
    message?.content?.caption ??
    message?.content?.conversation ??
    null
  )
}

function isGroupJid(jid) {
  if (!jid) return false
  return jid.includes('@g.us') || jid.endsWith('-group')
}

const instanceCache = new Map()

async function resolveInstanceId(instanceName) {
  if (!instanceName) return null
  if (instanceCache.has(instanceName)) return instanceCache.get(instanceName)
  const r = await rest(
    'GET',
    `/whatsapp_instances?instance_name=eq.${encodeURIComponent(instanceName)}&select=instance_id&limit=1`,
  )
  if (r.ok && Array.isArray(r.data) && r.data[0]?.instance_id) {
    instanceCache.set(instanceName, r.data[0].instance_id)
    return r.data[0].instance_id
  }
  return null
}

// ============================================================
// NOVO NA v27: handler para messages_update (status de entrega/leitura)
// ============================================================
function mapStatusUpdate(updateType) {
  if (!updateType) return null
  const t = String(updateType).toLowerCase()
  if (t === 'delivered' || t === 'deliveryack') return 'delivered'
  if (t === 'read' || t === 'readreceipt') return 'read'
  if (t === 'played') return 'played'
  if (t === 'failed' || t === 'error') return 'failed'
  return null // outros (FileDownloaded, etc.) — ignora
}

async function processStatusUpdate(payload) {
  const evt = payload?.event ?? {}
  const updateType = evt?.Type ?? payload?.state ?? payload?.type ?? null
  const newStatus = mapStatusUpdate(updateType)
  if (!newStatus) {
    // não é status que rastreamos — apenas log
    return
  }
  const messageIds = Array.isArray(evt?.MessageIDs) ? evt.MessageIDs : []
  if (messageIds.length === 0) {
    console.error('[receive-webhook] messages_update sem MessageIDs', { updateType })
    return
  }
  const tsIso = parseTimestamp(evt?.Timestamp ?? payload?.timestamp)
  const nowIso = new Date().toISOString()

  // monta patch baseado no tipo de status
  const patch = { status: newStatus, updated_at: nowIso }
  if (newStatus === 'delivered') {
    patch.delivered_at = tsIso
  } else if (newStatus === 'read') {
    patch.read_at = tsIso
    patch.is_read = true
    // se nunca foi marcado como entregue, marca também (read implica delivered)
    patch.delivered_at = tsIso
  } else if (newStatus === 'played') {
    patch.read_at = tsIso
    patch.is_read = true
    patch.delivered_at = tsIso
  }

  // PostgREST usa filtro in.(id1,id2,...) — precisa quote em strings
  const idsCsv = messageIds.map((id) => `"${id}"`).join(',')
  const path = `/whatsapp_messages?uazapi_message_id=in.(${encodeURIComponent(idsCsv)})`

  const upd = await rest('PATCH', path, patch, {
    Prefer: 'return=representation',
  })
  if (!upd.ok) {
    console.error('[receive-webhook] PATCH status failed', {
      updateType,
      newStatus,
      messageIds,
      error: safeErr(upd.error),
    })
    return
  }
  const affected = Array.isArray(upd.data) ? upd.data.length : 0
  if (affected === 0) {
    // mensagem ainda não foi inserida (race condition rara) — não é erro crítico
    console.warn('[receive-webhook] status update sem matches', { updateType, messageIds })
  }
}

async function processMessage(payload, eventId) {
  const instanceName = payload?.instanceName ?? payload?.instance ?? null
  const instanceUuid = await resolveInstanceId(instanceName)

  const chat = payload?.chat ?? {}
  const message = payload?.message ?? {}
  const remoteJid = message?.chatid ?? chat?.id ?? chat?.wa_chatid
  if (!remoteJid) {
    console.error('[receive-webhook] mensagem sem remoteJid', { eventId })
    return
  }

  const isGroup = isGroupJid(remoteJid) || !!chat?.wa_isGroup
  const messageType = mapMessageType(message?.messageType)
  const text = extractText(message)
  const previewText = previewForMedia(messageType, text)
  const tsIso = parseTimestamp(
    message?.messageTimestamp ?? message?.timestamp ?? payload?.timestamp,
  )
  const fromMe = !!(message?.fromMe ?? message?.from_me ?? payload?.fromMe)
  const mediaUrl =
    message?.content?.URL ??
    message?.content?.url ??
    message?.content?.fileURL ??
    message?.mediaUrl ??
    null
  const mediaMimetype = message?.content?.mimetype ?? message?.content?.mediaType ?? null
  const uazapiMessageId = message?.messageid ?? message?.id ?? message?.key?.id ?? null
  const pushName = chat?.name ?? chat?.wa_name ?? chat?.pushName ?? null
  const phone = chat?.phone ?? chat?.wa_phone ?? null
  const profilePicUrl = chat?.imagePreview ?? chat?.image ?? null

  const contactRow = {
    remote_jid: remoteJid,
    push_name: pushName,
    phone_number: phone,
    profile_pic_url: profilePicUrl,
    is_group: isGroup,
    last_message_at: tsIso,
    last_message_text: previewText,
    last_message_type: messageType,
    last_message_from_me: fromMe,
    instance_id: instanceUuid,
  }

  const contactRes = await rest('POST', `/whatsapp_contacts?on_conflict=remote_jid`, contactRow, {
    Prefer: 'resolution=merge-duplicates,return=representation',
  })
  if (!contactRes.ok) {
    console.error('[receive-webhook] upsert contact failed', safeErr(contactRes.error))
  }
  const contactId =
    Array.isArray(contactRes.data) && contactRes.data[0]?.id ? contactRes.data[0].id : null

  if (!uazapiMessageId) {
    console.error('[receive-webhook] sem uazapi_message_id, pulando insert msg', { eventId })
    return
  }

  let transcriptionStatus = null
  const isMediaTranscribable = messageType === 'audio' || messageType === 'image'
  if (isMediaTranscribable && mediaUrl) {
    transcriptionStatus = isGroup ? 'skipped_group' : 'pending'
  } else if (isMediaTranscribable && !mediaUrl) {
    transcriptionStatus = 'skipped_unsupported_type'
  }

  const messageRow = {
    message_id: uazapiMessageId,
    uazapi_message_id: uazapiMessageId,
    contact_id: contactId,
    instance_id: instanceUuid,
    from_me: fromMe,
    type: messageType,
    text,
    media_url: mediaUrl,
    media_type: mediaMimetype,
    raw: message,
    status: fromMe ? 'sent' : 'received',
    is_read: false,
    timestamp: tsIso,
    transcription_status: transcriptionStatus,
    updated_at: new Date().toISOString(),
  }

  const msgRes = await rest(
    'POST',
    `/whatsapp_messages?on_conflict=uazapi_message_id`,
    messageRow,
    { Prefer: 'resolution=merge-duplicates,return=representation' },
  )
  if (!msgRes.ok) {
    console.error('[receive-webhook] upsert message failed', safeErr(msgRes.error))
    return
  }

  if (transcriptionStatus === 'pending' && mediaUrl) {
    const insertedId = Array.isArray(msgRes.data) && msgRes.data[0]?.id ? msgRes.data[0].id : null
    if (insertedId) {
      fetch(PROCESS_MEDIA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({
          message_id: insertedId,
          media_url: mediaUrl,
          type: messageType,
          mimetype: mediaMimetype,
          uazapi_message_id: uazapiMessageId,
        }),
      }).catch((err) => {
        console.error('[receive-webhook] dispatch process-media failed', safeErr(err))
      })
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const auth = req.headers.get('authorization') ?? ''
  if (auth.startsWith('Bearer ') && UAZAPI_TOKEN) {
    const token = auth.slice(7).trim()
    if (token && token !== UAZAPI_TOKEN) {
      return new Response(JSON.stringify({ error: 'Invalid token', version: VERSION }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  let payload
  try {
    payload = await req.json()
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON', version: VERSION, ...safeErr(err) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const eventType = payload?.EventType ?? payload?.event_type ?? payload?.event ?? 'unknown'
  const instanceName = payload?.instanceName ?? payload?.instance ?? null

  let eventId = null
  try {
    const eventRes = await rest(
      'POST',
      `/whatsapp_events`,
      { instance_name: instanceName, event_type: eventType, payload },
      { Prefer: 'return=representation' },
    )
    if (eventRes.ok && Array.isArray(eventRes.data) && eventRes.data[0]?.id) {
      eventId = eventRes.data[0].id
    } else if (!eventRes.ok) {
      console.error('[receive-webhook] insert event failed', safeErr(eventRes.error))
    }
  } catch (err) {
    console.error('[receive-webhook] insert event exception', safeErr(err))
  }

  if (eventType === 'messages') {
    try {
      await processMessage(payload, eventId ?? 'no-event-id')
    } catch (err) {
      console.error('[receive-webhook] processMessage exception', safeErr(err))
    }
  } else if (eventType === 'messages_update') {
    try {
      await processStatusUpdate(payload)
    } catch (err) {
      console.error('[receive-webhook] processStatusUpdate exception', safeErr(err))
    }
  }

  return new Response(
    JSON.stringify({ ok: true, version: VERSION, event_id: eventId, event_type: eventType }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
