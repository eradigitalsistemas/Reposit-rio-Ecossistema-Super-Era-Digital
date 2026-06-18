import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

export interface EventoAgenda {
  id: string
  usuario_id: string
  titulo: string
  descricao: string | null
  data_inicio: string
  data_fim: string
  tipo: 'Evento' | 'Tarefa' | 'Lembrete' | 'Demanda'
  privado: boolean
  cliente_id?: string | null
  lead_id?: string | null
  demanda_id?: string | null
  isDemanda?: boolean
  status?: string
  criado_por?: string | null
}

interface AgendaState {
  eventos: EventoAgenda[]
  loading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  page: number
  fetchEventos: (
    mes: Date,
    isAdmin: boolean,
    currentUserId: string,
    filtroUsuario?: string,
  ) => Promise<void>
  loadMoreEventos: (
    mes: Date,
    isAdmin: boolean,
    currentUserId: string,
    filtroUsuario?: string,
  ) => Promise<void>
  salvarEvento: (evento: Partial<EventoAgenda>, currentUserId: string) => Promise<{ error: any }>
  deletarEvento: (id: string) => Promise<{ error: any }>
  setupRealtime: (currentUserId: string, isAdmin: boolean) => void
  cleanupRealtime: () => void
}

let agendaChannel: any = null

export const useAgendaStore = create<AgendaState>((set, get) => ({
  eventos: [],
  loading: false,
  isLoadingMore: false,
  hasMore: false,
  page: 0,

  setupRealtime: (currentUserId, isAdmin) => {
    if (agendaChannel) return

    let isReconnecting = false
    agendaChannel = supabase
      .channel('agenda_eventos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda_eventos' },
        async (payload) => {
          if (!isAdmin) {
            const userId = (payload.new as any)?.usuario_id || (payload.old as any)?.usuario_id
            if (userId !== currentUserId) return
          }

          if (payload.eventType === 'DELETE') {
            set((state) => ({ eventos: state.eventos.filter((e) => e.id !== payload.old.id) }))
          } else {
            const e = payload.new as any
            const newEvento: EventoAgenda = {
              id: e.id,
              usuario_id: e.usuario_id,
              titulo: e.titulo,
              descricao: e.descricao,
              data_inicio: e.data_inicio,
              data_fim: e.data_fim,
              tipo: e.tipo,
              privado: e.privado,
              cliente_id: e.cliente_id,
              lead_id: e.lead_id,
              demanda_id: e.demanda_id,
              criado_por: e.criado_por,
            }

            const startOfToday = new Date()
            startOfToday.setHours(0, 0, 0, 0)
            if (new Date(newEvento.data_inicio) < startOfToday) return

            set((state) => {
              const exists = state.eventos.find((ev) => ev.id === newEvento.id)
              if (exists) {
                return {
                  eventos: state.eventos.map((ev) => (ev.id === newEvento.id ? newEvento : ev)),
                }
              }
              return { eventos: [...state.eventos, newEvento] }
            })
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (isReconnecting) {
            const now = new Date()
            get().fetchEventos(now, isAdmin, currentUserId)
          }
          isReconnecting = true
        }
      })
  },

  cleanupRealtime: () => {
    if (agendaChannel) {
      supabase.removeChannel(agendaChannel)
      agendaChannel = null
    }
  },

  fetchEventos: async (mes, isAdmin, currentUserId, filtroUsuario) => {
    set({ loading: true, page: 0, hasMore: false })
    try {
      const monthStart = startOfMonth(mes)
      const monthEnd = endOfMonth(monthStart)
      const startDate = startOfWeek(monthStart).toISOString()
      const endDate = endOfWeek(monthEnd).toISOString()

      let qEventos = supabase
        .from('agenda_eventos')
        .select('*')
        .gte('data_inicio', startDate)
        .lte('data_inicio', endDate)
        .order('data_inicio', { ascending: true })
        .limit(100)

      if (!isAdmin) {
        qEventos = qEventos.eq('usuario_id', currentUserId)
      } else if (filtroUsuario && filtroUsuario !== 'todos') {
        qEventos = qEventos.eq('usuario_id', filtroUsuario)
      }

      const { data: dataEventos, error } = await qEventos
      if (error) throw error

      const mappedEventos: EventoAgenda[] = (dataEventos || []).map((e: any) => ({
        id: e.id,
        usuario_id: e.usuario_id,
        titulo: e.titulo,
        descricao: e.descricao,
        data_inicio: e.data_inicio,
        data_fim: e.data_fim,
        tipo: e.tipo,
        privado: e.privado,
        cliente_id: e.cliente_id,
        lead_id: e.lead_id,
        demanda_id: e.demanda_id,
        criado_por: e.criado_por,
      }))

      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)

      // Not filtering by startOfToday here so we can see past events of the month
      set({
        eventos: mappedEventos,
        loading: false,
        hasMore: mappedEventos.length === 100,
        page: 1,
      })
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      set({ loading: false })
    }
  },

  loadMoreEventos: async (mes, isAdmin, currentUserId, filtroUsuario) => {
    const { hasMore, isLoadingMore, page, eventos } = get()
    if (!hasMore || isLoadingMore) return

    set({ isLoadingMore: true })
    try {
      const monthStart = startOfMonth(mes)
      const monthEnd = endOfMonth(monthStart)
      const startDate = startOfWeek(monthStart).toISOString()
      const endDate = endOfWeek(monthEnd).toISOString()

      let qEventos = supabase
        .from('agenda_eventos')
        .select('*')
        .gte('data_inicio', startDate)
        .lte('data_inicio', endDate)
        .order('data_inicio', { ascending: true })
        .range(page * 100, (page + 1) * 100 - 1)

      if (!isAdmin) {
        qEventos = qEventos.eq('usuario_id', currentUserId)
      } else if (filtroUsuario && filtroUsuario !== 'todos') {
        qEventos = qEventos.eq('usuario_id', filtroUsuario)
      }

      const { data: dataEventos, error } = await qEventos
      if (error) throw error

      const mappedEventos: EventoAgenda[] = (dataEventos || []).map((e: any) => ({
        id: e.id,
        usuario_id: e.usuario_id,
        titulo: e.titulo,
        descricao: e.descricao,
        data_inicio: e.data_inicio,
        data_fim: e.data_fim,
        tipo: e.tipo,
        privado: e.privado,
        cliente_id: e.cliente_id,
        lead_id: e.lead_id,
        demanda_id: e.demanda_id,
        criado_por: e.criado_por,
      }))

      const existingIds = new Set(eventos.map((e) => e.id))
      const newEventos = mappedEventos.filter((e) => !existingIds.has(e.id))

      set({
        eventos: [...eventos, ...newEventos],
        isLoadingMore: false,
        hasMore: dataEventos.length === 100,
        page: page + 1,
      })
    } catch (error) {
      console.error('Erro ao carregar mais eventos:', error)
      set({ isLoadingMore: false })
    }
  },

  salvarEvento: async (evento, currentUserId) => {
    try {
      const payload = {
        titulo: evento.titulo,
        descricao: evento.descricao || '',
        data_inicio: evento.data_inicio,
        data_fim: evento.data_fim || evento.data_inicio,
        tipo: evento.tipo,
        privado: evento.privado || false,
        usuario_id: currentUserId,
        cliente_id: evento.cliente_id || null,
        lead_id: evento.lead_id || null,
        demanda_id: evento.demanda_id || null,
        criado_por: evento.criado_por || 'Usuário',
      }

      let res
      if (evento.id) {
        res = await supabase
          .from('agenda_eventos')
          .update(payload as any)
          .eq('id', evento.id)
      } else {
        res = await supabase.from('agenda_eventos').insert([payload as any])
      }

      if (res.error) throw res.error
      return { error: null }
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      return { error }
    }
  },

  deletarEvento: async (id) => {
    try {
      const { error } = await supabase.from('agenda_eventos').delete().eq('id', id)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  subscribeToEvents: (isAdmin, currentUserId, filtroUsuario, currentDate) => {
    get().unsubscribeFromEvents()
    let wasDisconnected = false

    agendaChannel = supabase
      .channel('agenda-eventos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda_eventos' },
        (payload) => {
          get().fetchEventos(currentDate, isAdmin, currentUserId, filtroUsuario)
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (wasDisconnected) {
            get().fetchEventos(currentDate, isAdmin, currentUserId, filtroUsuario)
            wasDisconnected = false
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          wasDisconnected = true
        }
      })
  },

  unsubscribeFromEvents: () => {
    if (agendaChannel) {
      supabase.removeChannel(agendaChannel)
      agendaChannel = null
    }
  },
}))
