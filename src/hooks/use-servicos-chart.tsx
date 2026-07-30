import { useState, useEffect, useCallback } from 'react'
import {
  fetchCompaniesByServiceType,
  type ServiceTypeItem,
} from '@/services/empresa-servicos-chart'

export interface ServicosChartData {
  data: ServiceTypeItem[]
  total: number
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

export function useServicosChart(): ServicosChartData {
  const [data, setData] = useState<ServiceTypeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchCompaniesByServiceType()
      setData(result)
    } catch {
      setError('Falha ao carregar dados de empresas por serviço.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return { data, total, loading, error, refresh: load }
}
