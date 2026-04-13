import { TimeEntryStats } from './TimeEntryStats'
import { TimeEntryButton } from './TimeEntryButton'
import { parseISO } from 'date-fns'

export interface TimeEntryCardProps {
  status: 'waiting_entry' | 'waiting_exit' | 'waiting_break_return' | 'complete'
  entryTime?: string
  exitTime?: string
  workedHours?: number
  extraHours?: number
  delayMinutes?: number
  isLoading?: boolean
  error?: string
  onActionClick: (type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida') => void
}

export function TimeEntryCard({
  status,
  entryTime,
  exitTime,
  workedHours = 0,
  extraHours = 0,
  delayMinutes = 0,
  isLoading,
  error,
  onActionClick,
}: TimeEntryCardProps) {
  const formatDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())
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

  const getStatusMessage = () => {
    switch (status) {
      case 'waiting_entry':
        return 'Aguardando entrada'
      case 'waiting_exit':
        return `Aguardando saída`
      case 'waiting_break_return':
        return 'Em intervalo'
      case 'complete':
        return 'Jornada concluída'
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 md:p-8 bg-card border shadow-sm rounded-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Controle de Ponto</h2>
            <p className="text-sm text-muted-foreground capitalize mt-1">{formatDate()}</p>
          </div>
          <div className="px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold w-fit">
            {getStatusMessage()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="p-5 md:p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <span className="text-sm text-muted-foreground mb-2 font-medium">Entrada</span>
            <span className="text-3xl md:text-4xl font-mono font-bold text-foreground">
              {formatTime(entryTime)}
            </span>
          </div>
          <div className="p-5 md:p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <span className="text-sm text-muted-foreground mb-2 font-medium">Saída</span>
            <span className="text-3xl md:text-4xl font-mono font-bold text-foreground">
              {formatTime(exitTime)}
            </span>
          </div>
        </div>

        {status !== 'complete' && (
          <div className="pt-4">
            {status === 'waiting_entry' && (
              <TimeEntryButton
                type="entrada"
                onClick={() => onActionClick('entrada')}
                isLoading={isLoading}
              />
            )}
            {status === 'waiting_exit' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TimeEntryButton
                  type="intervalo_saida"
                  onClick={() => onActionClick('intervalo_saida')}
                  isLoading={isLoading}
                />
                <TimeEntryButton
                  type="saida"
                  onClick={() => onActionClick('saida')}
                  isLoading={isLoading}
                />
              </div>
            )}
            {status === 'waiting_break_return' && (
              <TimeEntryButton
                type="intervalo_entrada"
                onClick={() => onActionClick('intervalo_entrada')}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}
      </div>

      <TimeEntryStats
        workedHours={workedHours}
        extraHours={extraHours}
        delayMinutes={delayMinutes}
        status={status === 'complete' ? 'complete' : 'incomplete'}
      />
    </div>
  )
}
