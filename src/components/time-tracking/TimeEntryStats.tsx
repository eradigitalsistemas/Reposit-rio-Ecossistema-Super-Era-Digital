import { Clock, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeEntryStatsProps {
  workedHours: number
  extraHours: number
  delayMinutes: number
  status: string
}

export function TimeEntryStats({ workedHours, extraHours, delayMinutes }: TimeEntryStatsProps) {
  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h === 0 && m === 0) return '0min'
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Horas Trabalhadas</p>
          <p className="text-2xl font-bold">{formatHours(workedHours)}</p>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl p-4 flex items-center gap-4',
          extraHours > 0
            ? 'bg-amber-500/10 text-amber-600'
            : 'bg-secondary/30 text-muted-foreground',
        )}
      >
        <div className="p-3 bg-current/10 rounded-full">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">Horas Extras</p>
          <p className="text-2xl font-bold text-foreground">{formatHours(extraHours)}</p>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl p-4 flex items-center gap-4',
          delayMinutes > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600',
        )}
      >
        <div className="p-3 bg-current/10 rounded-full">
          {delayMinutes > 0 ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">Status de Atraso</p>
          <p className="text-lg font-bold text-foreground">
            {delayMinutes > 0 ? `${delayMinutes}min de atraso` : 'Sem atrasos'}
          </p>
        </div>
      </div>
    </div>
  )
}
