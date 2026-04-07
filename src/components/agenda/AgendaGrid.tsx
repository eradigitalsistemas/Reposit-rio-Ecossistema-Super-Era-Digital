import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
} from 'date-fns'
import { EventoAgenda } from '@/stores/useAgendaStore'
import { cn } from '@/lib/utils'

interface AgendaGridProps {
  currentDate: Date
  eventos: EventoAgenda[]
  onDayClick: (date: Date) => void
  onEventClick: (evento: EventoAgenda, e: React.MouseEvent) => void
}

const getGMT3LocalDate = (isoString: string) => {
  if (!isoString) return new Date()
  const d = new Date(isoString)
  // Ajusta estritamente para GMT-3 ignorando timezone do navegador
  const gmt3Date = new Date(d.getTime() - 3 * 60 * 60 * 1000)
  return new Date(
    gmt3Date.getUTCFullYear(),
    gmt3Date.getUTCMonth(),
    gmt3Date.getUTCDate(),
    gmt3Date.getUTCHours(),
    gmt3Date.getUTCMinutes(),
  )
}

export function AgendaGrid({ currentDate, eventos, onDayClick, onEventClick }: AgendaGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case 'Evento':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'Tarefa':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      case 'Lembrete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
      case 'Demanda':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-muted border-b border-border">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            const dayEvents = eventos.filter((e) => isSameDay(getGMT3LocalDate(e.data_inicio), day))

            dayEvents.sort(
              (a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime(),
            )

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDayClick(day)}
                className={cn(
                  'min-h-[100px] lg:min-h-[120px] p-1.5 border-r border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50',
                  !isCurrentMonth && 'bg-muted/20 text-muted-foreground/50',
                  idx % 7 === 6 && 'border-r-0',
                  days.length - idx <= 7 && 'border-b-0',
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[70px] lg:max-h-[85px] pr-1 hide-scrollbar">
                  {dayEvents.map((evento) => (
                    <div
                      key={evento.id}
                      onClick={(e) => onEventClick(evento, e)}
                      className={cn(
                        'text-xs px-1.5 py-1 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1',
                        getEventColor(evento.tipo),
                      )}
                      title={`${format(getGMT3LocalDate(evento.data_inicio), 'HH:mm')} - ${evento.titulo}`}
                    >
                      <span className="font-semibold shrink-0">
                        {format(getGMT3LocalDate(evento.data_inicio), 'HH:mm')}
                      </span>
                      <span className="truncate">{evento.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
