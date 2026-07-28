import { supabase } from '@/lib/supabase/client'
import { uploadColaboradorFile } from '@/services/empresa-files'

export interface RescisaoItem {
  id: string
  empresa_id: string
  colaborador_id: string
  item: string
  status: string
  arquivo_url: string | null
  created_at: string
}

export const RESCISAO_ITEMS = [
  { value: 'AVISO_PREVIO', label: 'Aviso Prévio' },
  { value: 'TRCT', label: 'TRCT' },
  { value: 'MULTA_40_FGTS', label: 'Multa 40% FGTS' },
  { value: 'ASO_DEMISSIONAL', label: 'ASO Demissional' },
  { value: 'GUIA_SEGURO_DESEMPREGO', label: 'Guia Seguro Desemprego' },
  { value: 'HOMOLOGACAO', label: 'Homologação' },
  { value: 'CHAVE_ESOCIAL', label: 'Chave eSocial' },
] as const

export async function fetchRescisaoChecklist(
  empresaId: string,
  colaboradorId: string,
): Promise<RescisaoItem[]> {
  const { data, error } = await supabase
    .from('rescisao_checklist')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('colaborador_id', colaboradorId)
  if (error) throw error
  return (data || []) as RescisaoItem[]
}

export async function upsertRescisaoItem(
  empresaId: string,
  colaboradorId: string,
  item: string,
  updates: { status?: string; file?: File },
): Promise<void> {
  const { data: existing } = await supabase
    .from('rescisao_checklist')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('colaborador_id', colaboradorId)
    .eq('item', item)
    .maybeSingle()

  let arquivoUrl: string | undefined
  if (updates.file) {
    arquivoUrl = await uploadColaboradorFile(colaboradorId, updates.file, `rescisao/${item}`)
  }

  if (existing) {
    const patch: Record<string, string> = {}
    if (updates.status) patch.status = updates.status
    if (arquivoUrl) patch.arquivo_url = arquivoUrl
    if (Object.keys(patch).length > 0) {
      const { error } = await supabase
        .from('rescisao_checklist')
        .update(patch)
        .eq('id', existing.id)
      if (error) throw error
    }
  } else {
    const { error } = await supabase.from('rescisao_checklist').insert({
      empresa_id: empresaId,
      colaborador_id: colaboradorId,
      item,
      status: updates.status || 'Pendente',
      arquivo_url: arquivoUrl || null,
    })
    if (error) throw error
  }
}
