export type DemandPriority = 'Urgente' | 'Durante o Dia' | 'Pode Ficar para Amanhã'
export type DemandStatus = 'Pendente' | 'Em Andamento' | 'Concluído'
export type DemandCategory = 'Serviço' | 'Dúvida' | 'Reclamação' | 'Outro'

export interface DemandLog {
  id: string
  acao: string
  detalhes: string
  createdAt: string
  usuario_id?: string
  userName?: string
  dados_novos?: any
}

export interface DemandAttachment {
  name: string
  url: string
  type: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  dueDate?: string | null
  eventId?: string | null
}

export interface Demand {
  id: string
  protocolo?: string
  title: string
  description: string
  priority: DemandPriority
  status: DemandStatus
  dueDate: string | null
  assignee: string
  assigneeId?: string | null
  creatorId?: string | null
  clientId?: string | null
  clientName?: string | null
  category?: DemandCategory
  responses?: string[]
  logs?: DemandLog[]
  attachments?: DemandAttachment[]
  checklist?: ChecklistItem[]
  createdAt: string
  updatedAt?: string
  completedAt?: string | null
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

export interface ChecklistTemplate {
  id: string
  nome: string
  itens: string[]
  usuario_id: string
  data_criacao: string
}
