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
import React, { memo, useMemo, useCallback } from 'react'
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
  if (isNaN(d.getTime())) return new Date()
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

const getEventColor = (tipo: string) => {
  switch (tipo) {
    case 'Evento':
      return 'bg-accent/20 text-accent-foreground border-accent/30 dark:bg-accent/20 dark:text-white dark:border-accent/40 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
    case 'Tarefa':
      return 'bg-primary/20 text-primary-foreground border-primary/30 dark:bg-primary/20 dark:text-white dark:border-primary/40 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
    case 'Lembrete':
      return 'bg-yellow-500/20 text-yellow-900 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-white dark:border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
    case 'Demanda':
      return 'bg-purple-500/20 text-purple-900 border-purple-500/30 dark:bg-purple-500/20 dark:text-white dark:border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
    default:
      return 'bg-gray-500/20 text-gray-900 border-gray-500/30 dark:bg-gray-500/20 dark:text-white dark:border-gray-500/40'
  }
}

const AgendaDay = memo(
  ({
    day,
    isCurrentMonth,
    isToday,
    isRightEdge,
    isBottomEdge,
    dayEvents,
    onDayClick,
    onEventClick,
  }: any) => {
    return (
      <div
        onClick={() => onDayClick(day)}
        className={cn(
          'min-h-[100px] lg:min-h-[120px] p-1.5 border-r border-b border-primary/20 cursor-pointer transition-all hover:bg-primary/10 hover:border-primary/40 hardware-accelerated',
          !isCurrentMonth && 'bg-muted/10 text-muted-foreground/50',
          isRightEdge && 'border-r-0',
          isBottomEdge && 'border-b-0',
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
          {dayEvents.map((evento: any) => (
            <div
              key={evento.id}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick(evento, e)
              }}
              className={cn(
                'text-xs px-1.5 py-1 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 hardware-accelerated',
                getEventColor(evento.tipo),
              )}
              title={`${evento.data_inicio ? format(getGMT3LocalDate(evento.data_inicio), 'HH:mm') : ''} - ${evento.titulo}`}
            >
              <span className="font-semibold shrink-0">
                {evento.data_inicio ? format(getGMT3LocalDate(evento.data_inicio), 'HH:mm') : ''}
              </span>
              <span className="truncate">{evento.titulo}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  (prev, next) => {
    return (
      prev.isCurrentMonth === next.isCurrentMonth &&
      prev.isToday === next.isToday &&
      prev.dayEvents.length === next.dayEvents.length &&
      prev.dayEvents.every(
        (e: any, i: number) =>
          e.id === next.dayEvents[i].id && e.data_inicio === next.dayEvents[i].data_inicio,
      )
    )
  },
)

export const AgendaGrid = memo(function AgendaGrid({
  currentDate,
  eventos,
  onDayClick,
  onEventClick,
}: AgendaGridProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate],
  )

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventoAgenda[]>()
    days.forEach((day) => {
      const isSameDayEvents = (eventos || []).filter(
        (e) => e && e.data_inicio && isSameDay(getGMT3LocalDate(e.data_inicio), day),
      )
      isSameDayEvents.sort((a, b) => {
        const timeA = new Date(a.data_inicio).getTime()
        const timeB = new Date(b.data_inicio).getTime()
        return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB)
      })
      map.set(day.toISOString(), isSameDayEvents)
    })
    return map
  }, [eventos, days])

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex-1 flex flex-col bg-card/80 glass-optimized border border-primary/20 rounded-lg overflow-hidden shadow-sm hardware-accelerated">
        <div className="grid grid-cols-7 bg-muted/40 border-b border-primary/20 glass-optimized">
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
            return (
              <AgendaDay
                key={day.toISOString()}
                day={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isSameDay(day, new Date())}
                isRightEdge={idx % 7 === 6}
                isBottomEdge={days.length - idx <= 7}
                dayEvents={eventsByDay.get(day.toISOString()) || []}
                onDayClick={onDayClick}
                onEventClick={onEventClick}
              />
            )
          })}
        </div>
      </div>
    </>
  )
})
