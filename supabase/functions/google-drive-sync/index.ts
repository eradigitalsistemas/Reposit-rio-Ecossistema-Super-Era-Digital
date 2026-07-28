import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getGoogleAccessToken, findOrCreateFolder, uploadFileToDrive } from '../_shared/google-drive.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { companyId } = await req.json()
    if (!companyId) throw new Error('companyId is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: company, error: dbErr } = await supabase
      .from('documentos_empresa')
      .select('*')
      .eq('id', companyId)
      .single()

    if (dbErr || !company) throw new Error('Company not found')

    const clientEmail = Deno.env.get('GOOGLE_DRIVE_CLIENT_EMAIL')
    const privateKey = Deno.env.get('GOOGLE_DRIVE_PRIVATE_KEY')
    const parentFolderId = Deno.env.get('GOOGLE_DRIVE_PARENT_FOLDER_ID') || null

    if (!clientEmail || !privateKey) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Google Drive not configured. Skipping sync.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = await getGoogleAccessToken(clientEmail, privateKey)

    const rootFolderName = `${company.empresa} (${company.cnpj || 'sem-cnpj'})`
    const rootFolderId = await findOrCreateFolder(rootFolderName, parentFolderId, token)

    const constituirFolderId = await findOrCreateFolder('1. Constituição', rootFolderId, token)
    const certidoesFolderId = await findOrCreateFolder('2. Certidões e Afins', rootFolderId, token)
    const senhasFolderId = await findOrCreateFolder('3. Senhas', rootFolderId, token)

    const documentos = Array.isArray(company.documentos) ? company.documentos : []
    let uploadedCount = 0

    for (const doc of documentos) {
      if (!doc.path) continue

      const { data: urlData } = await supabase.storage
        .from('documentos-empresa')
        .createSignedUrl(doc.path, 300)

      if (!urlData?.signedUrl) continue

      const fileRes = await fetch(urlData.signedUrl)
      if (!fileRes.ok) continue

      const fileContent = new Uint8Array(await fileRes.arrayBuffer())
      const mimeType = doc.type || 'application/octet-stream'
      const targetFolderId = doc.category === 'Certidões e Afins' ? certidoesFolderId : constituirFolderId
      const safeName = doc.name.replace(/[^\w.\-]/g, '_')

      await uploadFileToDrive(safeName, fileContent, mimeType, targetFolderId, token)
      uploadedCount++
    }

    const senhas = Array.isArray(company.senhas_acesso) ? company.senhas_acesso : []
    const activeSenhas = senhas.filter((s: Record<string, unknown>) => s.identificacao || s.senha)
    if (activeSenhas.length > 0) {
      const senhasText = activeSenhas
        .map((s: Record<string, unknown>) => `${s.identificacao || 'N/A'}: ${s.senha || 'N/A'}`)
        .join('\n')
      const content = new TextEncoder().encode(senhasText)
      await uploadFileToDrive('senhas.txt', content, 'text/plain', senhasFolderId, token)
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${uploadedCount} document(s) to Google Drive.`,
      rootFolder: rootFolderName,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
