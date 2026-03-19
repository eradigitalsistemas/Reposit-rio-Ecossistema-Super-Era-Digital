export type DemandPriority = 'Urgente' | 'Durante o Dia' | 'Pode Ficar para Amanhã'
export type DemandStatus = 'Pendente' | 'Em Andamento' | 'Concluído'
export type DemandCategory = 'Serviço' | 'Dúvida' | 'Reclamação' | 'Outro'

export interface DemandLog {
  id: string
  acao: string
  detalhes: string
  createdAt: string
  usuario_id?: string
}

export interface DemandAttachment {
  name: string
  url: string
  type: string
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
  clientId?: string
  category?: DemandCategory
  responses?: string[]
  logs?: DemandLog[]
  attachments?: DemandAttachment[]
  createdAt: string
  systemEscalated?: boolean
}

export interface DemandNotification {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
  demandId?: string
}
