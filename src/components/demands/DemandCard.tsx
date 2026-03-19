import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '../ui/button'

interface Props {
  demand: Demand
}

export function DemandCard({ demand }: Props) {
  const { deleteDemand } = useDemandStore()
  const { role } = useAuthStore()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente':
        return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
      case 'Durante o Dia':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
    }
  }

  const isOverdue = new Date(demand.dueDate) < new Date() && demand.status !== 'Concluído'

  return (
    <Card className="hover:border-primary/50 transition-colors group relative bg-background">
      <CardContent className="p-3">
        {role === 'Admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              deleteDemand(demand.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2 pr-6">
            <h4 className="font-medium text-sm leading-tight text-foreground">{demand.title}</h4>
          </div>

          {demand.systemEscalated && demand.priority === 'Urgente' && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent w-fit flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-medium tracking-wide">
              <AlertTriangle className="w-3 h-3" />
              Escalada Automaticamente
            </Badge>
          )}

          <div className="flex flex-wrap gap-2 mt-0.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 h-4 font-medium ${getPriorityColor(demand.priority)}`}
            >
              {demand.priority}
            </Badge>
            <div
              className={`flex items-center text-[10px] font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(demand.dueDate), 'dd/MM')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
