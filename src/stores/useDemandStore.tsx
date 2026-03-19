import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { Demand, DemandPriority, DemandStatus, DemandNotification, DemandLog } from '@/types/demand'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from './useAuthStore'

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
    updates: Partial<Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'>>,
  ) => Promise<void>
  updateStatus: (demandId: string, status: DemandStatus) => Promise<void>
  deleteDemand: (demandId: string) => Promise<void>
  acceptDemand: (demandId: string) => Promise<void>
  addResponse: (demandId: string, text: string) => Promise<void>
  markNotificationsAsRead: () => void
}

const mockNotifications: DemandNotification[] = [
  {
    id: 'n1',
    title: 'Sistema de Notificações',
    message: 'Bem-vindo! Você receberá alertas sobre demandas aqui.',
    createdAt: new Date().toISOString(),
    read: false,
  },
]

const DemandContext = createContext<DemandStoreState | null>(null)

export const DemandProvider = ({ children }: { children: React.ReactNode }) => {
  const [demands, setDemands] = useState<Demand[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [notifications, setNotifications] = useState<DemandNotification[]>(mockNotifications)
  const { user, role, userName } = useAuthStore()

  const fetchDemands = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios(nome), logs_auditoria(id, acao, detalhes, usuario_id, dados_novos, data_criacao)',
        )
        .order('data_criacao', { ascending: false })

      if (error) {
        console.error('Error fetching demands:', error)
        return
      }

      if (data) {
        const parsedDemands = data.map((d: any) => {
          const logsArray = Array.isArray(d.logs_auditoria) ? d.logs_auditoria : []
          const sortedLogs = [...logsArray].sort((a: any, b: any) => {
            const dateA = a.data_criacao ? new Date(a.data_criacao).getTime() : 0
            const dateB = b.data_criacao ? new Date(b.data_criacao).getTime() : 0
            return dateB - dateA
          })

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
            latestPriorityChange.dados_novos &&
            latestPriorityChange.dados_novos.prioridade === 'Urgente' &&
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
            responses: [],
            logs: mappedLogs,
            createdAt: d.data_criacao || new Date().toISOString(),
            systemEscalated: !!systemEscalated,
          }
        })
        setDemands(parsedDemands)
      }
    } catch (e) {
      console.error('Exception in fetchDemands:', e)
    }
  }, [user])

  const fetchCollaborators = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.from('usuarios').select('id, nome').eq('ativo', true)
      if (error) {
        console.error('Error fetching collaborators:', error)
        return
      }
      if (data) {
        setCollaborators(data)
      }
    } catch (e) {
      console.error('Exception in fetchCollaborators:', e)
    }
  }, [user])

  useEffect(() => {
    if (role && role !== 'Client') {
      fetchDemands()
      fetchCollaborators()
    }
  }, [role, fetchDemands, fetchCollaborators])

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

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
          })
          .select('*, responsavel:usuarios(nome)')
          .single()

        if (error) {
          console.error('Error inserting demand:', error)
          toast({
            title: 'Erro',
            description: 'Não foi possível criar a demanda.',
            variant: 'destructive',
          })
          return
        }

        if (data) {
          setDemands((prev) => [
            {
              id: data.id,
              title: data.titulo || 'Sem título',
              description: data.descricao || '',
              priority: (data.prioridade as DemandPriority) || 'Pode Ficar para Amanhã',
              status: (data.status as DemandStatus) || 'Pendente',
              dueDate: data.data_vencimento || null,
              assignee: (data as any).responsavel?.nome || 'Sem responsável',
              assigneeId: data.responsavel_id || null,
              responses: [],
              logs: [],
              createdAt: data.data_criacao || new Date().toISOString(),
              systemEscalated: false,
            },
            ...prev,
          ])
          toast({ title: 'Nova Demanda Criada', description: `A tarefa foi adicionada.` })
        }
      } catch (e) {
        console.error('Exception in addDemand:', e)
        toast({ title: 'Erro', description: 'Ocorreu um erro inesperado.', variant: 'destructive' })
      }
    },
    [user],
  )

  const editDemand = useCallback(
    async (
      demandId: string,
      updates: Partial<Omit<Demand, 'id' | 'createdAt' | 'responses' | 'logs'>>,
    ) => {
      try {
        const updateData: any = {}
        if (updates.title !== undefined) updateData.titulo = updates.title
        if (updates.description !== undefined) updateData.descricao = updates.description
        if (updates.priority !== undefined) updateData.prioridade = updates.priority
        if (updates.dueDate !== undefined) updateData.data_vencimento = updates.dueDate
        if (updates.assigneeId !== undefined) updateData.responsavel_id = updates.assigneeId
        if (updates.status !== undefined) updateData.status = updates.status

        const { error } = await supabase.from('demandas').update(updateData).eq('id', demandId)

        if (error) {
          console.error('Error updating demand:', error)
          toast({
            title: 'Erro',
            description: 'Não foi possível atualizar a demanda.',
            variant: 'destructive',
          })
          return
        }

        toast({ title: 'Demanda Atualizada', description: 'As alterações foram salvas.' })
        fetchDemands()
      } catch (e) {
        console.error('Exception in editDemand:', e)
        toast({ title: 'Erro', description: 'Ocorreu um erro inesperado.', variant: 'destructive' })
      }
    },
    [fetchDemands],
  )

  const updateStatus = useCallback(
    async (demandId: string, status: DemandStatus) => {
      setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, status } : d)))

      try {
        const { error } = await supabase.from('demandas').update({ status }).eq('id', demandId)
        if (error) {
          console.error('Error updating status:', error)
          toast({ title: 'Erro', description: 'Erro ao atualizar status.', variant: 'destructive' })
          fetchDemands()
        }
      } catch (e) {
        console.error('Exception in updateStatus:', e)
        fetchDemands()
      }
    },
    [fetchDemands],
  )

  const deleteDemand = useCallback(async (demandId: string) => {
    try {
      const { error } = await supabase.from('demandas').delete().eq('id', demandId)
      if (error) {
        console.error('Error deleting demand:', error)
        toast({ title: 'Erro', description: 'Erro ao excluir demanda.', variant: 'destructive' })
        return
      }
      setDemands((prev) => prev.filter((d) => d.id !== demandId))
      toast({
        title: 'Demanda Excluída',
        description: 'A demanda foi removida com sucesso.',
      })
    } catch (e) {
      console.error('Exception in deleteDemand:', e)
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado.', variant: 'destructive' })
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

      try {
        const { error } = await supabase
          .from('demandas')
          .update({
            status: 'Em Andamento',
            responsavel_id: user.id,
          })
          .eq('id', demandId)

        if (error) throw error

        toast({
          title: 'Demanda Aceita',
          description: 'A demanda foi movida para Em Andamento e atribuída a você.',
          className:
            'bg-zinc-950 border border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
        fetchDemands()
      } catch (e) {
        console.error(e)
        toast({ title: 'Erro', description: 'Erro ao aceitar demanda.', variant: 'destructive' })
        fetchDemands()
      }
    },
    [user, userName, fetchDemands],
  )

  const addResponse = useCallback(
    async (demandId: string, text: string) => {
      if (!user) return
      try {
        const { error } = await supabase
          .from('demandas')
          .update({ resposta: text })
          .eq('id', demandId)
        if (error) throw error

        toast({
          title: 'Sucesso',
          description: 'Resposta ou atualização adicionada ao histórico.',
          className:
            'bg-zinc-950 border border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]',
        })
        fetchDemands()
      } catch (e) {
        console.error(e)
        toast({ title: 'Erro', description: 'Erro ao adicionar resposta.', variant: 'destructive' })
      }
    },
    [user, fetchDemands],
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
      addResponse,
      markNotificationsAsRead,
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
      addResponse,
      markNotificationsAsRead,
    ],
  )

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>
}

export default function useDemandStore() {
  const context = useContext(DemandContext)
  if (!context) throw new Error('useDemandStore must be used within a DemandProvider')
  return context
}
