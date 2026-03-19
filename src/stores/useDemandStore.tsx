import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import {
  Demand,
  DemandPriority,
  DemandStatus,
  DemandNotification,
  DemandLog,
  DemandAttachment,
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
  collaborators: Collaborator[]
  notifications: DemandNotification[]
  addDemand: (
    demand: Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'> & {
      assigneeId?: string | null
    },
  ) => Promise<void>
  editDemand: (
    demandId: string,
    updates: Partial<Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'>> & {
      attachments?: DemandAttachment[]
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
  addResponse: (demandId: string, text: string) => Promise<void>
  addAttachments: (demandId: string, attachments: DemandAttachment[]) => Promise<void>
  markNotificationsAsRead: () => void
  fetchCollaborators: () => Promise<void>
}

const DemandContext = createContext<DemandStoreState | null>(null)

export const DemandProvider = ({ children }: { children: React.ReactNode }) => {
  const [demands, setDemands] = useState<Demand[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [notifications, setNotifications] = useState<DemandNotification[]>([])
  const { user, role, userName } = useAuthStore()
  const navigate = useNavigate()

  const fetchDemands = useCallback(async () => {
    if (!user) return
    try {
      let query = supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios(nome), logs_auditoria(id, acao, detalhes, usuario_id, dados_novos, data_criacao)',
        )
        .order('data_criacao', { ascending: false })

      if (role !== 'Admin') {
        query = query.eq('responsavel_id', user.id)
      }

      const { data, error } = await query

      if (error) return console.error('Error fetching demands:', error)

      if (data) {
        const parsedDemands = data.map((d: any) => {
          const sortedLogs = Array.isArray(d.logs_auditoria)
            ? [...d.logs_auditoria].sort(
                (a: any, b: any) =>
                  new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime(),
              )
            : []

          const mappedLogs: DemandLog[] = sortedLogs.map((l: any) => ({
            id: l.id || crypto.randomUUID(),
            acao: l.acao,
            detalhes: l.detalhes,
            createdAt: l.data_criacao,
            usuario_id: l.usuario_id,
          }))

          const latestPriorityChange = sortedLogs.find(
            (l: any) => l.acao === 'Alteração de Prioridade',
          )
          const systemEscalated =
            latestPriorityChange &&
            latestPriorityChange.usuario_id === null &&
            latestPriorityChange.dados_novos?.prioridade === 'Urgente' &&
            d.prioridade === 'Urgente'

          return {
            id: d.id,
            title: d.titulo || 'Sem título',
            description: d.descricao || '',
            priority: (d.prioridade as DemandPriority) || 'Pode Ficar para Amanhã',
            status: (d.status as DemandStatus) || 'Pendente',
            dueDate: d.data_vencimento || null,
            assignee: d.responsavel?.nome || 'Sem responsável',
            assigneeId: d.responsavel_id || null,
            responses: d.resposta ? [d.resposta] : [],
            logs: mappedLogs,
            attachments: d.anexos || [],
            createdAt: d.data_criacao || new Date().toISOString(),
            systemEscalated: !!systemEscalated,
          }
        })
        setDemands(parsedDemands)
      }
    } catch (e) {
      console.error(e)
    }
  }, [user, role])

  const fetchCollaborators = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome')
    if (!error && data) setCollaborators(data)
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
      .limit(50)
    if (!error && data) {
      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          title: n.titulo,
          message: n.mensagem,
          read: n.lida,
          createdAt: n.data_criacao,
          demandId: n.demanda_id,
        })),
      )
    }
  }, [user])

  useEffect(() => {
    let isSubscribed = true
    if (role && role !== 'Client' && user) {
      fetchDemands()
      fetchCollaborators()
      fetchNotifications()

      const usersChannel = supabase
        .channel('usuarios-colab-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => {
          if (isSubscribed) fetchCollaborators()
        })
        .subscribe()
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
        .subscribe()

      return () => {
        isSubscribed = false
        supabase.removeChannel(usersChannel)
        supabase.removeChannel(notifChannel)
      }
    }
  }, [role, user, fetchDemands, fetchCollaborators, fetchNotifications, navigate])

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
      newDemand: Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'> & {
        assigneeId?: string | null
      },
    ) => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('demandas')
          .insert({
            titulo: newDemand.title || 'Sem título',
            descricao: newDemand.description || null,
            prioridade: newDemand.priority || 'Pode Ficar para Amanhã',
            status: newDemand.status || 'Pendente',
            data_vencimento: newDemand.dueDate || null,
            responsavel_id: newDemand.assigneeId || null,
            usuario_id: user.id,
            anexos: newDemand.attachments || [],
          })
          .select('*, responsavel:usuarios(nome)')

        if (error) throw error
        if (data && data.length > 0) {
          const d = data[0]
          setDemands((prev) => [
            {
              id: d.id,
              title: d.titulo,
              description: d.descricao || '',
              priority: d.prioridade as DemandPriority,
              status: d.status as DemandStatus,
              dueDate: d.data_vencimento,
              assignee: (d as any).responsavel?.nome || 'Sem responsável',
              assigneeId: d.responsavel_id,
              responses: [],
              logs: [],
              attachments: d.anexos || [],
              createdAt: d.data_criacao,
              systemEscalated: false,
            },
            ...prev,
          ])
        }
        toast({ title: 'Nova Demanda Criada', description: `A tarefa foi adicionada.` })
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar a demanda.',
          variant: 'destructive',
        })
      }
    },
    [user],
  )

  const editDemand = useCallback(
    async (
      demandId: string,
      updates: Partial<Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'>> & {
        attachments?: DemandAttachment[]
      },
    ) => {
      try {
        const currentDemand = demands.find((d) => d.id === demandId)
        const updateData: any = {}
        let statusChangedToPending = false

        if (updates.title !== undefined) updateData.titulo = updates.title
        if (updates.description !== undefined) updateData.descricao = updates.description
        if (updates.priority !== undefined) updateData.prioridade = updates.priority
        if (updates.dueDate !== undefined) updateData.data_vencimento = updates.dueDate
        if (updates.attachments !== undefined) updateData.anexos = updates.attachments

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

        const { error } = await supabase.from('demandas').update(updateData).eq('id', demandId)
        if (error) throw error

        toast({ title: 'Demanda Atualizada', description: 'As alterações foram salvas.' })
        fetchDemands()
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar a demanda.',
          variant: 'destructive',
        })
      }
    },
    [fetchDemands, demands],
  )

  const updateStatus = useCallback(async (demandId: string, status: DemandStatus) => {
    setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, status } : d)))
    await supabase.from('demandas').update({ status }).eq('id', demandId)
  }, [])

  const deleteDemand = useCallback(async (demandId: string) => {
    const { error } = await supabase.from('demandas').delete().eq('id', demandId)
    if (!error) {
      setDemands((prev) => prev.filter((d) => d.id !== demandId))
      toast({ title: 'Demanda Excluída', description: 'Removida com sucesso.' })
    }
  }, [])

  const acceptDemand = useCallback(
    async (demandId: string) => {
      if (!user) return
      setDemands((prev) =>
        prev.map((d) =>
          d.id === demandId
            ? { ...d, status: 'Em Andamento', assigneeId: user.id, assignee: userName || 'Você' }
            : d,
        ),
      )
      const { error } = await supabase
        .from('demandas')
        .update({ status: 'Em Andamento', responsavel_id: user.id })
        .eq('id', demandId)
      if (!error)
        toast({
          title: 'Demanda Aceita',
          description: 'Atribuída a você.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
    },
    [user, userName],
  )

  const completeDemand = useCallback(
    async (demandId: string, resposta: string, newAttachments: DemandAttachment[]) => {
      try {
        const { data } = await supabase
          .from('demandas')
          .select('anexos')
          .eq('id', demandId)
          .single()
        const updatedAttachments = [...(data?.anexos || []), ...newAttachments]

        const { error } = await supabase
          .from('demandas')
          .update({
            status: 'Concluído',
            resposta,
            data_resposta: new Date().toISOString(),
            anexos: updatedAttachments,
          })
          .eq('id', demandId)

        if (error) throw error

        setDemands((prev) =>
          prev.map((d) =>
            d.id === demandId
              ? {
                  ...d,
                  status: 'Concluído',
                  responses: d.responses ? [...d.responses, resposta] : [resposta],
                  attachments: updatedAttachments,
                }
              : d,
          ),
        )

        toast({
          title: 'Demanda Concluída',
          description: 'A demanda foi finalizada com sucesso.',
          className:
            'bg-zinc-950 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao concluir demanda.', variant: 'destructive' })
      }
    },
    [],
  )

  const addResponse = useCallback(
    async (demandId: string, text: string) => {
      const { error } = await supabase
        .from('demandas')
        .update({ resposta: text })
        .eq('id', demandId)
      if (!error) {
        toast({
          title: 'Sucesso',
          description: 'Anotação adicionada.',
          className: 'bg-zinc-950 border-green-500/50 text-white',
        })
        fetchDemands()
      }
    },
    [fetchDemands],
  )

  const addAttachments = useCallback(
    async (demandId: string, newAttachments: DemandAttachment[]) => {
      try {
        const { data } = await supabase
          .from('demandas')
          .select('anexos')
          .eq('id', demandId)
          .single()
        const updatedAttachments = [...(data?.anexos || []), ...newAttachments]
        await supabase.from('demandas').update({ anexos: updatedAttachments }).eq('id', demandId)
        setDemands((prev) =>
          prev.map((d) => (d.id === demandId ? { ...d, attachments: updatedAttachments } : d)),
        )
      } catch (e) {
        toast({ title: 'Erro', description: 'Erro ao salvar anexos.', variant: 'destructive' })
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      demands,
      collaborators,
      notifications,
      addDemand,
      editDemand,
      updateStatus,
      deleteDemand,
      acceptDemand,
      completeDemand,
      addResponse,
      addAttachments,
      markNotificationsAsRead,
      fetchCollaborators,
    }),
    [
      demands,
      collaborators,
      notifications,
      addDemand,
      editDemand,
      updateStatus,
      deleteDemand,
      acceptDemand,
      completeDemand,
      addResponse,
      addAttachments,
      markNotificationsAsRead,
      fetchCollaborators,
    ],
  )

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>
}

export default function useDemandStore() {
  const context = useContext(DemandContext)
  if (!context) throw new Error('useDemandStore must be used within a DemandProvider')
  return context
}
