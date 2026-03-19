import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import {
  Demand,
  DemandPriority,
  DemandStatus,
  DemandResponse,
  DemandNotification,
} from '@/types/demand'
import { toast } from '@/hooks/use-toast'

interface DemandStoreState {
  demands: Demand[]
  notifications: DemandNotification[]
  addDemand: (demand: Omit<Demand, 'id' | 'createdAt' | 'responses'>) => void
  addResponse: (demandId: string, response: string, author: string) => void
  updateStatus: (demandId: string, status: DemandStatus) => void
  markNotificationsAsRead: () => void
}

const mockDemands: Demand[] = [
  {
    id: '1',
    title: 'Revisar contrato da Tech Corp',
    description:
      'Verificar cláusulas de rescisão e multas contratuais para evitar surpresas no próximo trimestre.',
    priority: 'Urgente',
    status: 'Em Andamento',
    dueDate: new Date().toISOString(),
    assignee: 'Ana Silva',
    responses: [
      {
        id: 'r1',
        text: 'Iniciei a revisão da primeira parte do documento. Até o final do dia envio meus apontamentos.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        author: 'Ana Silva',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Atualizar layout da página inicial',
    description: 'Implementar novo design aprovado pelo cliente na última reunião.',
    priority: 'Pode Ficar para Amanhã',
    status: 'Pendente',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    assignee: 'Carlos Santos',
    responses: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Aprovar orçamento de marketing',
    description: 'Revisar os valores propostos pela agência para a campanha do próximo mês.',
    priority: 'Durante o Dia',
    status: 'Pendente',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assignee: 'Mariana Costa',
    responses: [],
    createdAt: new Date().toISOString(),
  },
]

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
  const [demands, setDemands] = useState<Demand[]>(mockDemands)
  const [notifications, setNotifications] = useState<DemandNotification[]>(mockNotifications)

  const addNotification = useCallback((title: string, message: string) => {
    const newNotif: DemandNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
    toast({
      title,
      description: message,
    })
  }, [])

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const addDemand = useCallback((newDemand: Omit<Demand, 'id' | 'createdAt' | 'responses'>) => {
    const demand: Demand = {
      ...newDemand,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      responses: [],
    }
    setDemands((prev) => [...prev, demand])
    toast({
      title: 'Nova Demanda Criada',
      description: `A tarefa "${demand.title}" foi adicionada.`,
    })
  }, [])

  const addResponse = useCallback(
    (demandId: string, text: string, author: string) => {
      const demand = demands.find((d) => d.id === demandId)
      if (demand) {
        addNotification('Novo Comentário', `${author} respondeu em "${demand.title}".`)
      }

      setDemands((prev) =>
        prev.map((d) => {
          if (d.id === demandId) {
            return {
              ...d,
              responses: [
                ...d.responses,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  text,
                  author,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          }
          return d
        }),
      )
    },
    [demands, addNotification],
  )

  const updateStatus = useCallback(
    (demandId: string, status: DemandStatus) => {
      const demand = demands.find((d) => d.id === demandId)
      if (demand && demand.status !== status) {
        addNotification(
          'Status Atualizado',
          `A demanda "${demand.title}" foi movida para ${status}.`,
        )
      }

      setDemands((prev) => prev.map((d) => (d.id === demandId ? { ...d, status } : d)))
    },
    [demands, addNotification],
  )

  const value = useMemo(
    () => ({
      demands,
      notifications,
      addDemand,
      addResponse,
      updateStatus,
      markNotificationsAsRead,
    }),
    [demands, notifications, addDemand, addResponse, updateStatus, markNotificationsAsRead],
  )

  return <DemandContext.Provider value={value}>{children}</DemandContext.Provider>
}

export default function useDemandStore() {
  const context = useContext(DemandContext)
  if (!context) {
    throw new Error('useDemandStore must be used within a DemandProvider')
  }
  return context
}
