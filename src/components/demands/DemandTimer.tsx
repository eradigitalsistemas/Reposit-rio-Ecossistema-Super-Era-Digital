import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, CheckCircle } from 'lucide-react'
import { Demand } from '@/types/demand'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface DemandTimerProps {
  demand: Demand
  className?: string
}

export function DemandTimer({ demand, className }: DemandTimerProps) {
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

  let displayedTimeMs = 0
  if (demand.status === 'Pendente') {
    displayedTimeMs = timePending
  } else if (demand.status === 'Em Andamento') {
    displayedTimeMs = timeInProgress
  } else if (demand.status === 'Concluído') {
    displayedTimeMs = Math.max(0, completedAt - createdAt)
  }

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

  const isPending = demand.status === 'Pendente'
  const Icon = demand.status === 'Concluído' ? CheckCircle : isPending ? Pause : Play

  let colorClass = ''
  if (demand.status === 'Concluído') {
    colorClass =
      'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200/50'
  } else if (isPending) {
    colorClass =
      'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50'
  } else {
    colorClass =
      'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200/50'
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md w-fit border transition-colors',
            colorClass,
            className,
          )}
        >
          <Icon className="w-3 h-3" />
          <span>{formatTime(displayedTimeMs)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {demand.status === 'Concluído' ? (
          <p>
            <strong>Lead Time Total:</strong> {formatTime(displayedTimeMs)}
          </p>
        ) : (
          <p>
            <strong>Tempo em {demand.status}:</strong> {formatTime(displayedTimeMs)}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">Pendente: {formatTime(timePending)}</p>
        <p className="text-muted-foreground text-xs">Em Andamento: {formatTime(timeInProgress)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
