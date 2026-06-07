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
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [demand?.status])

  if (!demand) return null

  const safeGetTime = (dateStr?: string) => {
    if (!dateStr) return null
    const time = new Date(dateStr).getTime()
    return isNaN(time) ? null : time
  }

  const createdAt = safeGetTime(demand.createdAt) || now
  const completedAt =
    safeGetTime((demand as any).data_conclusao) ||
    safeGetTime((demand as any).completedAt) ||
    safeGetTime(demand.lastStatusChangeAt) ||
    now

  let totalTime = 0
  if (demand.status === 'Concluído') {
    totalTime = Math.max(0, completedAt - createdAt)
  } else {
    totalTime = Math.max(0, now - createdAt)
  }

  const lastChange = safeGetTime(demand.lastStatusChangeAt) || createdAt
  const currentPhaseElapsed = Math.max(0, now - lastChange)

  const timePending =
    (demand.timePendingMs || 0) + (demand.status === 'Pendente' ? currentPhaseElapsed : 0)
  const timeInProgress =
    (demand.timeInProgressMs || 0) + (demand.status === 'Em Andamento' ? currentPhaseElapsed : 0)

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return '00:00:00'
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    return days > 0 ? `${days}d ${timeStr}` : timeStr
  }

  if (demand.status === 'Concluído') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 text-[10px] font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded-md w-fit border border-green-200/50',
              className,
            )}
          >
            <CheckCircle className="w-3 h-3" />
            <span>{formatTime(totalTime)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            <strong>Tempo Total:</strong> {formatTime(totalTime)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Pendente: {formatTime(timePending)}</p>
          <p className="text-muted-foreground text-xs">
            Em Andamento: {formatTime(timeInProgress)}
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const isPending = demand.status === 'Pendente'
  const Icon = isPending ? Pause : Play

  const totalHours = totalTime / (1000 * 60 * 60)
  let isDelayed = false
  let isNearDeadline = false

  if (demand.dueDate) {
    const dueTime = safeGetTime(demand.dueDate)
    if (dueTime) {
      isDelayed = now > dueTime
      isNearDeadline = !isDelayed && dueTime - now < 1000 * 60 * 60 * 24
    }
  } else {
    if (totalHours >= 48) isDelayed = true
    else if (totalHours >= 24) isNearDeadline = true
  }

  const colorClass = isDelayed
    ? 'text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200/50'
    : isNearDeadline
      ? 'text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200/50'
      : isPending
        ? 'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50'
        : 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200/50'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1.5 text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md w-fit border transition-colors',
            colorClass,
            className,
          )}
        >
          <Icon className="w-3 h-3" />
          <span>{formatTime(totalTime)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          <strong>Total acumulado:</strong> {formatTime(totalTime)}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">Pendente: {formatTime(timePending)}</p>
        <p className="text-muted-foreground text-xs">Em Andamento: {formatTime(timeInProgress)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
