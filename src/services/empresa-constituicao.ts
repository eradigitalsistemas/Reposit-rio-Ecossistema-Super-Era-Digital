import { supabase } from '@/lib/supabase/client'
import { uploadEmpresaFile } from '@/services/empresa-files'

export type ConstituicaoTipo = 'CNPJ' | 'CONTRATO_SOCIAL' | 'ALTERACOES_CONTRATUAIS'

export interface ConstituicaoDoc {
  id: string
  empresa_id: string
  tipo: ConstituicaoTipo
  arquivo_url: string | null
  status: string
  created_at: string
}

export async function fetchConstituicaoDocs(empresaId: string): Promise<ConstituicaoDoc[]> {
  const { data, error } = await supabase
    .from('documentos_constituicao')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []) as ConstituicaoDoc[]
}

export async function upsertConstituicaoDoc(
  empresaId: string,
  tipo: ConstituicaoTipo,
  file: File,
): Promise<ConstituicaoDoc> {
  const path = await uploadEmpresaFile(empresaId, file, `constituicao/${tipo}`)
  const { data: existing } = await supabase
    .from('documentos_constituicao')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('tipo', tipo)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('documentos_constituicao')
      .update({ arquivo_url: path })
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw error
    return data as ConstituicaoDoc
  }

  const { data, error } = await supabase
    .from('documentos_constituicao')
    .insert({ empresa_id: empresaId, tipo, arquivo_url: path, status: 'Pendente' })
    .select('*')
    .single()
  if (error) throw error
  return data as ConstituicaoDoc
}

export async function updateConstituicaoStatus(docId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('documentos_constituicao')
    .update({ status })
    .eq('id', docId)
  if (error) throw error
}
