import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MessageSquare } from 'lucide-react'
import { DemandDetailsModal } from './DemandDetailsModal'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  demand: Demand
}

export function DemandCard({ demand }: Props) {
  const priorityColors = {
    Urgente: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-transparent',
    'Durante o Dia':
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-transparent',
    'Pode Ficar para Amanhã':
      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-transparent',
  }

  const statusColors = {
    Pendente: 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400',
    'Em Andamento':
      'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-900/20',
    Concluído:
      'border-emerald-200 text-emerald-600 bg-emerald-50/50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/20',
  }

  return (
    <DemandDetailsModal demand={demand}>
      <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {demand.title}
            </h4>
            <Badge
              variant="outline"
              className={cn('whitespace-nowrap shrink-0', statusColors[demand.status])}
            >
              {demand.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{demand.description}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge
              className={cn(
                'hover:opacity-80 transition-opacity font-medium',
                priorityColors[demand.priority],
              )}
            >
              {demand.priority}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{format(new Date(demand.dueDate), 'dd/MM/yyyy')}</span>
            </div>
            {demand.responses.length > 0 && (
              <div className="flex items-center gap-1.5 text-primary/70 font-medium bg-primary/10 px-2 py-0.5 rounded-md">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{demand.responses.length}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DemandDetailsModal>
  )
}
