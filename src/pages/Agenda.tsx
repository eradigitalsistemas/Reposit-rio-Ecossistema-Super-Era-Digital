import { useState, useEffect } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgendaStore, EventoAgenda } from '@/stores/useAgendaStore'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { AgendaGrid } from '@/components/agenda/AgendaGrid'
import { EventDialog } from '@/components/agenda/EventDialog'

export default function Agenda() {
  const { user, role } = useAuthStore()
  const { eventos, fetchEventos, loading } = useAgendaStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [usuarios, setUsuarios] = useState<{ id: string; nome: string }[]>([])
  const [filtroUsuario, setFiltroUsuario] = useState('todos')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventoToEdit, setEventoToEdit] = useState<EventoAgenda | null>(null)

  const isAdmin = role === 'Admin' || role === 'Patrão'

  useEffect(() => {
    if (isAdmin) {
      supabase
        .from('usuarios')
        .select('id, nome')
        .then(({ data }) => {
          if (data) setUsuarios(data)
        })
    }
  }, [isAdmin])

  const { subscribeToEvents, unsubscribeFromEvents } = useAgendaStore()

  useEffect(() => {
    if (user) {
      fetchEventos(currentDate, isAdmin, user.id, filtroUsuario)
      subscribeToEvents(isAdmin, user.id, filtroUsuario, currentDate)
    }
    return () => {
      unsubscribeFromEvents()
    }
  }, [
    currentDate,
    user,
    isAdmin,
    filtroUsuario,
    fetchEventos,
    subscribeToEvents,
    unsubscribeFromEvents,
  ])

  useEffect(() => {
    if (user) {
      const { setupRealtime, cleanupRealtime } = useAgendaStore.getState()
      setupRealtime(user.id, isAdmin)
      return () => {
        cleanupRealtime()
      }
    }
  }, [user, isAdmin])

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date)
    setEventoToEdit(null)
    setDialogOpen(true)
  }, [])

  const handleEventClick = useCallback((evento: EventoAgenda, e: React.MouseEvent) => {
    e.stopPropagation()
    setEventoToEdit(evento)
    setSelectedDate(null)
    setDialogOpen(true)
  }, [])

  const handleNewEvent = useCallback(() => {
    setSelectedDate(new Date())
    setEventoToEdit(null)
    setDialogOpen(true)
  }, [])

  const refresh = useCallback(() => {
    if (user) fetchEventos(currentDate, isAdmin, user.id, filtroUsuario)
  }, [user, currentDate, isAdmin, filtroUsuario, fetchEventos])

  return (
    <div className="flex-1 w-full bg-transparent min-h-full flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3 drop-shadow-sm">
              <CalendarIcon className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              Agenda
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Gerencie seus compromissos, tarefas e demandas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                <SelectTrigger className="w-[180px] bg-card/60 backdrop-blur-md text-foreground border-border/50 shadow-sm transition-all hover:border-primary/40">
                  <SelectValue placeholder="Filtrar por Usuário" />
                </SelectTrigger>
                <SelectContent className="bg-card/80 backdrop-blur-xl text-foreground border-border/50">
                  <SelectItem value="todos">Todos os Usuários</SelectItem>
                  {(usuarios || []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleNewEvent} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Novo
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-card/80 glass-optimized p-2 rounded-lg border border-border/50 shadow-sm hardware-accelerated">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={handleToday} className="hidden sm:flex">
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="text-xl font-bold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="w-20" />
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <AgendaGrid
            currentDate={currentDate || new Date()}
            eventos={eventos || []}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        eventoToEdit={eventoToEdit}
        onSuccess={refresh}
      />
    </div>
  )
}
