import { useEffect, useState } from 'react'
import { Demand } from '@/types/demand'
import { Clock } from 'lucide-react'

interface DemandMetricsProps {
  demand: Demand
}

export function DemandMetrics({ demand }: DemandMetricsProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!demand || demand.status === 'Concluído') return
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [demand?.status])

  if (!demand) return null

  const safeGetTime = (dateStr?: string | null) => {
    if (!dateStr) return null
    const time = new Date(dateStr).getTime()
    return isNaN(time) ? null : time
  }

  const createdAt = safeGetTime(demand.createdAt) || now
  const lastChange = safeGetTime(demand.lastStatusChangeAt) || createdAt
  const completedAt =
    safeGetTime(demand.completedAt) ||
    safeGetTime((demand as any).data_conclusao) ||
    safeGetTime(demand.lastStatusChangeAt) ||
    now

  const currentPhaseElapsed = demand.status === 'Concluído' ? 0 : Math.max(0, now - lastChange)

  const timePending =
    (demand.timePendingMs || 0) + (demand.status === 'Pendente' ? currentPhaseElapsed : 0)
  const timeInProgress =
    (demand.timeInProgressMs || 0) + (demand.status === 'Em Andamento' ? currentPhaseElapsed : 0)

  const leadTime =
    demand.status === 'Concluído'
      ? Math.max(0, completedAt - createdAt)
      : Math.max(0, now - createdAt)

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return '0m'
    const totalMinutes = Math.floor(ms / 60000)

    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        Métricas de Tempo
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 rounded-lg shadow-sm">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-0.5">
            Tempo em Pendência
          </p>
          <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
            {formatTime(timePending)}
          </p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 rounded-lg shadow-sm">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-0.5">
            Tempo em Andamento
          </p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
            {formatTime(timeInProgress)}
          </p>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200/50 rounded-lg shadow-sm">
          <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-0.5">
            Lead Time Total
          </p>
          <p className="text-lg font-bold text-green-900 dark:text-green-300">
            {formatTime(leadTime)}
          </p>
        </div>
      </div>
    </div>
  )
}
