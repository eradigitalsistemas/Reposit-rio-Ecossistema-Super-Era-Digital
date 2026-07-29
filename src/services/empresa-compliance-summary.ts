import { supabase } from '@/lib/supabase/client'
import { getComplianceStatus } from '@/lib/compliance-status'

export interface ComplianceSummaryItem {
  name: string
  value: number
  color: string
}

interface Counts {
  anexado: number
  vencendo: number
  vencido: number
  pendente: number
}

function categorizeByDate(
  hasFile: boolean,
  dataValidade: string | null,
  now: Date,
  counts: Counts,
) {
  if (!hasFile || !dataValidade) {
    counts.pendente++
    return
  }
  const status = getComplianceStatus(dataValidade, now)
  if (status === 'valid') counts.anexado++
  else if (status === 'near') counts.vencendo++
  else if (status === 'expired') counts.vencido++
  else counts.pendente++
}

const EXPECTED_CERTIDOES = ['Federal', 'FGTS', 'INSS', 'Trabalhista']
const EXPECTED_SST = ['PPRA', 'PCMSO', 'LTCAT']
const EXPECTED_CONSTITUICAO = ['Contrato Social', 'Última Alteração Contratual', 'Cartão CNPJ']

export async function fetchComplianceSummary(empresaId: string): Promise<ComplianceSummaryItem[]> {
  const counts: Counts = { anexado: 0, vencendo: 0, vencido: 0, pendente: 0 }
  const now = new Date()

  const [certRes, sstRes, constRes] = await Promise.all([
    supabase.from('certidoes_empresa').select('*').eq('empresa_id', empresaId),
    supabase.from('sst_documents').select('*').eq('empresa_id', empresaId),
    supabase.from('documentos_constituicao').select('*').eq('empresa_id', empresaId),
  ])

  for (const c of certRes.data || []) {
    categorizeByDate(!!c.arquivo_url, c.data_validade, now, counts)
  }
  const existingCert = new Set((certRes.data || []).map((c) => c.tipo_certidao))
  EXPECTED_CERTIDOES.forEach((t) => {
    if (!existingCert.has(t)) counts.pendente++
  })

  for (const s of sstRes.data || []) {
    categorizeByDate(!!s.arquivo_url, s.data_validade, now, counts)
  }
  const existingSst = new Set((sstRes.data || []).map((s) => s.categoria))
  EXPECTED_SST.forEach((t) => {
    if (!existingSst.has(t)) counts.pendente++
  })

  for (const d of constRes.data || []) {
    if (d.arquivo_url && d.status === 'Concluído') counts.anexado++
    else counts.pendente++
  }
  const existingConst = new Set((constRes.data || []).map((d) => d.tipo))
  EXPECTED_CONSTITUICAO.forEach((t) => {
    if (!existingConst.has(t)) counts.pendente++
  })

  const { data: colaboradores } = await supabase
    .from('colaboradores')
    .select('id')
    .eq('empresa_id', empresaId)

  if (colaboradores?.length) {
    const ids = colaboradores.map((c) => c.id)
    const [atestRes, colabDocRes, perRes] = await Promise.all([
      supabase.from('colaborador_atestados').select('*').in('colaborador_id', ids),
      supabase
        .from('colaborador_documentos')
        .select('*')
        .in('colaborador_id', ids)
        .in('tipo', ['S2240', 'S2220']),
      supabase.from('colaborador_periodicos').select('*').in('colaborador_id', ids),
    ])

    for (const a of atestRes.data || []) {
      categorizeByDate(!!a.aso_url, a.data_vencimento, now, counts)
    }
    for (const d of colabDocRes.data || []) {
      categorizeByDate(!!d.url, d.validade, now, counts)
    }
    for (const p of perRes.data || []) {
      if (p.arquivo_url) counts.anexado++
      else counts.pendente++
    }
  }

  return [
    { name: 'Anexado', value: counts.anexado, color: '#22c55e' },
    { name: 'A vencer', value: counts.vencendo, color: '#f59e0b' },
    { name: 'Vencido', value: counts.vencido, color: '#ef4444' },
    { name: 'Pendente', value: counts.pendente, color: '#9ca3af' },
  ]
}
