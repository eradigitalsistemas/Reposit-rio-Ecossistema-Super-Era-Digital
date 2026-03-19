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
    color: 'bg-slate-200 text-slate-800',
    bgColor: 'border-slate-200',
  },
  {
    id: 'prospeccao',
    title: 'Prospecção',
    color: 'bg-orange-500 text-white',
    bgColor: 'border-orange-500',
  },
  {
    id: 'convertido',
    title: 'Convertido',
    color: 'bg-indigo-500 text-white',
    bgColor: 'border-indigo-500',
  },
  {
    id: 'treinamento',
    title: 'Em Treinamento',
    color: 'bg-purple-500 text-white',
    bgColor: 'border-purple-500',
  },
  {
    id: 'finalizado',
    title: 'Finalizado',
    color: 'bg-emerald-500 text-white',
    bgColor: 'border-emerald-500',
  },
  {
    id: 'pos_venda',
    title: 'Pós Venda',
    color: 'bg-rose-500 text-white',
    bgColor: 'border-rose-500',
  },
  {
    id: 'ativo',
    title: 'Cliente Ativo',
    color: 'bg-sky-500 text-white',
    bgColor: 'border-sky-500',
  },
]
