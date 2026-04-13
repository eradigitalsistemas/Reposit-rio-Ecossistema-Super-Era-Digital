import { Clock, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'

interface TimeEntryStatsProps {
  workedHours: number
  extraHours: number
  delayMinutes: number
  status: 'complete' | 'incomplete' | 'absence' | string
}

export function TimeEntryStats({ workedHours, extraHours, delayMinutes }: TimeEntryStatsProps) {
  const formatHours = (decimalHours: number) => {
    const h = Math.floor(decimalHours)
    const m = Math.round((decimalHours - h) * 60)
    return `${h}h ${m}min`
  }

  return (
    <div className="flex flex-col gap-3 p-5 bg-card rounded-2xl border shadow-sm">
      <div className="flex items-center gap-3 text-lg font-semibold">
        <div className="p-2 bg-primary/10 rounded-full">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <span>{formatHours(workedHours)} trabalhadas</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        {extraHours > 0 ? (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500 font-medium bg-yellow-500/10 p-2.5 rounded-lg">
            <Zap className="w-4 h-4" />
            <span>+{formatHours(extraHours)} extras</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 p-2.5 rounded-lg">
            <Zap className="w-4 h-4 opacity-50" />
            <span>Sem extras</span>
          </div>
        )}

        {delayMinutes > 0 ? (
          <div className="flex items-center gap-2 text-sm text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Atraso de {delayMinutes}min</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-500/10 p-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sem atrasos</span>
          </div>
        )}
      </div>
    </div>
  )
}
