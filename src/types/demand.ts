export type DemandPriority = 'Urgente' | 'Durante o Dia' | 'Pode Ficar para Amanhã'
export type DemandStatus = 'Pendente' | 'Em Andamento' | 'Concluído'
export type DemandCategory =
  | 'Serviço'
  | 'Dúvida'
  | 'Reclamação'
  | 'Outro'
  | 'Implantação e Pós-Venda'
export type WorkflowTipo = 'geral' | 'implantacao_pos_venda'
export type PosVendaFase =
  | 'treinamento'
  | 'pos_venda_5d'
  | 'pos_venda_20d'
  | 'pos_venda_35d'
  | 'finalizado'

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
  acceptedAt?: string | null
  completedAt?: string | null
  systemEscalated?: boolean
  workflowTipo?: WorkflowTipo
  posVendaFase?: PosVendaFase | null
  posVendaAlvo?: PosVendaFase | null
  dataProximaAcao?: string | null
  dataConclusaoTreinamento?: string | null
  timePendingMs?: number | null
  timeInProgressMs?: number | null
  lastStatusChangeAt?: string | null
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

export interface DemandTemplate {
  id: string
  nome: string
  titulo: string
  descricao?: string | null
  prioridade?: DemandPriority | null
  tipo_demanda?: DemandCategory | null
  checklist_id?: string | null
  usuario_id?: string | null
  responsavel_id?: string | null
  departamento?: string | null
  data_criacao: string
}
