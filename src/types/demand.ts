export type DemandPriority = 'Urgente' | 'Durante o Dia' | 'Pode Ficar para Amanhã'
export type DemandStatus = 'Pendente' | 'Em Andamento' | 'Concluído'
export type DemandCategory = 'Serviço' | 'Dúvida' | 'Reclamação' | 'Outro'

export interface DemandLog {
  id: string
  acao: string
  detalhes: string | null
  createdAt: string
  usuario_id: string | null
}

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
  dueDate: string | null
  assignee: string
  assigneeId?: string | null
  responses: DemandResponse[]
  logs: DemandLog[]
  createdAt: string
  clientId?: string
  category?: DemandCategory
  systemEscalated?: boolean
}

export interface DemandNotification {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

export const COLLABORATORS = [
  'Ana Silva',
  'Carlos Santos',
  'Mariana Costa',
  'João Oliveira',
  'Não Atribuído',
]
