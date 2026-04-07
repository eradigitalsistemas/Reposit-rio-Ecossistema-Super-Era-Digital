export type LeadStage =
  | 'novo_lead'
  | 'em_negociacao'
  | 'convertido'
  | 'encerrado'
  | 'ativo'
  | 'pos_venda'

export type InterestStatus = 'Interessado' | 'Não Interessado'

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  stage: LeadStage
  interestStatus: InterestStatus
  trainingStep?: 1 | 2 | 3
  createdAt: string
}

export interface StageConfig {
  id: LeadStage
  title: string
  color: string
  bgColor: string
}

export const KANBAN_STAGES: StageConfig[] = [
  {
    id: 'novo_lead',
    title: 'Novo Lead',
    color:
      'bg-zinc-100 text-black dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800',
    bgColor: 'border-zinc-300 dark:border-zinc-700',
  },
  {
    id: 'em_negociacao',
    title: 'Em Negociação',
    color:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    bgColor: 'border-purple-300 dark:border-purple-700/50',
  },
  {
    id: 'convertido',
    title: 'Convertido',
    color:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    bgColor: 'border-blue-300 dark:border-blue-700/50',
  },
  {
    id: 'encerrado',
    title: 'Encerrado',
    color:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50',
    bgColor: 'border-red-300 dark:border-red-700/50',
  },
  {
    id: 'ativo',
    title: 'Cliente Ativo',
    color:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/50',
    bgColor: 'border-green-300 dark:border-green-700/50',
  },
  {
    id: 'pos_venda',
    title: 'Pós-Venda',
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50',
    bgColor: 'border-orange-300 dark:border-orange-700/50',
  },
]
