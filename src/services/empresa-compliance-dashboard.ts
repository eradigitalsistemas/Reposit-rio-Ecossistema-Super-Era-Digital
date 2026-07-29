import { supabase } from '@/lib/supabase/client'
import { fetchComplianceDocs } from '@/services/empresa-compliance'
import { getComplianceStatus, type ComplianceStatus } from '@/lib/compliance-status'

export interface CompanyCompliance {
  id: string
  nome: string
  empresa: string | null
  cnpj: string | null
  status: ComplianceStatus
  soonestExpiry: string | null
  totalDocs: number
  expiredDocs: number
  expiringDocs: number
}

function computeWorstStatus(dates: (string | null)[]): {
  status: ComplianceStatus
  soonest: string | null
} {
  const now = new Date()
  let worst: ComplianceStatus = 'none'
  let soonest: string | null = null
  for (const date of dates) {
    const s = getComplianceStatus(date, now)
    if (s === 'expired') worst = 'expired'
    else if (s === 'near' && worst !== 'expired') worst = 'near'
    else if (s === 'valid' && worst === 'none') worst = 'valid'
    if (date && (!soonest || new Date(date) < new Date(soonest))) soonest = date
  }
  return { status: worst, soonest }
}

export async function fetchAllCompaniesCompliance(): Promise<CompanyCompliance[]> {
  const { data: empresas, error } = await supabase
    .from('clientes_externos')
    .select('id, nome, empresa, cnpj')
    .order('nome', { ascending: true })
  if (error) throw error
  if (!empresas?.length) return []

  const results = await Promise.all(
    empresas.map(async (emp) => {
      try {
        const docs = await fetchComplianceDocs(emp.id)
        const dates = docs.map((d) => d.dataValidade)
        const { status, soonest } = computeWorstStatus(dates)
        const now = new Date()
        return {
          id: emp.id,
          nome: emp.nome,
          empresa: emp.empresa,
          cnpj: emp.cnpj,
          status,
          soonestExpiry: soonest,
          totalDocs: docs.length,
          expiredDocs: docs.filter((d) => getComplianceStatus(d.dataValidade, now) === 'expired')
            .length,
          expiringDocs: docs.filter((d) => getComplianceStatus(d.dataValidade, now) === 'near')
            .length,
        }
      } catch {
        return {
          id: emp.id,
          nome: emp.nome,
          empresa: emp.empresa,
          cnpj: emp.cnpj,
          status: 'none' as ComplianceStatus,
          soonestExpiry: null,
          totalDocs: 0,
          expiredDocs: 0,
          expiringDocs: 0,
        }
      }
    }),
  )
  return results
}
