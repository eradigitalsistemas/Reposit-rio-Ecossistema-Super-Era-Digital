import { supabase } from '@/lib/supabase/client'
import { uploadEmpresaFile, deleteEmpresaFile } from '@/services/empresa-files'

export type SSTCategoria = 'PGR' | 'NR1' | 'LTCAT' | 'PCMSO'

export interface SSTDoc {
  id: string
  empresa_id: string
  categoria: string
  arquivo_url: string | null
  data_emissao: string | null
  data_validade: string | null
  created_at: string
}

export async function fetchSSTDocs(empresaId: string): Promise<SSTDoc[]> {
  const { data, error } = await supabase
    .from('sst_documents')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as SSTDoc[]
}

export async function createSSTDoc(
  empresaId: string,
  categoria: SSTCategoria,
  file: File,
  dataEmissao: string,
  dataValidade: string,
): Promise<SSTDoc> {
  const path = await uploadEmpresaFile(empresaId, file, `sst/${categoria}`)
  const { data, error } = await supabase
    .from('sst_documents')
    .insert({
      empresa_id: empresaId,
      categoria,
      arquivo_url: path,
      data_emissao: dataEmissao || null,
      data_validade: dataValidade || null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as SSTDoc
}

export async function deleteSSTDoc(doc: SSTDoc): Promise<void> {
  if (doc.arquivo_url) await deleteEmpresaFile(doc.arquivo_url)
  const { error } = await supabase.from('sst_documents').delete().eq('id', doc.id)
  if (error) throw error
}
