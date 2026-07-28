import { supabase } from '@/lib/supabase/client'
import { uploadColaboradorFile, deleteEmpresaFile } from '@/services/empresa-files'

export interface ColabDoc {
  id: string
  colaborador_id: string
  tipo: string
  url: string
  nome_arquivo: string | null
  status: string | null
  created_at: string
  validade: string | null
}

const DOC_TYPES = ['Pessoal', 'S2240', 'S2220']

export async function fetchColaboradorDocs(colaboradorId: string): Promise<ColabDoc[]> {
  const { data, error } = await supabase
    .from('colaborador_documentos')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .in('tipo', DOC_TYPES)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as ColabDoc[]
}

export async function upsertColaboradorDoc(
  colaboradorId: string,
  tipo: string,
  file: File,
): Promise<ColabDoc> {
  const path = await uploadColaboradorFile(colaboradorId, file, tipo)
  const { data: existing } = await supabase
    .from('colaborador_documentos')
    .select('id')
    .eq('colaborador_id', colaboradorId)
    .eq('tipo', tipo)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('colaborador_documentos')
      .update({ url: path, nome_arquivo: file.name })
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw error
    return data as ColabDoc
  }

  const { data, error } = await supabase
    .from('colaborador_documentos')
    .insert({ colaborador_id: colaboradorId, tipo, url: path, nome_arquivo: file.name })
    .select('*')
    .single()
  if (error) throw error
  return data as ColabDoc
}

export async function updateColaboradorDocStatus(docId: string, status: string): Promise<void> {
  const { error } = await supabase.from('colaborador_documentos').update({ status }).eq('id', docId)
  if (error) throw error
}

export async function createColaboradorDocPersonal(
  colaboradorId: string,
  title: string,
  file: File,
): Promise<ColabDoc> {
  const path = await uploadColaboradorFile(colaboradorId, file, 'Pessoal')
  const { data, error } = await supabase
    .from('colaborador_documentos')
    .insert({ colaborador_id: colaboradorId, tipo: 'Pessoal', url: path, nome_arquivo: title })
    .select('*')
    .single()
  if (error) throw error
  return data as ColabDoc
}

export async function deleteColaboradorDoc(doc: ColabDoc): Promise<void> {
  if (doc.url) await deleteEmpresaFile(doc.url)
  const { error } = await supabase.from('colaborador_documentos').delete().eq('id', doc.id)
  if (error) throw error
}
