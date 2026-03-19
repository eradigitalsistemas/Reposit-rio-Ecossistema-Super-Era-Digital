export type DemandPriority = 'Urgente' | 'Durante o Dia' | 'Pode Ficar para Amanhã'
export type DemandStatus = 'Pendente' | 'Em Andamento' | 'Concluído'

export interface DemandResponse {
  id: string
  text: string
  createdAt: string
  author: string
}

export interface Demand {
  id: string
  title: string
  description: string
  priority: DemandPriority
  status: DemandStatus
  dueDate: string
  assignee: string
  responses: DemandResponse[]
  createdAt: string
}

export const COLLABORATORS = ['Ana Silva', 'Carlos Santos', 'Mariana Costa', 'João Oliveira']
