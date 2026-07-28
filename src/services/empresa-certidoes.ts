import { supabase } from '@/lib/supabase/client'
import { uploadEmpresaFile, deleteEmpresaFile } from '@/services/empresa-files'

export type CertidaoTipo =
  | 'Federal'
  | 'Estadual D1'
  | 'Estadual D2'
  | 'Trabalhista'
  | 'FGTS'
  | 'Municipal'

export interface CertidaoDoc {
  id: string
  empresa_id: string
  tipo_certidao: string
  arquivo_url: string | null
  created_at: string
}

export async function fetchCertidoes(empresaId: string): Promise<CertidaoDoc[]> {
  const { data, error } = await supabase
    .from('certidoes_empresa')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as CertidaoDoc[]
}

export async function uploadCertidao(
  empresaId: string,
  tipo: CertidaoTipo,
  file: File,
): Promise<CertidaoDoc> {
  const path = await uploadEmpresaFile(empresaId, file, `certidoes/${tipo}`)
  const { data, error } = await supabase
    .from('certidoes_empresa')
    .insert({ empresa_id: empresaId, tipo_certidao: tipo, arquivo_url: path })
    .select('*')
    .single()
  if (error) throw error
  return data as CertidaoDoc
}

export async function deleteCertidao(doc: CertidaoDoc): Promise<void> {
  if (doc.arquivo_url) await deleteEmpresaFile(doc.arquivo_url)
  const { error } = await supabase.from('certidoes_empresa').delete().eq('id', doc.id)
  if (error) throw error
}
