import { supabase } from '@/lib/supabase/client'

export interface PieChartSummaryItem {
  name: string
  value: number
  color: string
}

type DocStatus = 'anexado' | 'avencer' | 'vencido' | 'pendente'

function classifyDoc(url: string | null, validade: string | null): DocStatus {
  if (!url) return 'pendente'
  if (!validade) return 'anexado'
  const now = new Date()
  const expiry = new Date(validade)
  if (isNaN(expiry.getTime())) return 'anexado'
  if (expiry < now) return 'vencido'
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 30) return 'avencer'
  return 'anexado'
}

export async function fetchPieChartData(empresaId: string): Promise<PieChartSummaryItem[]> {
  const [certidoesRes, sstRes, colaboradoresRes] = await Promise.all([
    supabase
      .from('certidoes_empresa')
      .select('arquivo_url, data_validade')
      .eq('empresa_id', empresaId),
    supabase.from('sst_documents').select('arquivo_url, data_validade').eq('empresa_id', empresaId),
    supabase.from('colaboradores').select('id').eq('empresa_id', empresaId),
  ])

  const colabIds = (colaboradoresRes.data || []).map((c) => c.id)

  let atestados: { aso_url: string | null; data_vencimento: string | null }[] = []
  let colabDocs: { url: string | null; validade: string | null }[] = []

  if (colabIds.length > 0) {
    const [atestadosRes, colabDocsRes] = await Promise.all([
      supabase
        .from('colaborador_atestados')
        .select('aso_url, data_vencimento')
        .in('colaborador_id', colabIds),
      supabase
        .from('colaborador_documentos')
        .select('url, validade')
        .in('colaborador_id', colabIds)
        .in('tipo', ['s2240', 's2220', 'S2240', 'S2220']),
    ])
    atestados = atestadosRes.data || []
    colabDocs = colabDocsRes.data || []
  }

  const counts: Record<DocStatus, number> = { anexado: 0, avencer: 0, vencido: 0, pendente: 0 }

  for (const doc of certidoesRes.data || []) {
    counts[classifyDoc(doc.arquivo_url, doc.data_validade)]++
  }
  for (const doc of sstRes.data || []) {
    counts[classifyDoc(doc.arquivo_url, doc.data_validade)]++
  }
  for (const doc of atestados) {
    counts[classifyDoc(doc.aso_url, doc.data_vencimento)]++
  }
  for (const doc of colabDocs) {
    counts[classifyDoc(doc.url, doc.validade)]++
  }

  return [
    { name: 'Anexados', value: counts.anexado, color: '#22c55e' },
    { name: 'A Vencer', value: counts.avencer, color: '#f59e0b' },
    { name: 'Vencidos', value: counts.vencido, color: '#ef4444' },
    { name: 'Pendentes', value: counts.pendente, color: '#9ca3af' },
  ]
}
