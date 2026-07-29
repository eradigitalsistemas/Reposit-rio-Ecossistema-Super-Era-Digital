import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Empresa } from '@/services/empresas'
import type { ComplianceDoc } from '@/services/empresa-compliance'
import type { CompanyCompliance } from '@/services/empresa-compliance-dashboard'
import {
  fetchAllComplianceBatch,
  type ComplianceSummaryItem,
} from '@/services/empresa-compliance-batch'

interface CompanyComplianceContextValue {
  empresas: Empresa[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  dashboardData: CompanyCompliance[]
  getComplianceDocs: (empresaId: string) => ComplianceDoc[]
  getComplianceSummary: (empresaId: string) => ComplianceSummaryItem[]
}

const CompanyComplianceContext = createContext<CompanyComplianceContextValue | undefined>(undefined)

export function CompanyComplianceProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [dashboardData, setDashboardData] = useState<CompanyCompliance[]>([])
  const [docsByCompany, setDocsByCompany] = useState<Map<string, ComplianceDoc[]>>(new Map())
  const [summaryByCompany, setSummaryByCompany] = useState<Map<string, ComplianceSummaryItem[]>>(
    new Map(),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchAllComplianceBatch()
      setEmpresas(result.empresas)
      setDashboardData(result.dashboardData)
      setDocsByCompany(result.docsByCompany)
      setSummaryByCompany(result.summaryByCompany)
    } catch {
      setError('Falha ao carregar dados de conformidade.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const getComplianceDocs = useCallback(
    (empresaId: string) => docsByCompany.get(empresaId) || [],
    [docsByCompany],
  )

  const getComplianceSummary = useCallback(
    (empresaId: string) => summaryByCompany.get(empresaId) || [],
    [summaryByCompany],
  )

  return (
    <CompanyComplianceContext.Provider
      value={{
        empresas,
        loading,
        error,
        refresh: load,
        dashboardData,
        getComplianceDocs,
        getComplianceSummary,
      }}
    >
      {children}
    </CompanyComplianceContext.Provider>
  )
}

export function useCompanyCompliance() {
  const ctx = useContext(CompanyComplianceContext)
  if (!ctx) throw new Error('useCompanyCompliance must be used within CompanyComplianceProvider')
  return ctx
}
