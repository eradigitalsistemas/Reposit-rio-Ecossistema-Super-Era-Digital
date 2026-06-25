import { useEffect, useState } from 'react'
import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Timer } from 'lucide-react'

interface DemandMetricsProps {
  demand: Demand
}

export function DemandMetrics({ demand }: DemandMetricsProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!demand || demand.status === 'Concluído') return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [demand?.status])

  if (!demand) return null

  const safeGetTime = (dateStr?: string | null) => {
    if (!dateStr) return null
    const time = new Date(dateStr).getTime()
    return isNaN(time) ? null : time
  }

  const createdAt = safeGetTime(demand.createdAt) || now
  const acceptedAt = safeGetTime(demand.acceptedAt) || safeGetTime((demand as any).data_aceite)
  const completedAt = safeGetTime(demand.completedAt) || safeGetTime((demand as any).data_conclusao)

  const timePendingMs =
    demand.status === 'Pendente'
      ? Math.max(0, now - createdAt)
      : acceptedAt
        ? Math.max(0, acceptedAt - createdAt)
        : demand.timePendingMs ||
          Math.max(0, (safeGetTime(demand.lastStatusChangeAt) || now) - createdAt)

  const leadtimeTotalMs =
    demand.status === 'Concluído' && completedAt
      ? Math.max(0, completedAt - createdAt)
      : Math.max(0, now - createdAt)

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return '00:00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const h = hours.toString().padStart(2, '0')
    const m = minutes.toString().padStart(2, '0')
    const s = seconds.toString().padStart(2, '0')

    return `${h}:${m}:${s}`
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-1">
              Tempo Pendente
            </p>
            <p className="text-2xl font-bold font-mono text-amber-900 dark:text-amber-400">
              {formatTime(timePendingMs)}
            </p>
          </div>
          <Timer className="w-8 h-8 text-amber-500/50" />
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-500/10 border-blue-200/50 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-500 uppercase tracking-wider mb-1">
              Lead Time Total
            </p>
            <p className="text-2xl font-bold font-mono text-blue-900 dark:text-blue-400">
              {formatTime(leadtimeTotalMs)}
            </p>
          </div>
          <Clock className="w-8 h-8 text-blue-500/50" />
        </CardContent>
      </Card>
    </div>
  )
}
