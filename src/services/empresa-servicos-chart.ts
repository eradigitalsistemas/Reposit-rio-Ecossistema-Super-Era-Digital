import { supabase } from '@/lib/supabase/client'

export interface ServiceTypeItem {
  name: string
  value: number
  color: string
}

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
]

export async function fetchCompaniesByServiceType(): Promise<ServiceTypeItem[]> {
  const { data, error } = await supabase.from('clientes_externos').select('servicos')

  if (error) throw error

  const counts: Record<string, number> = {}

  for (const row of data || []) {
    const servicos = row.servicos
    let hasService = false

    if (Array.isArray(servicos) && servicos.length > 0) {
      for (const s of servicos) {
        const serviceName =
          typeof s === 'string'
            ? s
            : ((s as Record<string, unknown>)?.nome ?? (s as Record<string, unknown>)?.name ?? null)
        if (serviceName && typeof serviceName === 'string') {
          const trimmed = serviceName.trim()
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1
            hasService = true
          }
        }
      }
    }

    if (!hasService) {
      counts['Sem serviço'] = (counts['Sem serviço'] || 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}
