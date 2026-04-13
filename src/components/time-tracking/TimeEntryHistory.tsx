import { format } from 'date-fns'
import { LogIn, LogOut, Coffee, ArrowRight, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeEntryHistoryProps {
  entries: any[]
  isLoading?: boolean
}

export function TimeEntryHistory({ entries, isLoading }: TimeEntryHistoryProps) {
  if (isLoading && !entries.length) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-secondary/40 animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (!entries?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <Coffee className="w-6 h-6 opacity-50" />
        </div>
        <p>Nenhum registro encontrado para hoje.</p>
      </div>
    )
  }

  const getEntryDetails = (type: string) => {
    switch (type) {
      case 'entrada':
        return {
          icon: <LogIn className="w-4 h-4" />,
          label: 'Entrada',
          color: 'text-emerald-500 bg-emerald-500/10',
        }
      case 'intervalo_saida':
        return {
          icon: <Coffee className="w-4 h-4" />,
          label: 'Saída Intervalo',
          color: 'text-amber-500 bg-amber-500/10',
        }
      case 'intervalo_entrada':
        return {
          icon: <ArrowRight className="w-4 h-4" />,
          label: 'Retorno Intervalo',
          color: 'text-blue-500 bg-blue-500/10',
        }
      case 'saida':
        return {
          icon: <LogOut className="w-4 h-4" />,
          label: 'Saída',
          color: 'text-rose-500 bg-rose-500/10',
        }
      default:
        return { icon: null, label: type, color: 'bg-secondary' }
    }
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const details = getEntryDetails(entry.entry_type)
        const time = format(new Date(entry.timestamp), 'HH:mm')

        return (
          <div
            key={entry.id || index}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
          >
            <div className={cn('p-2 rounded-full mt-0.5', details.color)}>{details.icon}</div>

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-medium">{details.label}</p>
                <p className="text-sm font-mono font-medium">{time}</p>
              </div>

              {entry.notes && (
                <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p className="italic">{entry.notes}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
