import { useState, useEffect, useCallback } from 'react'
import {
  fetchAllComplianceBatch,
  type ComplianceSummaryItem,
} from '@/services/empresa-compliance-batch'

export interface GlobalComplianceData {
  summary: ComplianceSummaryItem[]
  total: number
  totalCompanies: number
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

export function useGlobalCompliance(): GlobalComplianceData {
  const [summary, setSummary] = useState<ComplianceSummaryItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchAllComplianceBatch()
      const aggregated: Record<string, ComplianceSummaryItem> = {}

      for (const [, items] of result.summaryByCompany) {
        for (const item of items) {
          if (!aggregated[item.name]) {
            aggregated[item.name] = { ...item, value: 0 }
          }
          aggregated[item.name].value += item.value
        }
      }

      const orderedNames = ['Anexado', 'A vencer', 'Vencido', 'Pendente']
      const merged = orderedNames.map((name) => aggregated[name]).filter(Boolean)

      setSummary(merged)
      setTotal(merged.reduce((sum, d) => sum + d.value, 0))
      setTotalCompanies(result.empresas.length)
    } catch {
      setError('Falha ao carregar dados de conformidade global.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { summary, total, totalCompanies, loading, error, refresh: load }
}
