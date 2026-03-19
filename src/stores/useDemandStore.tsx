import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Demand, DemandPriority, DemandStatus, DemandResponse } from '@/types/demand'

interface DemandStoreState {
  demands: Demand[]
  addDemand: (demand: Omit<Demand, 'id' | 'createdAt' | 'responses'>) => void
  addResponse: (demandId: string, response: string, author: string) => void
  updateStatus: (demandId: string, status: DemandStatus) => void
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

const DemandContext = createContext<DemandStoreState | null>(null)

export const DemandProvider = ({ children }: { children: React.ReactNode }) => {
  const [demands, setDemands] = useState<Demand[]>(mockDemands)

  const addDemand = useCallback((newDemand: Omit<Demand, 'id' | 'createdAt' | 'responses'>) => {
    const demand: Demand = {
      ...newDemand,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      responses: [],
    }
    setDemands((prev) => [...prev, demand])
  }, [])

  const addResponse = useCallback((demandId: string, text: string, author: string) => {
    setDemands((prev) =>
      prev.map((demand) => {
        if (demand.id === demandId) {
          return {
            ...demand,
            responses: [
              ...demand.responses,
              {
                id: Math.random().toString(36).substr(2, 9),
                text,
                author,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }
        return demand
      }),
    )
  }, [])

  const updateStatus = useCallback((demandId: string, status: DemandStatus) => {
    setDemands((prev) =>
      prev.map((demand) => (demand.id === demandId ? { ...demand, status } : demand)),
    )
  }, [])

  const value = useMemo(
    () => ({
      demands,
      addDemand,
      addResponse,
      updateStatus,
    }),
    [demands, addDemand, addResponse, updateStatus],
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
