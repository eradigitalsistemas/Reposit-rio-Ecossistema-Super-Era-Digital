import { supabase } from '@/lib/supabase/client'

export type DocumentCategory = 'Constituição' | 'Certidões e Afins'

export interface CompanyDocument {
  id: string
  name: string
  path: string
  type: string
  createdAt: string
  category?: DocumentCategory
  expiryDate?: string | null
}

export interface CredentialEntry {
  identificacao: string
  senha: string
}

export interface CompanyInfo {
  id: string
  empresa: string
  cnpj: string
  cpf_socio: string
  senhas_acesso: CredentialEntry[]
  responsavel: string
  telefone: string
  email: string
  documentos: CompanyDocument[]
  created_at: string
  updated_at: string
}

const EMPTY_CREDENTIALS: CredentialEntry[] = Array.from({ length: 6 }, () => ({
  identificacao: '',
  senha: '',
}))

function normalizeCredentials(raw: unknown): CredentialEntry[] {
  if (!Array.isArray(raw)) return [...EMPTY_CREDENTIALS]
  const result = [...EMPTY_CREDENTIALS]
  for (let i = 0; i < Math.min(raw.length, 6); i++) {
    const entry = raw[i]
    if (entry && typeof entry === 'object') {
      result[i] = {
        identificacao: String((entry as Record<string, unknown>).identificacao ?? ''),
        senha: String((entry as Record<string, unknown>).senha ?? ''),
      }
    }
  }
  return result
}

export async function fetchCompanyInfo(): Promise<CompanyInfo | null> {
  const { data, error } = await supabase
    .from('documentos_empresa')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    empresa: data.empresa || '',
    cnpj: data.cnpj || '',
    cpf_socio: data.cpf_socio || '',
    senhas_acesso: normalizeCredentials(data.senhas_acesso),
    responsavel: data.responsavel || '',
    telefone: data.telefone || '',
    email: data.email || '',
    documentos: Array.isArray(data.documentos) ? data.documentos : [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function createCompanyInfo(payload: Partial<CompanyInfo>): Promise<CompanyInfo> {
  const { data, error } = await supabase
    .from('documentos_empresa')
    .insert({
      empresa: payload.empresa || '',
      cnpj: payload.cnpj || null,
      cpf_socio: payload.cpf_socio || null,
      senhas_acesso: payload.senhas_acesso || EMPTY_CREDENTIALS,
      responsavel: payload.responsavel || null,
      telefone: payload.telefone || null,
      email: payload.email || null,
      documentos: [],
    })
    .select('*')
    .single()

  if (error) throw error
  return {
    ...data,
    cpf_socio: data.cpf_socio || '',
    senhas_acesso: normalizeCredentials(data.senhas_acesso),
    documentos: Array.isArray(data.documentos) ? data.documentos : [],
  } as CompanyInfo
}

export async function updateCompanyInfo(
  id: string,
  payload: Partial<
    Pick<
      CompanyInfo,
      'empresa' | 'cnpj' | 'cpf_socio' | 'senhas_acesso' | 'responsavel' | 'telefone' | 'email'
    >
  >,
): Promise<void> {
  const { error } = await supabase
    .from('documentos_empresa')
    .update({
      empresa: payload.empresa,
      cnpj: payload.cnpj,
      cpf_socio: payload.cpf_socio,
      senhas_acesso: payload.senhas_acesso,
      responsavel: payload.responsavel,
      telefone: payload.telefone,
      email: payload.email,
    })
    .eq('id', id)

  if (error) throw error
}

export async function uploadCompanyDocument(
  companyId: string,
  file: File,
  onProgress?: (pct: number) => void,
  category?: DocumentCategory,
  expiryDate?: string | null,
): Promise<CompanyDocument> {
  const ext = file.name.split('.').pop()
  const filePath = `${companyId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documentos-empresa')
    .upload(filePath, file, {
      onUpload: (ev: any) => {
        if (onProgress && ev.total > 0) {
          onProgress(Math.round((ev.loaded / ev.total) * 100))
        }
      },
    })

  if (uploadError) throw uploadError

  const newDoc: CompanyDocument = {
    id: crypto.randomUUID(),
    name: file.name,
    path: filePath,
    type: file.type || 'application/octet-stream',
    createdAt: new Date().toISOString(),
    category: category || 'Constituição',
    expiryDate: expiryDate || null,
  }

  const { data: current, error: fetchErr } = await supabase
    .from('documentos_empresa')
    .select('documentos')
    .eq('id', companyId)
    .single()

  if (fetchErr) throw fetchErr

  const existingDocs: CompanyDocument[] = Array.isArray(current?.documentos)
    ? current.documentos
    : []
  const updatedDocs = [...existingDocs, newDoc]

  const { error: updateErr } = await supabase
    .from('documentos_empresa')
    .update({ documentos: updatedDocs })
    .eq('id', companyId)

  if (updateErr) throw updateErr

  onProgress?.(100)
  return newDoc
}

export async function deleteCompanyDocument(
  companyId: string,
  doc: CompanyDocument,
): Promise<void> {
  if (doc.path) {
    await supabase.storage.from('documentos-empresa').remove([doc.path])
  }

  const { data: current, error: fetchErr } = await supabase
    .from('documentos_empresa')
    .select('documentos')
    .eq('id', companyId)
    .single()

  if (fetchErr) throw fetchErr

  const existingDocs: CompanyDocument[] = Array.isArray(current?.documentos)
    ? current.documentos
    : []
  const updatedDocs = existingDocs.filter((d) => d.id !== doc.id)

  const { error: updateErr } = await supabase
    .from('documentos_empresa')
    .update({ documentos: updatedDocs })
    .eq('id', companyId)

  if (updateErr) throw updateErr
}

export async function getDocumentSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('documentos-empresa')
    .createSignedUrl(path, 3600)

  if (error) return null
  return data?.signedUrl ?? null
}

export async function syncToGoogleDrive(companyId: string): Promise<void> {
  await supabase.functions.invoke('google-drive-sync', {
    body: { companyId },
  })
}
