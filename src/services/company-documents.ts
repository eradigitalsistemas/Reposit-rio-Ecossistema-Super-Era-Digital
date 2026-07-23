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
  nome_orgao: string
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

function normalizeCredentials(raw: unknown): CredentialEntry[] {
  if (!Array.isArray(raw)) return []
  const result: CredentialEntry[] = []
  for (const entry of raw) {
    if (entry && typeof entry === 'object') {
      const obj = entry as Record<string, unknown>
      const nomeOrgao = String(obj.nome_orgao ?? obj.identificacao ?? '').trim()
      const senha = String(obj.senha ?? '').trim()
      if (nomeOrgao || senha) {
        result.push({ nome_orgao: nomeOrgao, senha })
      }
    }
  }
  return result.slice(0, 6)
}

export async function fetchAllCompanies(): Promise<CompanyInfo[]> {
  const { data, error } = await supabase
    .from('documentos_empresa')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  if (!data) return []
  return data.map((item) => ({
    id: item.id,
    empresa: item.empresa || '',
    cnpj: item.cnpj || '',
    cpf_socio: item.cpf_socio || '',
    senhas_acesso: normalizeCredentials(item.senhas_acesso),
    responsavel: item.responsavel || '',
    telefone: item.telefone || '',
    email: item.email || '',
    documentos: Array.isArray(item.documentos) ? item.documentos : [],
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
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
      senhas_acesso: payload.senhas_acesso || [],
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

export async function checkClientByCnpj(
  cnpj: string,
): Promise<{ id: string; nome: string } | null> {
  const cleanCnpj = cnpj.replace(/\D/g, '')
  if (cleanCnpj.length < 14) return null

  const { data: d1 } = await supabase
    .from('clientes_externos')
    .select('id, nome')
    .eq('cnpj', cnpj)
    .maybeSingle()
  if (d1) return { id: d1.id, nome: d1.nome }

  const { data: d2 } = await supabase
    .from('clientes_externos')
    .select('id, nome')
    .eq('cnpj', cleanCnpj)
    .maybeSingle()
  if (d2) return { id: d2.id, nome: d2.nome }

  return null
}

export async function createClientFromCompany(data: {
  nome: string
  empresa: string
  cnpj: string
  email: string
  telefone: string
}): Promise<string> {
  const { data: result, error } = await supabase
    .from('clientes_externos')
    .insert({
      nome: data.nome,
      empresa: data.empresa,
      cnpj: data.cnpj || null,
      email: data.email || null,
      telefone: data.telefone || null,
    })
    .select('id')
    .single()

  if (error) throw error
  return result.id
}

export async function updateClientFromCompany(
  clientId: string,
  data: {
    nome: string
    empresa: string
    cnpj: string
    email: string
    telefone: string
  },
): Promise<void> {
  const { error } = await supabase
    .from('clientes_externos')
    .update({
      nome: data.nome,
      empresa: data.empresa,
      cnpj: data.cnpj || null,
      email: data.email || null,
      telefone: data.telefone || null,
    })
    .eq('id', clientId)

  if (error) throw error
}
