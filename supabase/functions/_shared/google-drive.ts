function base64url(data: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i)
  return bytes
}

export async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const normalizedKey = privateKey.replace(/\\n/g, '\n')
  const pemContents = normalizedKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const key = await crypto.subtle.importKey(
    'pkcs8',
    base64ToUint8Array(pemContents),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64url(new TextEncoder().encode(JSON.stringify(header)))
  const encodedPayload = base64url(new TextEncoder().encode(JSON.stringify(payload)))
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data),
  )
  const jwt = `${data}.${base64url(new Uint8Array(signature))}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await res.json()
  if (!tokenData.access_token) throw new Error('Failed to get Google access token')
  return tokenData.access_token
}

export async function findOrCreateFolder(
  name: string,
  parentId: string | null,
  token: string,
): Promise<string> {
  const escapedName = name.replace(/'/g, "\\'")
  const parentQuery = parentId ? ` and '${parentId}' in parents` : ''
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${escapedName}' and trashed = false${parentQuery}`

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const searchData = await searchRes.json()
  if (searchData.files?.length > 0) return searchData.files[0].id

  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }
  if (parentId) metadata.parents = [parentId]

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  })
  const createData = await createRes.json()
  if (!createData.id) throw new Error(`Failed to create folder: ${name}`)
  return createData.id
}

export async function uploadFileToDrive(
  name: string,
  content: Uint8Array,
  mimeType: string,
  folderId: string,
  token: string,
): Promise<void> {
  const escapedName = name.replace(/'/g, "\\'")
  const q = `name = '${escapedName}' and '${folderId}' in parents and trashed = false`
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const searchData = await searchRes.json()
  const existingId = searchData.files?.[0]?.id

  if (existingId) {
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType },
      body: content,
    })
    return
  }

  const metadata = { name, parents: [folderId] }
  const formData = new FormData()
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  formData.append('file', new Blob([content], { type: mimeType }))

  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
}
