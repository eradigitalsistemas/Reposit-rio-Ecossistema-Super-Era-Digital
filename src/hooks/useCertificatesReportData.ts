import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from 'date-fns'

export function useCertificatesReportData(
  role: string | undefined,
  dateFilter: string,
  customStartDate: string,
  customEndDate: string,
) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role !== 'Admin') return
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: certs, error: certsErr } = await supabase
          .from('protocolos_certificados' as any)
          .select('*')

        if (!isMounted) return
        if (certsErr) throw certsErr
        setData(certs || [])
      } catch (err: any) {
        if (!isMounted) return
        setError('Não foi possível carregar os dados.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [role])

  const parseLocalDate = useCallback((dateStr: string, isEnd: boolean) => {
    if (!dateStr) return isEnd ? new Date(8640000000000000) : new Date(0)
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return isEnd ? endOfDay(d) : startOfDay(d)
  }, [])

  const filterInterval = useMemo(() => {
    const now = new Date()
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        }
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom': {
        const start = parseLocalDate(customStartDate, false)
        let end = parseLocalDate(customEndDate, true)
        if (start > end) end = start
        return { start, end }
      }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }, [dateFilter, customStartDate, customEndDate, parseLocalDate])

  const isDateInFilter = useCallback(
    (dateString: string) => {
      if (!dateString) return false
      const date = new Date(dateString)
      return !isNaN(date.getTime()) && isWithinInterval(date, filterInterval)
    },
    [filterInterval],
  )

  const filteredCerts = useMemo(
    () => data.filter((d: any) => isDateInFilter(d.data_criacao)),
    [data, isDateInFilter],
  )

  return {
    raw: data,
    loading,
    error,
    filteredCerts,
    totalCerts: filteredCerts.length,
    certsPF: filteredCerts.filter((c) => c.tipo === 'PF').length,
    certsPJ: filteredCerts.filter((c) => c.tipo === 'PJ').length,
    certsSafeID4: filteredCerts.filter((c) => c.tipo === 'SafeID - 4 meses').length,
    certsSafeID3: filteredCerts.filter((c) => c.tipo === 'SafeID - 3 anos').length,
  }
}
