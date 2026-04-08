import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import useAuthStore from './useAuthStore'

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
  fetchEventos: (
    mes: Date,
    isAdmin: boolean,
    currentUserId: string,
    filtroUsuario?: string,
  ) => Promise<void>
  salvarEvento: (evento: Partial<EventoAgenda>, currentUserId: string) => Promise<{ error: any }>
  deletarEvento: (id: string) => Promise<{ error: any }>
}

export const useAgendaStore = create<AgendaState>((set) => ({
  eventos: [],
  loading: false,

  fetchEventos: async (mes, isAdmin, currentUserId, filtroUsuario) => {
    set({ loading: true })
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

      const filteredEventos = mappedEventos.filter((e) => new Date(e.data_inicio) >= startOfToday)

      set({ eventos: filteredEventos, loading: false })
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      set({ loading: false })
    }
  },

  salvarEvento: async (evento, currentUserId) => {
    try {
      const user = useAuthStore.getState().user
      const criadorNome = user?.user_metadata?.full_name || user?.email || 'Usuário'

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
        criado_por: evento.id ? evento.criado_por : criadorNome,
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
}))
