import { useEffect, useState } from 'react'
import { cn, formatHierarchicalTime } from '@/lib/utils'
import { Play, Pause, CheckCircle, Clock } from 'lucide-react'
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
        : demand.timePendingMs || 0

  const timeInProgressMs =
    demand.status === 'Pendente'
      ? 0
      : demand.status === 'Em Andamento' && acceptedAt
        ? Math.max(0, now - acceptedAt)
        : demand.status === 'Concluído' && completedAt && acceptedAt
          ? Math.max(0, completedAt - acceptedAt)
          : demand.timeInProgressMs || 0

  const leadtimeTotalMs =
    demand.status === 'Concluído' && completedAt
      ? Math.max(0, completedAt - createdAt)
      : Math.max(0, now - createdAt)

  let displayedTimeMs = 0
  if (demand.status === 'Pendente') displayedTimeMs = timePendingMs
  else if (demand.status === 'Em Andamento') displayedTimeMs = timeInProgressMs
  else displayedTimeMs = leadtimeTotalMs

  const isPending = demand.status === 'Pendente'
  const isProgress = demand.status === 'Em Andamento'
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
            'flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md w-fit border transition-colors cursor-help',
            colorClass,
            className,
          )}
        >
          <Icon className="w-3 h-3" />
          <span className="font-mono tracking-tight whitespace-nowrap">
            {formatHierarchicalTime(displayedTimeMs)}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="p-3 bg-card border shadow-lg w-56 flex flex-col gap-2">
        <p className="font-bold text-xs mb-1 text-foreground">Métricas de Tempo</p>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Pause className="w-3 h-3" /> Pendente:
          </span>
          <span className="font-mono font-medium text-foreground">
            {formatHierarchicalTime(timePendingMs)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Play className="w-3 h-3" /> Execução:
          </span>
          <span className="font-mono font-medium text-foreground">
            {formatHierarchicalTime(timeInProgressMs)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs border-t border-border pt-1 mt-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Lead Time:
          </span>
          <span className="font-mono font-bold text-foreground">
            {formatHierarchicalTime(leadtimeTotalMs)}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
