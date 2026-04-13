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
  isSameDay,
} from 'date-fns'

export function useCrmReportData(
  role: string | undefined,
  dateFilter: string,
  customStartDate: string,
  customEndDate: string,
) {
  const [data, setData] = useState<any>({ leads: [], demands: [], users: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role !== 'Admin') return
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      try {
        const [leadsRes, demandsRes, usersRes] = await Promise.all([
          supabase.from('leads').select('estagio, data_criacao, status_interesse'),
          supabase
            .from('demandas')
            .select(
              'status, prioridade, responsavel_id, data_criacao, data_vencimento, data_resposta, checklist',
            ),
          supabase.from('usuarios').select('id, nome'),
        ])
        if (!isMounted) return
        if (leadsRes.error) throw leadsRes.error
        if (demandsRes.error) throw demandsRes.error
        if (usersRes.error) throw usersRes.error
        setData({ leads: leadsRes.data, demands: demandsRes.data, users: usersRes.data })
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

  const filteredLeads = useMemo(
    () => data.leads.filter((d: any) => isDateInFilter(d.data_criacao)),
    [data.leads, isDateInFilter],
  )
  const filteredDemands = useMemo(
    () => data.demands.filter((d: any) => isDateInFilter(d.data_criacao)),
    [data.demands, isDateInFilter],
  )

  return {
    raw: data,
    loading,
    error,
    filteredLeads,
    filteredDemands,
    totalLeads: filteredLeads.length,
    demandsToday: data.demands.filter(
      (d: any) => d.data_criacao && isSameDay(new Date(d.data_criacao), new Date()),
    ).length,
    urgentesAberto: filteredDemands.filter(
      (d: any) => d.prioridade === 'Urgente' && d.status !== 'Concluído',
    ).length,
    leadsConvertidos: filteredLeads.filter((d: any) =>
      ['convertido', 'treinamento', 'finalizado', 'pos_venda', 'ativo'].includes(d.estagio),
    ).length,
  }
}
