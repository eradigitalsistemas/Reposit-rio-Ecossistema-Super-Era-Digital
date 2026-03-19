export type LeadStage =
  | 'leads'
  | 'prospeccao'
  | 'convertido'
  | 'treinamento'
  | 'finalizado'
  | 'pos_venda'
  | 'ativo'

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  stage: LeadStage
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
    id: 'leads',
    title: 'Leads',
    color: 'bg-zinc-900 text-zinc-300 border border-zinc-800',
    bgColor: 'border-zinc-800',
  },
  {
    id: 'prospeccao',
    title: 'Prospecção',
    color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    bgColor: 'border-orange-500/50',
  },
  {
    id: 'convertido',
    title: 'Convertido',
    color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    bgColor: 'border-indigo-500/50',
  },
  {
    id: 'treinamento',
    title: 'Em Treinamento',
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    bgColor: 'border-purple-500/50',
  },
  {
    id: 'finalizado',
    title: 'Finalizado',
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    bgColor: 'border-emerald-500/50',
  },
  {
    id: 'pos_venda',
    title: 'Pós Venda',
    color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    bgColor: 'border-rose-500/50',
  },
  {
    id: 'ativo',
    title: 'Cliente Ativo',
    color: 'bg-primary/10 text-primary border border-primary/20',
    bgColor: 'border-primary/50',
  },
]
