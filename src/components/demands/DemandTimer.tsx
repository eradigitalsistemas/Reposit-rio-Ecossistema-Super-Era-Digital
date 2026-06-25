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

  let displayedTimeMs = demand.status === 'Pendente' ? timePendingMs : leadtimeTotalMs

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
          <span className="font-mono tracking-tight">{formatTime(displayedTimeMs)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {demand.status === 'Concluído' ? (
          <p>
            <strong>Lead Time Total:</strong> {formatTime(displayedTimeMs)}
          </p>
        ) : (
          <p>
            <strong>{demand.status === 'Pendente' ? 'Tempo Pendente' : 'Lead Time Total'}:</strong>{' '}
            {formatTime(displayedTimeMs)}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">Pendente: {formatTime(timePendingMs)}</p>
      </TooltipContent>
    </Tooltip>
  )
}
