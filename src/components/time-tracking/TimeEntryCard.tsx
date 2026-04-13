import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TimeEntryButton } from './TimeEntryButton'
import { TimeEntryStats } from './TimeEntryStats'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface TimeEntryCardProps {
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
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-2xl" />
  }

  const today = format(new Date(), "dd 'de' MMMM", { locale: ptBR })

  const getStatusText = () => {
    switch (status) {
      case 'waiting_entry':
        return 'Você ainda não registrou sua entrada hoje.'
      case 'waiting_exit':
        return 'Entrada registrada. Aguardando intervalo ou saída.'
      case 'waiting_break_return':
        return 'Em intervalo. Aguardando retorno.'
      case 'complete':
        return 'Jornada do dia concluída!'
      default:
        return ''
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--'
    return format(new Date(isoString), 'HH:mm')
  }

  return (
    <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Controle de Ponto</h2>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-4 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="bg-secondary/20 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Entrada</p>
            <p className="text-3xl font-mono">{formatTime(entryTime)}</p>
          </div>
          <div className="hidden md:block w-px bg-border"></div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saída</p>
            <p className="text-3xl font-mono">{formatTime(exitTime)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-lg font-medium mb-4">{getStatusText()}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {status === 'waiting_entry' && (
            <TimeEntryButton type="entrada" size="lg" onClick={() => onActionClick('entrada')} />
          )}

          {status === 'waiting_exit' && (
            <>
              <TimeEntryButton
                type="intervalo_saida"
                size="lg"
                onClick={() => onActionClick('intervalo_saida')}
              />
              <TimeEntryButton type="saida" size="lg" onClick={() => onActionClick('saida')} />
            </>
          )}

          {status === 'waiting_break_return' && (
            <TimeEntryButton
              type="intervalo_entrada"
              size="lg"
              onClick={() => onActionClick('intervalo_entrada')}
            />
          )}

          {status === 'complete' && (
            <div className="col-span-1 sm:col-span-2 p-4 bg-emerald-500/10 text-emerald-600 rounded-xl text-center font-medium">
              Obrigado! Seu ponto de hoje foi totalmente registrado.
            </div>
          )}
        </div>
      </div>

      <TimeEntryStats
        workedHours={workedHours}
        extraHours={extraHours}
        delayMinutes={delayMinutes}
        status={status}
      />
    </div>
  )
}
