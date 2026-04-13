import { parseISO } from 'date-fns'
import { ArrowRight, Coffee, LogIn, LogOut } from 'lucide-react'

interface TimeEntry {
  id: string
  entry_date: string
  entry_type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida'
  timestamp: string
  notes?: string
}

interface TimeEntryHistoryProps {
  entries: TimeEntry[]
  isLoading?: boolean
  error?: string
}

export function TimeEntryHistory({ entries, isLoading, error }: TimeEntryHistoryProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-xl w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive p-4 border border-destructive/20 rounded-xl bg-destructive/10">
        {error}
      </div>
    )
  }

  if (!entries?.length) {
    return (
      <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl">
        Nenhum registro encontrado hoje.
      </div>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <LogIn className="w-4 h-4 text-emerald-500" />
      case 'intervalo_saida':
        return <Coffee className="w-4 h-4 text-amber-500" />
      case 'intervalo_entrada':
        return <ArrowRight className="w-4 h-4 text-blue-500" />
      case 'saida':
        return <LogOut className="w-4 h-4 text-rose-500" />
      default:
        return <LogIn className="w-4 h-4" />
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'Entrada'
      case 'intervalo_saida':
        return 'Saída para Intervalo'
      case 'intervalo_entrada':
        return 'Retorno do Intervalo'
      case 'saida':
        return 'Saída'
      default:
        return type
    }
  }

  const formatTime = (iso?: string) => {
    if (!iso) return '--:--'
    try {
      const date = parseISO(iso)
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return '--:--'
    }
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-4 p-3 bg-card border rounded-xl hover:border-primary/30 transition-colors shadow-sm"
        >
          <div className="mt-0.5 p-2.5 bg-muted rounded-full shrink-0">
            {getIcon(entry.entry_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">{getLabel(entry.entry_type)}</span>
              <span className="text-xs font-mono font-bold text-foreground bg-secondary px-2 py-0.5 rounded-md">
                {formatTime(entry.timestamp)}
              </span>
            </div>
            {entry.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
