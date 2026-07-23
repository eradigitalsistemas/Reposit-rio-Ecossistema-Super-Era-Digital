import { supabase } from '@/lib/supabase/client'

export interface ColaboradorEmpresa {
  id: string
  nome: string
  email: string | null
  cpf: string | null
  especialidades: string[] | null
  ativo: boolean | null
  empresa_doc_id: string | null
  data_cadastro: string | null
}

export interface ColaboradorDocumento {
  id: string
  colaborador_id: string
  tipo: 'pessoal' | 'admissional'
  url: string
  nome_arquivo: string | null
  created_at: string
}

export async function fetchColaboradores(empresaDocId: string): Promise<ColaboradorEmpresa[]> {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('empresa_doc_id', empresaDocId)
    .order('data_cadastro', { ascending: false })
  if (error) throw error
  return (data || []) as ColaboradorEmpresa[]
}

export async function createColaborador(
  payload: Pick<ColaboradorEmpresa, 'nome' | 'cpf' | 'empresa_doc_id'> & { email?: string },
): Promise<ColaboradorEmpresa> {
  const { data, error } = await supabase
    .from('colaboradores')
    .insert({
      nome: payload.nome,
      cpf: payload.cpf,
      empresa_doc_id: payload.empresa_doc_id,
      email: payload.email || null,
      ativo: true,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as ColaboradorEmpresa
}

export async function updateColaborador(
  id: string,
  payload: Partial<Pick<ColaboradorEmpresa, 'nome' | 'cpf' | 'email'>>,
): Promise<void> {
  const { error } = await supabase
    .from('colaboradores')
    .update({ nome: payload.nome, cpf: payload.cpf, email: payload.email || null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteColaborador(id: string): Promise<void> {
  const { data: docs } = await supabase
    .from('colaborador_documentos')
    .select('url')
    .eq('colaborador_id', id)
  if (docs && docs.length > 0) {
    const paths = docs.map((d) => d.url).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('documentos-empresa').remove(paths)
    }
  }
  const { error } = await supabase.from('colaboradores').delete().eq('id', id)
  if (error) throw error
}

export async function fetchColaboradorDocumentos(
  colaboradorId: string,
): Promise<ColaboradorDocumento[]> {
  const { data, error } = await supabase
    .from('colaborador_documentos')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []) as ColaboradorDocumento[]
}

export async function uploadColaboradorDocument(
  empresaDocId: string,
  colaboradorId: string,
  file: File,
  tipo: 'pessoal' | 'admissional',
  onProgress?: (pct: number) => void,
): Promise<ColaboradorDocumento> {
  const ext = file.name.split('.').pop()
  const filePath = `empresas/${empresaDocId}/colaboradores/${colaboradorId}/${tipo}/${crypto.randomUUID()}.${ext}`

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

  const { data, error } = await supabase
    .from('colaborador_documentos')
    .insert({
      colaborador_id: colaboradorId,
      tipo,
      url: filePath,
      nome_arquivo: file.name,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as ColaboradorDocumento
}

export async function deleteColaboradorDocumento(docId: string, filePath: string): Promise<void> {
  await supabase.storage.from('documentos-empresa').remove([filePath])
  const { error } = await supabase.from('colaborador_documentos').delete().eq('id', docId)
  if (error) throw error
}

export async function getDocumentoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('documentos-empresa')
    .createSignedUrl(path, 3600)
  if (error) return null
  return data?.signedUrl ?? null
}
