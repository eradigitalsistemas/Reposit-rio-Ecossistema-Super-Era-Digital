import { supabase } from '@/lib/supabase/client'

export interface CompanyDocument {
  id: string
  name: string
  path: string
  type: string
  createdAt: string
}

export interface CompanyInfo {
  id: string
  empresa: string
  cnpj: string
  responsavel: string
  telefone: string
  email: string
  documentos: CompanyDocument[]
  created_at: string
  updated_at: string
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
      responsavel: payload.responsavel || null,
      telefone: payload.telefone || null,
      email: payload.email || null,
      documentos: [],
    })
    .select('*')
    .single()

  if (error) throw error
  return data as CompanyInfo
}

export async function updateCompanyInfo(
  id: string,
  payload: Partial<Pick<CompanyInfo, 'empresa' | 'cnpj' | 'responsavel' | 'telefone' | 'email'>>,
): Promise<void> {
  const { error } = await supabase
    .from('documentos_empresa')
    .update({
      empresa: payload.empresa,
      cnpj: payload.cnpj,
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
