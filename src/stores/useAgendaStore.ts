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
  isDemanda?: boolean
  status?: string
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

      const { data: dataEventos } = await qEventos

      let qDemandas = supabase
        .from('demandas')
        .select('id, responsavel_id, titulo, descricao, data_vencimento, status')
        .not('data_vencimento', 'is', null)
        .gte('data_vencimento', startDate)
        .lte('data_vencimento', endDate)

      if (!isAdmin) {
        qDemandas = qDemandas.eq('responsavel_id', currentUserId)
      } else if (filtroUsuario && filtroUsuario !== 'todos') {
        qDemandas = qDemandas.eq('responsavel_id', filtroUsuario)
      }

      const { data: dataDemandas } = await qDemandas

      const mappedEventos: EventoAgenda[] = (dataEventos || []).map((e: any) => ({
        id: e.id,
        usuario_id: e.usuario_id,
        titulo: e.titulo,
        descricao: e.descricao,
        data_inicio: e.data_inicio,
        data_fim: e.data_fim,
        tipo: e.tipo,
        privado: e.privado,
      }))

      const mappedDemandas: EventoAgenda[] = (dataDemandas || []).map((d: any) => ({
        id: d.id,
        usuario_id: d.responsavel_id || currentUserId,
        titulo: `[Demanda] ${d.titulo}`,
        descricao: d.descricao,
        data_inicio: d.data_vencimento,
        data_fim: d.data_vencimento,
        tipo: 'Demanda',
        privado: false,
        isDemanda: true,
        status: d.status,
      }))

      set({ eventos: [...mappedEventos, ...mappedDemandas], loading: false })
    } catch (error) {
      console.error(error)
      set({ loading: false })
    }
  },

  salvarEvento: async (evento, currentUserId) => {
    try {
      const payload = {
        titulo: evento.titulo,
        descricao: evento.descricao || '',
        data_inicio: evento.data_inicio,
        data_fim: evento.data_fim,
        tipo: evento.tipo,
        privado: evento.privado || false,
        usuario_id: currentUserId,
      }

      let res
      if (evento.id) {
        res = await supabase.from('agenda_eventos').update(payload).eq('id', evento.id)
      } else {
        res = await supabase.from('agenda_eventos').insert([payload])
      }
      return { error: res.error }
    } catch (error) {
      return { error }
    }
  },

  deletarEvento: async (id) => {
    try {
      const { error } = await supabase.from('agenda_eventos').delete().eq('id', id)
      return { error }
    } catch (error) {
      return { error }
    }
  },
}))
