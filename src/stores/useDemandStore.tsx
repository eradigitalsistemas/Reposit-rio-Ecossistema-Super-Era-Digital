import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import {
  Demand,
  DemandPriority,
  DemandStatus,
  DemandNotification,
  DemandLog,
  DemandAttachment,
  ChecklistItem,
  ChecklistTemplate,
  DemandTemplate,
} from '@/types/demand'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from './useAuthStore'
import { useNavigate } from 'react-router-dom'

interface Collaborator {
  id: string
  nome: string
}

interface DemandStoreState {
  demands: Demand[]
  completedDemands: Demand[]
  collaborators: Collaborator[]
  notifications: DemandNotification[]
  checklistTemplates: ChecklistTemplate[]
  demandTemplates: DemandTemplate[]
  addDemand: (
    demand: Omit<Demand, 'id' | 'createdAt' | 'updatedAt' | 'responses' | 'logs'> & {
      assigneeId?: string | null
      clientId?: string | null
      eventDetails?: {
        enabled: boolean
        title: string
        description: string
        date: string
        type: string
      } | null
    },
  ) => Promise<Demand | undefined>
  editDemand: (
    demandId: string,
    updates: Partial<Omit<Demand, 'id' | 'createdAt' | 'updatedAt' | 'responses' | 'logs'>> & {
      attachments?: DemandAttachment[]
      clientId?: string | null
    },
  ) => Promise<void>
  updateStatus: (demandId: string, status: DemandStatus) => Promise<void>
  deleteDemand: (demandId: string) => Promise<void>
  acceptDemand: (demandId: string) => Promise<void>
  completeDemand: (
    demandId: string,
    resposta: string,
    attachments: DemandAttachment[],
  ) => Promise<void>
  addResponse: (demandId: string, text: string, attachments?: DemandAttachment[]) => Promise<void>
  addAttachments: (demandId: string, attachments: DemandAttachment[]) => Promise<void>
  reopenDemand: (demandId: string) => Promise<void>
  updateChecklist: (
    demandId: string,
    checklist: ChecklistItem[],
    actionText?: string,
  ) => Promise<void>
  markNotificationsAsRead: () => void
  fetchCollaborators: () => Promise<void>
  fetchChecklistTemplates: () => Promise<void>
  addChecklistTemplate: (nome: string, itens: string[]) => Promise<void>
  fetchDemandTemplates: () => Promise<void>
  addDemandTemplate: (
    template: Omit<DemandTemplate, 'id' | 'data_criacao' | 'usuario_id'>,
  ) => Promise<void>
  editDemandTemplate: (id: string, template: Partial<DemandTemplate>) => Promise<void>
  deleteDemandTemplate: (id: string) => Promise<void>
  advancePostSalesWorkflow: (demandId: string) => Promise<void>
  failPostSalesWorkflow: (demandId: string, reason: string) => Promise<void>
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMoreDemands: () => Promise<void>
  fetchCompletedDemands: () => Promise<void>
  loadMoreCompletedDemands: () => Promise<void>
  hasMoreCompleted: boolean
  isLoadingCompleted: boolean
  isLoadingMoreCompleted: boolean
  fetchDemandLogs: (demandId: string) => Promise<void>
}

const DemandContext = createContext<DemandStoreState | null>(null)

export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  } catch (e) {
    console.error('Audio error', e)
  }
}

export const DemandProvider = ({ children }: { children: React.ReactNode }) => {
  const [demands, setDemands] = useState<Demand[]>([])
  const [completedDemands, setCompletedDemands] = useState<Demand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [notifications, setNotifications] = useState<DemandNotification[]>([])
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([])
  const [demandTemplates, setDemandTemplates] = useState<DemandTemplate[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingMoreCompleted, setIsLoadingMoreCompleted] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [hasMoreCompleted, setHasMoreCompleted] = useState(false)
  const [page, setPage] = useState(0)
  const [pageCompleted, setPageCompleted] = useState(0)

  const { user, role, userName } = useAuthStore()
  const navigate = useNavigate()
  const hasFetched = useRef(false)
  const hasFetchedCompleted = useRef(false)
  const collaboratorsRef = useRef(collaborators)

  useEffect(() => {
    collaboratorsRef.current = collaborators
  }, [collaborators])

  const syncChecklistAgenda = async (
    demandId: string,
    demandTitle: string,
    assigneeId: string,
    checklist: ChecklistItem[],
  ) => {
    const updatedChecklist = Array.isArray(checklist) ? [...checklist] : []
    for (let i = 0; i < updatedChecklist.length; i++) {
      const item = updatedChecklist[i]
      if (item.dueDate && !item.completed) {
        try {
          const startDate = new Date(item.dueDate)
          if (isNaN(startDate.getTime())) continue

          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

          if (!item.eventId) {
            const { data } = await supabase
              .from('agenda_eventos')
              .insert({
                titulo: `[Checklist] ${item.text} - ${demandTitle}`,
                descricao: `Link para demanda original: /demandas?highlight=${demandId}`,
                data_inicio: startDate.toISOString(),
                data_fim: endDate.toISOString(),
                tipo: 'Tarefa',
                usuario_id: assigneeId,
              })
              .select('id')
              .single()
            if (data) {
              updatedChecklist[i] = { ...item, eventId: data.id }
            }
          } else {
            await supabase
              .from('agenda_eventos')
              .update({
                titulo: `[Checklist] ${item.text} - ${demandTitle}`,
                data_inicio: startDate.toISOString(),
                data_fim: endDate.toISOString(),
                usuario_id: assigneeId,
              })
              .eq('id', item.eventId)
          }
        } catch (e) {
          console.error('Erro ao sincronizar data do checklist na agenda', e)
        }
      }
    }
    return updatedChecklist
  }

  const parseDemandRow = useCallback((d: any): Demand => {
    if (!d || !d.id) return d as Demand // Fallback for extremely malformed rows

    const logsToMap = d.logs || d.logs_auditoria || []
    const sortedLogs = Array.isArray(logsToMap)
      ? [...logsToMap].sort((a: any, b: any) => {
          const timeA = a?.data_criacao
            ? new Date(a.data_criacao).getTime()
            : a?.createdAt
              ? new Date(a.createdAt).getTime()
              : 0
          const timeB = b?.data_criacao
            ? new Date(b.data_criacao).getTime()
            : b?.createdAt
              ? new Date(b.createdAt).getTime()
              : 0
          return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA)
        })
      : []

    const mappedLogs: DemandLog[] = sortedLogs
      .map((l: any) => {
        if (!l) return null
        if (l.userName !== undefined) return l // already mapped
        return {
          id: l.id || crypto.randomUUID(),
          acao: l.acao || 'Desconhecido',
          detalhes: l.detalhes || '',
          createdAt: l.data_criacao || l.createdAt || new Date().toISOString(),
          usuario_id: l.usuario_id,
          userName: l.usuario?.nome || 'Sistema',
          dados_novos: l.dados_novos,
        }
      })
      .filter(Boolean) as DemandLog[]

    const latestPriorityChange = sortedLogs.find((l: any) => l?.acao === 'Alteração de Prioridade')
    const systemEscalated =
      latestPriorityChange &&
      latestPriorityChange.usuario_id === null &&
      latestPriorityChange.dados_novos?.prioridade === 'Urgente' &&
      d.prioridade === 'Urgente'

    return {
      id: d.id,
      protocolo: d.protocolo || '',
      title: d.titulo || 'Sem título',
      description: d.descricao || '',
      priority: (d.prioridade as DemandPriority) || 'Pode Ficar para Amanhã',
      status: (d.status as DemandStatus) || 'Pendente',
      dueDate: d.data_vencimento || null,
      assignee:
        (d as any).responsavel?.nome ||
        collaboratorsRef.current.find((c) => c.id === d.responsavel_id)?.nome ||
        'Sem responsável',
      assigneeId: d.responsavel_id || null,
      creatorId: d.usuario_id || null,
      clientId: d.cliente_id || null,
      clientName: (d as any).cliente?.nome || null,
      category: d.tipo_demanda as any,
      responses: d.resposta ? [d.resposta] : [],
      logs: mappedLogs,
      attachments: d.anexos || [],
      checklist: d.checklist || [],
      createdAt: d.data_criacao || new Date().toISOString(),
      updatedAt: d.data_atualizacao || d.data_criacao || new Date().toISOString(),
      acceptedAt: d.data_aceite || null,
      completedAt: d.data_conclusao || null,
      systemEscalated: !!systemEscalated,
      workflowTipo: d.workflow_tipo || 'geral',
      posVendaFase: d.pos_venda_fase || null,
      posVendaAlvo: d.pos_venda_alvo || null,
      dataProximaAcao: d.data_proxima_acao || null,
      dataConclusaoTreinamento: d.data_conclusao_treinamento || null,
      timePendingMs: d.time_pending_ms || 0,
      timeInProgressMs: d.time_in_progress_ms || 0,
      lastStatusChangeAt: d.last_status_change_at || d.data_criacao || new Date().toISOString(),
    } as Demand
  }, [])

  const fetchSingleDemand = useCallback(
    async (id: string) => {
      const { data: d, error } = await supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
        )
        .eq('id', id)
        .single()

      if (d && !error && d.id) {
        const parsed = parseDemandRow({ ...d })
        if (!parsed || !parsed.id) return

        if (parsed.status === 'Concluído') {
          setDemands((prev) => prev.filter((x) => x.id !== parsed.id))
          setCompletedDemands((prev) => {
            const existing = prev.find((x) => x.id === parsed.id)
            if (existing)
              return prev.map((x) => (x.id === parsed.id ? { ...parsed, logs: existing.logs } : x))
            if (hasFetchedCompleted.current) return [parsed, ...prev]
            return prev
          })
        } else {
          setCompletedDemands((prev) => prev.filter((x) => x.id !== parsed.id))
          setDemands((prev) => {
            const existing = prev.find((x) => x.id === parsed.id)
            if (existing)
              return prev.map((x) => (x.id === parsed.id ? { ...parsed, logs: existing.logs } : x))
            return [parsed, ...prev]
          })
        }
      }
    },
    [parseDemandRow],
  )

  const fetchDemandLogs = useCallback(async (demandId: string) => {
    try {
      const { data, error } = await supabase
        .from('logs_auditoria')
        .select('id, acao, detalhes, usuario_id, dados_novos, data_criacao, usuario:usuarios(nome)')
        .eq('demanda_id', demandId)
        .order('data_criacao', { ascending: false })

      if (data && !error) {
        const mappedLogs: DemandLog[] = data.map((l: any) => ({
          id: l.id || crypto.randomUUID(),
          acao: l.acao,
          detalhes: l.detalhes,
          createdAt: l.data_criacao,
          usuario_id: l.usuario_id,
          userName: l.usuario?.nome || 'Sistema',
          dados_novos: l.dados_novos,
        }))
        setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, logs: mappedLogs } : d)))
        setCompletedDemands((prev) =>
          prev.map((d) => (d.id === demandId ? { ...d, logs: mappedLogs } : d)),
        )
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const fetchDemands = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      let query = supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
        )
        .in('status', ['Pendente', 'Em Andamento'])
        .order('data_criacao', { ascending: false })
        .range(0, 99)

      if (role !== 'Admin') {
        query = query.eq('responsavel_id', user.id)
      }

      const { data, error } = await query

      if (error) return

      if (data) {
        setDemands(data.map(parseDemandRow).filter((d) => d && d.id))
        setHasMore(data.length === 100)
        setPage(1)
      }
    } catch (e) {
      // Silently handle
    } finally {
      setIsLoading(false)
    }
  }, [user, role, parseDemandRow])

  const fetchCompletedDemands = useCallback(async () => {
    if (!user) return
    setIsLoadingCompleted(true)
    try {
      let query = supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
        )
        .eq('status', 'Concluído')
        .not('data_conclusao', 'is', null)
        .order('data_conclusao', { ascending: false, nullsFirst: false })
        .range(0, 49)

      if (role !== 'Admin') {
        query = query.eq('responsavel_id', user.id)
      }

      const { data, error } = await query

      if (error) return

      if (data) {
        setCompletedDemands(data.map(parseDemandRow).filter((d) => d && d.id))
        setHasMoreCompleted(data.length === 50)
        setPageCompleted(1)
        hasFetchedCompleted.current = true
      }
    } catch (e) {
      // Silently handle
    } finally {
      setIsLoadingCompleted(false)
    }
  }, [user, role, parseDemandRow])

  const loadMoreCompletedDemands = useCallback(async () => {
    if (!user || !hasMoreCompleted || isLoadingMoreCompleted) return
    setIsLoadingMoreCompleted(true)
    try {
      const currentPage = pageCompleted
      let query = supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
        )
        .eq('status', 'Concluído')
        .not('data_conclusao', 'is', null)
        .order('data_conclusao', { ascending: false, nullsFirst: false })
        .range(currentPage * 50, (currentPage + 1) * 50 - 1)

      if (role !== 'Admin') {
        query = query.eq('responsavel_id', user.id)
      }

      const { data, error } = await query

      if (error) return

      if (data) {
        const newDemands = data.map(parseDemandRow).filter((d) => d && d.id)
        setCompletedDemands((prev) => {
          const existingIds = new Set(prev.map((d) => d.id))
          return [...prev, ...newDemands.filter((d) => !existingIds.has(d.id))]
        })
        setHasMoreCompleted(data.length === 50)
        setPageCompleted(currentPage + 1)
      }
    } catch (e) {
      // Silently handle
    } finally {
      setIsLoadingMoreCompleted(false)
    }
  }, [user, role, pageCompleted, hasMoreCompleted, isLoadingMoreCompleted, parseDemandRow])

  const loadMoreDemands = useCallback(async () => {
    if (!user || !hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const currentPage = page
      let query = supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
        )
        .in('status', ['Pendente', 'Em Andamento'])
        .order('data_criacao', { ascending: false })
        .range(currentPage * 100, (currentPage + 1) * 100 - 1)

      if (role !== 'Admin') {
        query = query.eq('responsavel_id', user.id)
      }

      const { data, error } = await query

      if (error) return

      if (data) {
        const newDemands = data.map(parseDemandRow).filter((d) => d && d.id)
        setDemands((prev) => {
          const existingIds = new Set(prev.map((d) => d.id))
          return [...prev, ...newDemands.filter((d) => !existingIds.has(d.id))]
        })
        setHasMore(data.length === 100)
        setPage(currentPage + 1)
      }
    } catch (e) {
      // Silently handle
    } finally {
      setIsLoadingMore(false)
    }
  }, [user, role, page, hasMore, isLoadingMore, parseDemandRow])

  const fetchChecklistTemplates = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (!error && data) {
        setChecklistTemplates(
          data.map((t: any) => ({
            id: t.id || crypto.randomUUID(),
            nome: t.nome || 'Template',
            itens: Array.isArray(t.itens) ? t.itens : [],
            usuario_id: t.usuario_id,
            data_criacao: t.data_criacao || new Date().toISOString(),
          })),
        )
      }
    } catch (e) {
      // Silently handle
    }
  }, [user])

  const fetchDemandTemplates = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('demand_templates')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (!error && data) {
        setDemandTemplates(data)
      }
    } catch (e) {
      // Silently handle
    }
  }, [user])

  const addDemandTemplate = useCallback(
    async (template: Omit<DemandTemplate, 'id' | 'data_criacao' | 'usuario_id'>) => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('demand_templates')
          .insert({
            ...template,
            usuario_id: user.id,
          })
          .select()
          .single()
        if (error) throw error
        if (data) {
          setDemandTemplates((prev) => [data, ...prev])
          toast({ title: 'Sucesso', description: 'Modelo criado com sucesso.' })
        }
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao criar modelo.', variant: 'destructive' })
      }
    },
    [user],
  )

  const editDemandTemplate = useCallback(
    async (id: string, template: Partial<DemandTemplate>) => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('demand_templates')
          .update(template)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        if (data) {
          setDemandTemplates((prev) => prev.map((t) => (t.id === id ? data : t)))
          toast({ title: 'Sucesso', description: 'Modelo atualizado.' })
        }
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao atualizar modelo.', variant: 'destructive' })
      }
    },
    [user],
  )

  const deleteDemandTemplate = useCallback(
    async (id: string) => {
      if (!user) return
      try {
        const { error } = await supabase.from('demand_templates').delete().eq('id', id)
        if (error) throw error
        setDemandTemplates((prev) => prev.filter((t) => t.id !== id))
        toast({ title: 'Sucesso', description: 'Modelo excluído.' })
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao excluir modelo.', variant: 'destructive' })
      }
    },
    [user],
  )

  const addChecklistTemplate = useCallback(
    async (nome: string, itens: string[]) => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('checklist_templates')
          .insert({
            nome,
            itens,
            usuario_id: user.id,
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setChecklistTemplates((prev) => [
            {
              id: data.id,
              nome: data.nome,
              itens: data.itens,
              usuario_id: data.usuario_id,
              data_criacao: data.data_criacao,
            },
            ...prev,
          ])
          toast({ title: 'Sucesso', description: 'Template criado com sucesso.' })
        }
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao criar template.', variant: 'destructive' })
      }
    },
    [user],
  )

  const fetchCollaborators = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome', { head: false })
        .eq('ativo', true)
        .order('nome')

      if (!error && data) {
        setCollaborators(data)
      }
    } catch (err) {
      console.error('Error fetching collaborators:', err)
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*', { head: false })
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(50)
      if (!error && data) {
        setNotifications(
          data.map((n: any) => ({
            id: n.id || crypto.randomUUID(),
            title: n.titulo || 'Notificação',
            message: n.mensagem || '',
            read: Boolean(n.lida),
            createdAt: n.data_criacao || new Date().toISOString(),
            demandId: n.demanda_id,
          })),
        )
      }
    } catch (e) {
      // Silently handle
    }
  }, [user])

  useEffect(() => {
    let isSubscribed = true

    if (role && role !== 'Client' && user && !hasFetched.current) {
      hasFetched.current = true
      fetchDemands()
      fetchCollaborators()
      fetchNotifications()
      fetchChecklistTemplates()
      fetchDemandTemplates()

      let usersConnected = false
      const usersChannel = supabase
        .channel('usuarios-colab-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => {
          if (isSubscribed) fetchCollaborators()
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            if (usersConnected) fetchCollaborators()
            usersConnected = true
          }
        })

      let templatesConnected = false
      const templatesChannel = supabase
        .channel('demand-templates-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'demand_templates' },
          (payload) => {
            if (!isSubscribed) return
            if (payload.eventType === 'INSERT') {
              setDemandTemplates((prev) => {
                if (prev.find((t) => t.id === payload.new.id)) return prev
                return [payload.new as DemandTemplate, ...prev]
              })
            } else if (payload.eventType === 'UPDATE') {
              setDemandTemplates((prev) =>
                prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t)),
              )
            } else if (payload.eventType === 'DELETE') {
              setDemandTemplates((prev) => prev.filter((t) => t.id !== payload.old.id))
            }
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            if (templatesConnected) fetchDemandTemplates()
            templatesConnected = true
          }
        })

      let demandsConnected = false
      let demandsWasDisconnected = false

      const demandsChannel = supabase
        .channel('demandas-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'demandas' }, (payload) => {
          if (!isSubscribed) return
          if (payload.eventType === 'DELETE') {
            setDemands((prev) => prev.filter((d) => d.id !== payload.old.id))
            setCompletedDemands((prev) => prev.filter((d) => d.id !== payload.old.id))
          } else {
            const d = payload.new as any
            if (!d || !d.id) return

            // Fast optimistic update for UI fluidity
            setDemands((prev) => {
              const existing = prev.find((x) => x.id === d.id)
              if (existing && payload.eventType === 'UPDATE') {
                return prev.map((x) =>
                  x.id === d.id
                    ? {
                        ...x,
                        status: d.status ?? x.status,
                        priority: d.prioridade ?? x.priority,
                        title: d.titulo ?? x.title,
                        assigneeId: d.responsavel_id ?? x.assigneeId,
                        timePendingMs: d.time_pending_ms ?? x.timePendingMs,
                        timeInProgressMs: d.time_in_progress_ms ?? x.timeInProgressMs,
                        lastStatusChangeAt: d.last_status_change_at ?? x.lastStatusChangeAt,
                        updatedAt: d.data_atualizacao ?? x.updatedAt,
                      }
                    : x,
                )
              }
              return prev
            })

            // Full fetch to resolve relationships and complex arrays
            fetchSingleDemand(d.id)
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            if (demandsConnected) fetchDemands()
            demandsConnected = true
          }
        })

      let notifConnected = false
      const notifChannel = supabase
        .channel('notificacoes-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `usuario_id=eq.${user.id}`,
          },
          (payload) => {
            if (!isSubscribed) return
            const newNotif = payload.new as any
            setNotifications((prev) => [
              {
                id: newNotif.id,
                title: newNotif.titulo,
                message: newNotif.mensagem,
                read: newNotif.lida,
                createdAt: newNotif.data_criacao,
                demandId: newNotif.demanda_id,
              },
              ...prev,
            ])

            playNotificationSound()

            toast({
              title: newNotif.titulo,
              description: newNotif.mensagem,
              action: newNotif.demanda_id ? (
                <ToastAction
                  altText="Ver"
                  onClick={() => navigate(`/demandas?highlight=${newNotif.demanda_id}`)}
                >
                  Ver
                </ToastAction>
              ) : undefined,
            })
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            if (notifConnected) fetchNotifications()
            notifConnected = true
          }
        })

      return () => {
        isSubscribed = false
        supabase.removeChannel(usersChannel)
        supabase.removeChannel(notifChannel)
        supabase.removeChannel(templatesChannel)
        supabase.removeChannel(demandsChannel)
      }
    }

    return () => {
      isSubscribed = false
    }
  }, [
    role,
    user,
    fetchDemands,
    fetchCollaborators,
    fetchNotifications,
    fetchChecklistTemplates,
    fetchDemandTemplates,
    fetchSingleDemand,
    navigate,
  ])

  const markNotificationsAsRead = useCallback(async () => {
    if (!user || !notifications.some((n) => !n.read)) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', user.id)
      .eq('lida', false)
  }, [user, notifications])

  const addDemand = useCallback(
    async (
      newDemand: Omit<Demand, 'id' | 'createdAt' | 'updatedAt' | 'responses' | 'logs'> & {
        assigneeId?: string | null
        clientId?: string | null
        eventDetails?: {
          enabled: boolean
          title: string
          description: string
          date: string
          type: string
        } | null
      },
    ) => {
      if (!user) return undefined
      try {
        let d: any = null

        if (newDemand.eventDetails?.enabled && newDemand.eventDetails.date) {
          const formattedDate =
            newDemand.eventDetails.date.length === 16
              ? `${newDemand.eventDetails.date}:00-03:00`
              : newDemand.eventDetails.date

          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'create_demand_with_event',
            {
              p_titulo: newDemand.title || 'Sem título',
              p_descricao: newDemand.description || null,
              p_prioridade: newDemand.priority || 'Pode Ficar para Amanhã',
              p_status: newDemand.status || 'Pendente',
              p_data_vencimento: newDemand.dueDate || null,
              p_responsavel_id: newDemand.assigneeId || null,
              p_cliente_id: newDemand.clientId || null,
              p_usuario_id: user.id,
              p_tipo_demanda: newDemand.category || 'Geral',
              p_anexos: newDemand.attachments || [],
              p_checklist: newDemand.checklist || [],
              p_create_event: true,
              p_event_titulo: newDemand.eventDetails.title,
              p_event_descricao: newDemand.eventDetails.description,
              p_event_data_inicio: formattedDate,
              p_event_data_fim: formattedDate,
              p_event_tipo: newDemand.eventDetails.type,
            },
          )

          if (rpcError) throw rpcError

          if (rpcData && rpcData.demanda_id) {
            const { data: fetchedDemand, error: fetchErr } = await supabase
              .from('demandas')
              .select(
                '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
              )
              .eq('id', rpcData.demanda_id)
              .single()

            if (fetchErr) throw fetchErr
            d = fetchedDemand
          }
        } else {
          const { data, error } = await supabase
            .from('demandas')
            .insert({
              titulo: newDemand.title || 'Sem título',
              descricao: newDemand.description || null,
              prioridade: newDemand.priority || 'Pode Ficar para Amanhã',
              status: newDemand.status || 'Pendente',
              data_vencimento: newDemand.dueDate || null,
              responsavel_id: newDemand.assigneeId || null,
              cliente_id: newDemand.clientId || null,
              usuario_id: user.id,
              tipo_demanda: newDemand.category || 'Geral',
              anexos: newDemand.attachments || [],
              checklist: newDemand.checklist || [],
            })
            .select(
              '*, responsavel:usuarios!demandas_responsavel_id_fkey(nome), cliente:clientes_externos(id, nome)',
            )

          if (error) throw error
          if (data && data.length > 0) {
            d = data[0]
          }
        }

        if (d) {
          const isImplantacao = newDemand.category === 'Implantação e Pós-Venda'
          if (isImplantacao) {
            await supabase
              .from('demandas')
              .update({
                workflow_tipo: 'implantacao_pos_venda',
                pos_venda_fase: 'treinamento',
              })
              .eq('id', d.id)
          }

          let finalChecklist = newDemand.checklist || []
          if (d.responsavel_id && finalChecklist.length > 0) {
            finalChecklist = await syncChecklistAgenda(
              d.id,
              d.titulo,
              d.responsavel_id,
              finalChecklist,
            )
            if (
              finalChecklist.some(
                (item, idx) => item.eventId !== (newDemand.checklist || [])[idx].eventId,
              )
            ) {
              await supabase.from('demandas').update({ checklist: finalChecklist }).eq('id', d.id)
            }
          }

          fetchSingleDemand(d.id)
          return d as Demand
        }
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a demanda.',
          variant: 'destructive',
        })
        return undefined
      }
    },
    [user, fetchSingleDemand],
  )

  const editDemand = useCallback(
    async (
      demandId: string,
      updates: Partial<
        Omit<Demand, 'id' | 'createdAt' | 'updatedAt' | 'responses' | 'logs'> & {
          attachments?: DemandAttachment[]
        }
      >,
    ) => {
      try {
        const currentDemand = demands.find((d) => d.id === demandId)
        const updateData: any = { data_atualizacao: new Date().toISOString() }
        let statusChangedToPending = false

        if (updates.title !== undefined) updateData.titulo = updates.title
        if (updates.description !== undefined) updateData.descricao = updates.description
        if (updates.priority !== undefined) updateData.prioridade = updates.priority
        if (updates.dueDate !== undefined) updateData.data_vencimento = updates.dueDate
        if (updates.attachments !== undefined) updateData.anexos = updates.attachments
        if (updates.clientId !== undefined) updateData.cliente_id = updates.clientId

        if (updates.assigneeId !== undefined) {
          updateData.responsavel_id = updates.assigneeId
          if (currentDemand && updates.assigneeId !== currentDemand.assigneeId) {
            updateData.status = 'Pendente'
            statusChangedToPending = true
          }
        }

        if (updates.status !== undefined && !statusChangedToPending) {
          updateData.status = updates.status
        }

        let finalChecklist = updates.checklist || currentDemand?.checklist || []
        const assigneeIdToSync = updateData.responsavel_id || currentDemand?.assigneeId

        if (
          assigneeIdToSync &&
          (updates.checklist !== undefined ||
            (updates.assigneeId && updates.assigneeId !== currentDemand?.assigneeId))
        ) {
          finalChecklist = await syncChecklistAgenda(
            demandId,
            currentDemand?.title || '',
            assigneeIdToSync,
            finalChecklist,
          )
          updateData.checklist = finalChecklist
        } else if (updates.checklist !== undefined) {
          updateData.checklist = updates.checklist
        }

        // Let fetchSingleDemand handle moving if status changed
        setDemands((prev) =>
          prev.map((d) => {
            if (d.id === demandId) {
              return {
                ...d,
                title: updates.title !== undefined ? updates.title : d.title,
                description:
                  updates.description !== undefined ? updates.description : d.description,
                priority: updates.priority !== undefined ? updates.priority : d.priority,
                dueDate: updates.dueDate !== undefined ? updates.dueDate : d.dueDate,
                attachments:
                  updates.attachments !== undefined ? updates.attachments : d.attachments,
                clientId: updates.clientId !== undefined ? updates.clientId : d.clientId,
                assigneeId:
                  updateData.responsavel_id !== undefined
                    ? updateData.responsavel_id
                    : d.assigneeId,
                status: updateData.status !== undefined ? updateData.status : d.status,
                checklist: updateData.checklist !== undefined ? updateData.checklist : d.checklist,
                updatedAt: updateData.data_atualizacao,
              }
            }
            return d
          }),
        )
        setCompletedDemands((prev) =>
          prev.map((d) => {
            if (d.id === demandId) {
              return {
                ...d,
                title: updates.title !== undefined ? updates.title : d.title,
                description:
                  updates.description !== undefined ? updates.description : d.description,
                priority: updates.priority !== undefined ? updates.priority : d.priority,
                dueDate: updates.dueDate !== undefined ? updates.dueDate : d.dueDate,
                attachments:
                  updates.attachments !== undefined ? updates.attachments : d.attachments,
                clientId: updates.clientId !== undefined ? updates.clientId : d.clientId,
                assigneeId:
                  updateData.responsavel_id !== undefined
                    ? updateData.responsavel_id
                    : d.assigneeId,
                status: updateData.status !== undefined ? updateData.status : d.status,
                checklist: updateData.checklist !== undefined ? updateData.checklist : d.checklist,
                updatedAt: updateData.data_atualizacao,
              }
            }
            return d
          }),
        )
        if (updateData.status) {
          setTimeout(() => fetchSingleDemand(demandId), 100)
        }

        const { error } = await supabase.from('demandas').update(updateData).eq('id', demandId)
        if (error) throw error

        toast({ title: 'Demanda Atualizada', description: 'As alterações foram salvas.' })
      } catch (e) {
        fetchSingleDemand(demandId)
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a demanda.',
          variant: 'destructive',
        })
      }
    },
    [fetchSingleDemand, demands],
  )

  const updateStatus = useCallback(
    async (demandId: string, status: DemandStatus) => {
      const updatedAt = new Date().toISOString()

      let targetDemand =
        demands.find((d) => d.id === demandId) || completedDemands.find((d) => d.id === demandId)
      if (targetDemand) {
        const updatedDemand = { ...targetDemand, status, updatedAt, lastStatusChangeAt: updatedAt }
        if (status === 'Concluído') {
          setDemands((prev) => prev.filter((d) => d.id !== demandId))
          setCompletedDemands((prev) => [updatedDemand, ...prev.filter((d) => d.id !== demandId)])
        } else {
          setCompletedDemands((prev) => prev.filter((d) => d.id !== demandId))
          setDemands((prev) => [updatedDemand, ...prev.filter((d) => d.id !== demandId)])
        }
      }

      const { error } = await supabase
        .from('demandas')
        .update({ status, data_atualizacao: updatedAt })
        .eq('id', demandId)

      if (error) {
        toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' })
        fetchSingleDemand(demandId)
      }
    },
    [fetchSingleDemand],
  )

  const deleteDemand = useCallback(async (demandId: string) => {
    const { error } = await supabase.from('demandas').delete().eq('id', demandId)
    if (!error) {
      setDemands((prev) => prev.filter((d) => d.id !== demandId))
      setCompletedDemands((prev) => prev.filter((d) => d.id !== demandId))
      toast({ title: 'Demanda Excluída', description: 'Removida com sucesso.' })
    }
  }, [])

  const acceptDemand = useCallback(
    async (demandId: string) => {
      if (!user) return

      const demand =
        demands.find((d) => d.id === demandId) || completedDemands.find((d) => d.id === demandId)
      if (!demand) return

      const newAssigneeId = demand.assigneeId || user.id
      const newAssigneeName = demand.assigneeId ? demand.assignee : userName || 'Você'
      const updatedAt = new Date().toISOString()
      const newAcceptedAt = demand.acceptedAt || updatedAt

      const updatedDemand = {
        ...demand,
        status: 'Em Andamento' as DemandStatus,
        assigneeId: newAssigneeId,
        assignee: newAssigneeName,
        updatedAt,
        acceptedAt: newAcceptedAt,
        lastStatusChangeAt: updatedAt,
      }

      setCompletedDemands((prev) => prev.filter((d) => d.id !== demandId))
      setDemands((prev) => {
        if (prev.some((d) => d.id === demandId))
          return prev.map((d) => (d.id === demandId ? updatedDemand : d))
        return [updatedDemand, ...prev]
      })
      const { error } = await supabase
        .from('demandas')
        .update({
          status: 'Em Andamento',
          responsavel_id: newAssigneeId,
          data_atualizacao: updatedAt,
          data_aceite: newAcceptedAt,
        })
        .eq('id', demandId)

      if (!error) {
        toast({
          title: 'Demanda Aceita',
          description:
            newAssigneeId === user.id
              ? 'Atribuída a você e em andamento.'
              : 'Movida para Em andamento.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
      } else {
        toast({ title: 'Erro', description: 'Falha ao aceitar', variant: 'destructive' })
        fetchSingleDemand(demandId)
      }
    },
    [user, userName, demands, fetchSingleDemand],
  )

  const completeDemand = useCallback(
    async (demandId: string, resposta: string, newAttachments: DemandAttachment[]) => {
      try {
        const { data, error: selectErr } = await supabase
          .from('demandas')
          .select('anexos')
          .eq('id', demandId)
          .single()

        if (selectErr && selectErr.code !== 'PGRST116') throw selectErr

        const existingAnexos = Array.isArray(data?.anexos) ? data.anexos : []
        const updatedAttachments = [...existingAnexos, ...(newAttachments || [])]

        const nowIso = new Date().toISOString()
        const { error } = await supabase
          .from('demandas')
          .update({
            status: 'Concluído',
            resposta,
            data_resposta: nowIso,
            data_conclusao: nowIso,
            data_atualizacao: nowIso,
            anexos: updatedAttachments,
          })
          .eq('id', demandId)

        if (error) throw error

        const newLogId = crypto.randomUUID()
        const { error: logErr } = await supabase.from('logs_auditoria').insert({
          id: newLogId,
          demanda_id: demandId,
          usuario_id: user?.id || null,
          acao: 'Conclusão',
          detalhes: resposta,
          dados_novos: newAttachments.length > 0 ? { anexos: newAttachments } : null,
        })

        if (logErr) {
          console.error('Erro ao registrar log de auditoria (ignorado):', logErr)
        }

        const newLog: DemandLog = {
          id: newLogId,
          acao: 'Conclusão',
          detalhes: resposta,
          createdAt: nowIso,
          usuario_id: user?.id,
          userName: userName || 'Você',
          dados_novos: newAttachments.length > 0 ? { anexos: newAttachments } : undefined,
        }

        setDemands((prev) => prev.filter((d) => d.id !== demandId))
        setTimeout(() => fetchSingleDemand(demandId), 100)

        toast({
          title: 'Demanda Concluída',
          description: 'A demanda foi finalizada com sucesso.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
      } catch (e: any) {
        console.error('Erro ao concluir demanda:', e)
        fetchSingleDemand(demandId)
        toast({
          title: 'Erro',
          description: e.message || 'Erro ao concluir demanda.',
          variant: 'destructive',
        })
        throw e
      }
    },
    [user, userName, fetchSingleDemand],
  )

  const addResponse = useCallback(
    async (demandId: string, text: string, attachments?: DemandAttachment[]) => {
      if (!user || !demandId) return

      const newLogId = crypto.randomUUID()
      const hasAttachments = attachments && attachments.length > 0
      const acaoType = hasAttachments && !text.trim() ? 'Anexo' : 'Comentário'
      const detalhesText =
        text.trim() ||
        (hasAttachments
          ? `Arquivo(s) anexado(s): ${attachments.map((a) => a.name).join(', ')}`
          : '')

      try {
        let finalAttachments = attachments
        const nowIso = new Date().toISOString()

        if (hasAttachments) {
          const { data, error: fetchErr } = await supabase
            .from('demandas')
            .select('anexos')
            .eq('id', demandId)
            .single()

          if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr

          const existingAnexos = Array.isArray(data?.anexos) ? data.anexos : []
          finalAttachments = [...existingAnexos, ...(attachments || [])]
          const { error: updateErr } = await supabase
            .from('demandas')
            .update({ anexos: finalAttachments, data_atualizacao: nowIso })
            .eq('id', demandId)

          if (updateErr) throw updateErr
        } else {
          await supabase.from('demandas').update({ data_atualizacao: nowIso }).eq('id', demandId)
        }

        await supabase.from('logs_auditoria').insert({
          id: newLogId,
          demanda_id: demandId,
          usuario_id: user.id,
          acao: acaoType,
          detalhes: detalhesText,
          dados_novos: hasAttachments ? { anexos: attachments } : null,
        })

        const newLog: DemandLog = {
          id: newLogId,
          acao: acaoType,
          detalhes: detalhesText,
          createdAt: nowIso,
          usuario_id: user.id,
          userName: userName || 'Você',
          dados_novos: hasAttachments ? { anexos: attachments } : undefined,
        }

        setDemands((prev) =>
          prev.map((d) =>
            d.id === demandId
              ? {
                  ...d,
                  logs: [...(d.logs || []), newLog],
                  attachments: hasAttachments ? finalAttachments : d.attachments,
                  updatedAt: nowIso,
                }
              : d,
          ),
        )
        setCompletedDemands((prev) =>
          prev.map((d) =>
            d.id === demandId
              ? {
                  ...d,
                  logs: [...(d.logs || []), newLog],
                  attachments: hasAttachments ? finalAttachments : d.attachments,
                  updatedAt: nowIso,
                }
              : d,
          ),
        )

        toast({
          title: 'Sucesso',
          description: 'Registro adicionado na linha do tempo.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
      } catch (err: any) {
        fetchSingleDemand(demandId)
        toast({
          title: 'Erro',
          description: err.message || 'Falha ao registrar observação.',
          variant: 'destructive',
        })
      }
    },
    [user, userName, fetchSingleDemand],
  )

  const updateChecklist = useCallback(
    async (demandId: string, checklist: ChecklistItem[], actionText?: string) => {
      if (!user) return

      const currentDemand =
        demands.find((d) => d.id === demandId) || completedDemands.find((d) => d.id === demandId)
      if (currentDemand?.assigneeId) {
        checklist = await syncChecklistAgenda(
          demandId,
          currentDemand.title,
          currentDemand.assigneeId,
          checklist,
        )
      }

      const updatedAt = new Date().toISOString()
      setDemands((prev) =>
        prev.map((d) => (d.id === demandId ? { ...d, checklist, updatedAt } : d)),
      )
      setCompletedDemands((prev) =>
        prev.map((d) => (d.id === demandId ? { ...d, checklist, updatedAt } : d)),
      )

      const { error } = await supabase
        .from('demandas')
        .update({ checklist, data_atualizacao: updatedAt })
        .eq('id', demandId)

      if (error) {
        fetchSingleDemand(demandId)
        return
      }

      if (actionText) {
        const { error: logErr } = await supabase.from('logs_auditoria').insert({
          demanda_id: demandId,
          usuario_id: user.id,
          acao: 'Checklist',
          detalhes: actionText,
        })
        if (logErr) console.error('Error inserting checklist log:', logErr)
      }
    },
    [user, demands, fetchSingleDemand],
  )

  const reopenDemand = useCallback(
    async (demandId: string) => {
      if (!user) return
      const demand =
        demands.find((d) => d.id === demandId) || completedDemands.find((d) => d.id === demandId)
      if (!demand) return

      const nowIso = new Date().toISOString()

      const { error } = await supabase
        .from('demandas')
        .update({ status: 'Em Andamento', data_atualizacao: nowIso })
        .eq('id', demandId)

      if (!error) {
        const newLogId = crypto.randomUUID()
        await supabase.from('logs_auditoria').insert({
          id: newLogId,
          demanda_id: demandId,
          usuario_id: user.id,
          acao: 'Reabertura',
          detalhes: 'Demanda reaberta',
        })

        setCompletedDemands((prev) => prev.filter((d) => d.id !== demandId))
        setTimeout(() => fetchSingleDemand(demandId), 100)

        toast({
          title: 'Demanda Reaberta',
          description: 'A demanda retornou para Em Andamento.',
        })
      } else {
        fetchSingleDemand(demandId)
        toast({
          title: 'Erro',
          description: 'Não foi possível reabrir a demanda.',
          variant: 'destructive',
        })
      }
    },
    [user, userName, demands, fetchSingleDemand],
  )

  const addAttachments = useCallback(
    async (demandId: string, newAttachments: DemandAttachment[]) => {
      if (!user) return
      try {
        const newLogId = crypto.randomUUID()
        const nowIso = new Date().toISOString()
        const newLog: DemandLog = {
          id: newLogId,
          acao: 'Anexo',
          detalhes: `Arquivo(s) anexado(s): ${newAttachments.map((a) => a.name).join(', ')}`,
          dados_novos: { anexos: newAttachments },
          createdAt: nowIso,
          usuario_id: user.id,
          userName: userName || 'Você',
        }

        setDemands((prev) =>
          prev.map((d) => {
            if (d.id === demandId) {
              const existingList = Array.isArray(d.attachments) ? d.attachments : []
              const updatedAttachments = [...existingList, ...(newAttachments || [])]
              return {
                ...d,
                attachments: updatedAttachments,
                logs: [...(d.logs || []), newLog],
                updatedAt: nowIso,
              }
            }
            return d
          }),
        )
        setCompletedDemands((prev) =>
          prev.map((d) => {
            if (d.id === demandId) {
              const existingList = Array.isArray(d.attachments) ? d.attachments : []
              const updatedAttachments = [...existingList, ...(newAttachments || [])]
              return {
                ...d,
                attachments: updatedAttachments,
                logs: [...(d.logs || []), newLog],
                updatedAt: nowIso,
              }
            }
            return d
          }),
        )

        const { data } = await supabase
          .from('demandas')
          .select('anexos')
          .eq('id', demandId)
          .single()
        const existingAnexos = Array.isArray(data?.anexos) ? data.anexos : []
        const updatedAttachments = [...existingAnexos, ...(newAttachments || [])]
        await supabase
          .from('demandas')
          .update({ anexos: updatedAttachments, data_atualizacao: nowIso })
          .eq('id', demandId)

        const { error: logErr } = await supabase.from('logs_auditoria').insert({
          demanda_id: demandId,
          usuario_id: user.id,
          acao: 'Anexo',
          detalhes: `Arquivo(s) anexado(s): ${newAttachments.map((a) => a.name).join(', ')}`,
          dados_novos: { anexos: newAttachments },
        })
        if (logErr) {
          console.error('Error inserting attachment log (ignored):', logErr)
        }
      } catch (e) {
        fetchSingleDemand(demandId)
        toast({ title: 'Erro', description: 'Erro ao salvar anexos.', variant: 'destructive' })
      }
    },
    [user, userName, fetchSingleDemand],
  )

  const advancePostSalesWorkflow = useCallback(
    async (demandId: string) => {
      if (!user) return
      const demand = demands.find((d) => d.id === demandId)
      if (!demand) return

      let newFase = demand.posVendaFase
      let nextDate: Date | null = null
      let newStatus = demand.status
      let assigneeId = demand.assigneeId
      let dataConclusao = demand.dataConclusaoTreinamento
      let posVendaAlvo = demand.posVendaAlvo

      if (demand.posVendaFase === 'treinamento') {
        if (demand.posVendaAlvo) {
          newFase = demand.posVendaAlvo
          if (newFase === 'finalizado') {
            newStatus = 'Concluído'
            nextDate = null
          } else {
            nextDate = new Date()
            nextDate.setDate(nextDate.getDate() + 15)
            assigneeId = demand.creatorId
          }
          posVendaAlvo = null
        } else {
          newFase = 'pos_venda_5d'
          nextDate = new Date()
          nextDate.setDate(nextDate.getDate() + 5)
          assigneeId = demand.creatorId
          dataConclusao = new Date().toISOString()
        }
      } else if (demand.posVendaFase === 'pos_venda_5d') {
        newFase = 'pos_venda_20d'
        nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + 15)
      } else if (demand.posVendaFase === 'pos_venda_20d') {
        newFase = 'pos_venda_35d'
        nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + 15)
      } else if (demand.posVendaFase === 'pos_venda_35d') {
        newFase = 'finalizado'
        newStatus = 'Concluído'
        nextDate = null
      }

      const updates: any = {
        pos_venda_fase: newFase,
        pos_venda_alvo: posVendaAlvo,
        data_proxima_acao: nextDate ? nextDate.toISOString() : null,
        status: newStatus,
        responsavel_id: assigneeId,
        data_conclusao_treinamento: dataConclusao,
        data_atualizacao: new Date().toISOString(),
      }

      if (newStatus === 'Concluído') {
        updates.data_conclusao = new Date().toISOString()
      }

      if (newStatus === 'Concluído') {
        setDemands((prev) => prev.filter((d) => d.id !== demandId))
        setTimeout(() => fetchSingleDemand(demandId), 100)
      } else {
        setDemands((prev) =>
          prev.map((d) =>
            d.id === demandId
              ? {
                  ...d,
                  posVendaFase: newFase as any,
                  posVendaAlvo: posVendaAlvo as any,
                  dataProximaAcao: updates.data_proxima_acao,
                  status: newStatus as any,
                  assigneeId: assigneeId,
                  dataConclusaoTreinamento: dataConclusao,
                  updatedAt: updates.data_atualizacao,
                  completedAt: newStatus === 'Concluído' ? updates.data_atualizacao : d.completedAt,
                }
              : d,
          ),
        )
      }

      const { error } = await supabase.from('demandas').update(updates).eq('id', demandId)
      if (error) {
        fetchSingleDemand(demandId)
        toast({ title: 'Erro', description: 'Falha ao avançar fase.', variant: 'destructive' })
        return
      }

      if (nextDate && assigneeId) {
        const eventStart = nextDate.toISOString()
        const eventEnd = new Date(nextDate.getTime() + 60 * 60 * 1000).toISOString()
        const dias = newFase === 'pos_venda_5d' ? '5' : newFase === 'pos_venda_20d' ? '20' : '35'

        await supabase.from('agenda_eventos').insert({
          titulo: `Pós-Venda (${dias} dias): ${demand.clientName || demand.title}`,
          descricao: `Acompanhamento de pós-venda para a demanda: ${demand.title}`,
          data_inicio: eventStart,
          data_fim: eventEnd,
          usuario_id: assigneeId,
          demanda_id: demandId,
          cliente_id: demand.clientId,
          tipo: 'Pós-Venda',
        })
      }

      await supabase.from('logs_auditoria').insert({
        demanda_id: demandId,
        usuario_id: user.id,
        acao: 'Avanço Pós-Venda',
        detalhes: `Avançou de ${demand.posVendaFase} para ${newFase}.`,
      })

      toast({ title: 'Fase Avançada', description: `Demanda movida para ${newFase}` })
    },
    [demands, user, fetchSingleDemand],
  )

  const failPostSalesWorkflow = useCallback(
    async (demandId: string, reason: string) => {
      if (!user) return
      const demand = demands.find((d) => d.id === demandId)
      if (!demand) return

      let nextAlvo = 'pos_venda_20d'
      if (demand.posVendaFase === 'pos_venda_20d') nextAlvo = 'pos_venda_35d'
      if (demand.posVendaFase === 'pos_venda_35d') nextAlvo = 'finalizado'

      const updates = {
        pos_venda_fase: 'treinamento',
        pos_venda_alvo: nextAlvo,
        data_proxima_acao: null,
        status: 'Em Andamento',
        data_atualizacao: new Date().toISOString(),
      }

      setDemands((prev) =>
        prev.map((d) =>
          d.id === demandId
            ? {
                ...d,
                posVendaFase: 'treinamento',
                posVendaAlvo: nextAlvo as any,
                dataProximaAcao: null,
                status: 'Em Andamento',
                updatedAt: updates.data_atualizacao,
              }
            : d,
        ),
      )

      const { error } = await supabase.from('demandas').update(updates).eq('id', demandId)

      if (error) {
        fetchSingleDemand(demandId)
        toast({ title: 'Erro', description: 'Falha ao retornar a demanda', variant: 'destructive' })
        return
      }

      await supabase
        .from('agenda_eventos')
        .delete()
        .eq('demanda_id', demandId)
        .eq('tipo', 'Pós-Venda')

      await supabase.from('logs_auditoria').insert({
        demanda_id: demandId,
        usuario_id: user.id,
        acao: 'Falha Pós-Venda',
        detalhes: `Retornado para Treinamento com alvo em ${nextAlvo}. Motivo: ${reason}`,
      })

      toast({
        title: 'Retornado',
        description: `A demanda retornou para Treinamento. Próximo alvo: ${nextAlvo}.`,
        variant: 'destructive',
      })
    },
    [demands, user, fetchSingleDemand],
  )

  const value = useMemo(
    () => ({
      demands,
      completedDemands,
      collaborators,
      notifications,
      checklistTemplates,
      demandTemplates,
      addDemand,
      editDemand,
      updateStatus,
      deleteDemand,
      acceptDemand,
      completeDemand,
      addResponse,
      addAttachments,
      reopenDemand,
      updateChecklist,
      markNotificationsAsRead,
      fetchCollaborators,
      fetchChecklistTemplates,
      addChecklistTemplate,
      fetchDemandTemplates,
      addDemandTemplate,
      editDemandTemplate,
      deleteDemandTemplate,
      advancePostSalesWorkflow,
      failPostSalesWorkflow,
      isLoading,
      isLoadingMore,
      hasMore,
      loadMoreDemands,
      fetchCompletedDemands,
      loadMoreCompletedDemands,
      hasMoreCompleted,
      isLoadingCompleted,
      isLoadingMoreCompleted,
      fetchDemandLogs,
    }),
    [
      demands,
      completedDemands,
      collaborators,
      notifications,
      checklistTemplates,
      demandTemplates,
      addDemand,
      editDemand,
      updateStatus,
      deleteDemand,
      acceptDemand,
      completeDemand,
      addResponse,
      addAttachments,
      reopenDemand,
      updateChecklist,
      markNotificationsAsRead,
      fetchCollaborators,
      fetchChecklistTemplates,
      addChecklistTemplate,
      fetchDemandTemplates,
      addDemandTemplate,
      editDemandTemplate,
      deleteDemandTemplate,
      advancePostSalesWorkflow,
      failPostSalesWorkflow,
      isLoading,
      isLoadingMore,
      hasMore,
      loadMoreDemands,
      fetchCompletedDemands,
      loadMoreCompletedDemands,
      hasMoreCompleted,
      isLoadingCompleted,
      isLoadingMoreCompleted,
      fetchDemandLogs,
    ],
  )

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>
}

export default function useDemandStore() {
  const context = useContext(DemandContext)
  if (!context) throw new Error('useDemandStore must be used within a DemandProvider')
  return context
}
