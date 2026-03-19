import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { Demand, DemandPriority, DemandStatus, DemandNotification } from '@/types/demand'
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
    demand: Omit<Demand, 'id' | 'createdAt' | 'responses'> & { assigneeId?: string | null },
  ) => Promise<void>
  updateStatus: (demandId: string, status: DemandStatus) => Promise<void>
  deleteDemand: (demandId: string) => Promise<void>
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
  const { user, role } = useAuthStore()

  const fetchDemands = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('demandas')
        .select(
          '*, responsavel:usuarios(nome), logs_auditoria(acao, usuario_id, dados_novos, data_criacao)',
        )
        .order('data_criacao', { ascending: false })

      if (error) {
        console.error('Error fetching demands:', error)
        return
      }

      if (data) {
        const parsedDemands = data.map((d: any) => {
          const logs = Array.isArray(d.logs_auditoria) ? d.logs_auditoria : []
          const sortedLogs = [...logs].sort((a: any, b: any) => {
            const dateA = a.data_criacao ? new Date(a.data_criacao).getTime() : 0
            const dateB = b.data_criacao ? new Date(b.data_criacao).getTime() : 0
            return dateB - dateA
          })
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
            responses: [], // Kept as empty to be populated if needed
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
      newDemand: Omit<Demand, 'id' | 'createdAt' | 'responses'> & { assigneeId?: string | null },
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
            ...prev,
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
              createdAt: data.data_criacao || new Date().toISOString(),
              systemEscalated: false,
            },
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
        description: 'A demanda foi removida.',
        variant: 'destructive',
      })
    } catch (e) {
      console.error('Exception in deleteDemand:', e)
    }
  }, [])

  const value = useMemo(
    () => ({
      demands,
      collaborators,
      notifications,
      addDemand,
      updateStatus,
      deleteDemand,
      markNotificationsAsRead,
    }),
    [
      demands,
      collaborators,
      notifications,
      addDemand,
      updateStatus,
      deleteDemand,
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
