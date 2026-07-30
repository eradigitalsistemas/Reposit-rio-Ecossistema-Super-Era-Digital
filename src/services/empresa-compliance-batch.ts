import { supabase } from '@/lib/supabase/client'
import type { Empresa } from '@/services/empresas'
import type { ComplianceDoc } from '@/services/empresa-compliance'
import type { ComplianceStatus } from '@/lib/compliance-status'
import { getComplianceStatus } from '@/lib/compliance-status'
import type { CompanyCompliance } from '@/services/empresa-compliance-dashboard'

export interface ComplianceSummaryItem {
  name: string
  value: number
  color: string
}

export interface BatchResult {
  empresas: Empresa[]
  docsByCompany: Map<string, ComplianceDoc[]>
  summaryByCompany: Map<string, ComplianceSummaryItem[]>
  dashboardData: CompanyCompliance[]
}

const EXPECTED_CERT = ['Federal', 'FGTS', 'INSS', 'Trabalhista']
const EXPECTED_SST = ['PPRA', 'PCMSO', 'LTCAT']
const EXPECTED_CONST = ['Contrato Social', 'Última Alteração Contratual', 'Cartão CNPJ']
const COLORS = { anexado: '#22c55e', vencendo: '#f59e0b', vencido: '#ef4444', pendente: '#9ca3af' }

function groupBy<T>(arr: T[], key: keyof T): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const item of arr) {
    const k = String(item[key] ?? '')
    if (!k) continue
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(item)
  }
  return m
}

function catByDate(
  hasFile: boolean,
  dv: string | null,
  now: Date,
  c: { anexado: number; vencendo: number; vencido: number; pendente: number },
) {
  if (!hasFile || !dv) {
    c.pendente++
    return
  }
  const s = getComplianceStatus(dv, now)
  if (s === 'valid') c.anexado++
  else if (s === 'near') c.vencendo++
  else if (s === 'expired') c.vencido++
  else c.pendente++
}

function worstStatus(dates: (string | null)[]): {
  status: ComplianceStatus
  soonest: string | null
} {
  const now = new Date()
  let w: ComplianceStatus = 'none'
  let s: string | null = null
  for (const d of dates) {
    const st = getComplianceStatus(d, now)
    if (st === 'expired') w = 'expired'
    else if (st === 'near' && w !== 'expired') w = 'near'
    else if (st === 'valid' && w === 'none') w = 'valid'
    if (d && (!s || new Date(d) < new Date(s))) s = d
  }
  return { status: w, soonest: s }
}

export async function fetchAllComplianceBatch(): Promise<BatchResult> {
  const [empRes, certRes, sstRes, constRes, colabRes, atestRes, cDocRes, catRes, perRes, rescRes] =
    await Promise.all([
      supabase
        .from('clientes_externos')
        .select('id, nome, empresa, cnpj, email, telefone')
        .order('nome', { ascending: true }),
      supabase.from('certidoes_empresa').select('*'),
      supabase.from('sst_documents').select('*'),
      supabase.from('documentos_constituicao').select('*'),
      supabase.from('colaboradores').select('id, nome, empresa_id'),
      supabase.from('colaborador_atestados').select('*'),
      supabase.from('colaborador_documentos').select('*').in('tipo', ['S2240', 'S2220']),
      supabase.from('colaborador_cat').select('*'),
      supabase.from('colaborador_periodicos').select('*'),
      supabase.from('rescisao_checklist').select('*'),
    ])

  const empresas = (empRes.data || []) as Empresa[]
  const now = new Date()

  const certByCo = groupBy((certRes.data || []) as any[], 'empresa_id')
  const sstByCo = groupBy((sstRes.data || []) as any[], 'empresa_id')
  const constByCo = groupBy((constRes.data || []) as any[], 'empresa_id')
  const colabMap = new Map<string, { nome: string; empresa_id: string | null }>(
    (colabRes.data || []).map((c: any) => [c.id, { nome: c.nome, empresa_id: c.empresa_id }]),
  )

  function groupViaColab<T extends { colaborador_id: string }>(arr: T[]): Map<string, T[]> {
    const m = new Map<string, T[]>()
    for (const item of arr) {
      const co = colabMap.get(item.colaborador_id)
      if (!co?.empresa_id) continue
      if (!m.has(co.empresa_id)) m.set(co.empresa_id, [])
      m.get(co.empresa_id)!.push(item)
    }
    return m
  }

  const atestByCo = groupViaColab((atestRes.data || []) as any[])
  const cDocByCo = groupViaColab((cDocRes.data || []) as any[])
  const catByCo = groupViaColab((catRes.data || []) as any[])
  const perByCo = groupViaColab((perRes.data || []) as any[])
  const rescByCo = groupBy((rescRes.data || []) as any[], 'empresa_id')

  const docsByCompany = new Map<string, ComplianceDoc[]>()
  const summaryByCompany = new Map<string, ComplianceSummaryItem[]>()
  const dashboardData: CompanyCompliance[] = []

  for (const emp of empresas) {
    const certs = certByCo.get(emp.id) || []
    const ssts = sstByCo.get(emp.id) || []
    const consts = constByCo.get(emp.id) || []
    const atests = atestByCo.get(emp.id) || []
    const cDocs = cDocByCo.get(emp.id) || []
    const cats = catByCo.get(emp.id) || []
    const pers = perByCo.get(emp.id) || []
    const recs = rescByCo.get(emp.id) || []

    const docs: ComplianceDoc[] = []
    certs.forEach((c: any) =>
      docs.push({
        id: c.id,
        tipo: c.tipo_certidao,
        categoria: 'Certidões',
        dataValidade: c.data_validade,
        arquivoUrl: c.arquivo_url,
      }),
    )
    ssts.forEach((s: any) =>
      docs.push({
        id: s.id,
        tipo: s.categoria,
        categoria: 'Documentos SST',
        dataValidade: s.data_validade,
        arquivoUrl: s.arquivo_url,
      }),
    )
    consts.forEach((d: any) =>
      docs.push({
        id: d.id,
        tipo: d.tipo,
        categoria: 'Constituição',
        dataValidade: null,
        arquivoUrl: d.arquivo_url,
      }),
    )
    atests.forEach((a: any) =>
      docs.push({
        id: a.id,
        tipo: `ASO - ${a.tipo}`,
        categoria: 'Atestados',
        dataValidade: a.data_vencimento,
        arquivoUrl: a.aso_url,
        colaboradorNome: colabMap.get(a.colaborador_id)?.nome,
      }),
    )
    cDocs.forEach((d: any) =>
      docs.push({
        id: d.id,
        tipo: d.tipo,
        categoria: 'Documentos SST',
        dataValidade: d.validade,
        arquivoUrl: d.url,
        colaboradorNome: colabMap.get(d.colaborador_id)?.nome,
      }),
    )
    cats.forEach((c: any) =>
      docs.push({
        id: c.id,
        tipo: `CAT - ${c.tipo}`,
        categoria: 'Documentos SST',
        dataValidade: null,
        arquivoUrl: c.arquivo_url,
        colaboradorNome: colabMap.get(c.colaborador_id)?.nome,
      }),
    )
    pers.forEach((p: any) =>
      docs.push({
        id: p.id,
        tipo: p.exames || 'Exame Periódico',
        categoria: 'Documentos SST',
        dataValidade: null,
        arquivoUrl: p.arquivo_url,
        colaboradorNome: colabMap.get(p.colaborador_id)?.nome,
      }),
    )
    recs.forEach((r: any) =>
      docs.push({
        id: r.id,
        tipo: `Rescisão - ${r.item}`,
        categoria: 'Constituição',
        dataValidade: null,
        arquivoUrl: r.arquivo_url,
        colaboradorNome: colabMap.get(r.colaborador_id)?.nome,
      }),
    )
    docsByCompany.set(emp.id, docs)

    const c = { anexado: 0, vencendo: 0, vencido: 0, pendente: 0 }
    certs.forEach((x: any) => catByDate(!!x.arquivo_url, x.data_validade, now, c))
    EXPECTED_CERT.forEach((t) => {
      if (!certs.some((x: any) => x.tipo_certidao === t)) c.pendente++
    })
    ssts.forEach((x: any) => catByDate(!!x.arquivo_url, x.data_validade, now, c))
    EXPECTED_SST.forEach((t) => {
      if (!ssts.some((x: any) => x.categoria === t)) c.pendente++
    })
    consts.forEach((d: any) => {
      if (d.arquivo_url && d.status === 'Concluído') c.anexado++
      else c.pendente++
    })
    EXPECTED_CONST.forEach((t) => {
      if (!consts.some((x: any) => x.tipo === t)) c.pendente++
    })
    atests.forEach((a: any) => catByDate(!!a.aso_url, a.data_vencimento, now, c))
    cDocs.forEach((d: any) => catByDate(!!d.url, d.validade, now, c))
    pers.forEach((p: any) => {
      if (p.arquivo_url) c.anexado++
      else c.pendente++
    })
    recs.forEach((r: any) => {
      if (r.arquivo_url) c.anexado++
      else c.pendente++
    })

    summaryByCompany.set(emp.id, [
      { name: 'Anexado', value: c.anexado, color: COLORS.anexado },
      { name: 'A vencer', value: c.vencendo, color: COLORS.vencendo },
      { name: 'Vencido', value: c.vencido, color: COLORS.vencido },
      { name: 'Pendente', value: c.pendente, color: COLORS.pendente },
    ])

    const { status, soonest } = worstStatus(docs.map((d) => d.dataValidade))
    dashboardData.push({
      id: emp.id,
      nome: emp.nome,
      empresa: emp.empresa,
      cnpj: emp.cnpj,
      status,
      soonestExpiry: soonest,
      totalDocs: docs.length,
      expiredDocs: docs.filter((d) => getComplianceStatus(d.dataValidade, now) === 'expired')
        .length,
      expiringDocs: docs.filter((d) => getComplianceStatus(d.dataValidade, now) === 'near').length,
    })
  }

  return { empresas, docsByCompany, summaryByCompany, dashboardData }
}
