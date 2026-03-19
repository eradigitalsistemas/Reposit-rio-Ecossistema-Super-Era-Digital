import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, Trash2 } from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
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
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      case 'Durante o Dia':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      default:
        return 'text-primary bg-primary/10 border-primary/20'
    }
  }

  let dueDateObj: Date | null = null
  let isOverdue = false
  let isValidDate = false

  try {
    if (demand.dueDate) {
      const parsed = parseISO(demand.dueDate)
      if (isValid(parsed)) {
        dueDateObj = parsed
        isValidDate = true
        isOverdue = dueDateObj < new Date() && demand.status !== 'Concluído'
      }
    }
  } catch (e) {
    console.error(`Error parsing date for demand ${demand.id}:`, e)
  }

  return (
    <Card className="hover:border-primary/50 transition-all duration-200 group relative bg-card border-border shadow-sm hover:shadow-[0_0_10px_rgba(34,197,94,0.1)]">
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
            title="Excluir demanda"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2 pr-6">
            <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2">
              {demand.title || 'Sem título'}
            </h4>
          </div>

          {!!demand.systemEscalated && demand.priority === 'Urgente' && (
            <Badge className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 w-fit flex items-center gap-1.5 px-2 py-0 h-5 text-[10px] font-medium tracking-wide transition-colors">
              <AlertTriangle className="w-3 h-3" />
              Escalada Automaticamente
            </Badge>
          )}

          <div className="flex flex-wrap gap-2 mt-0.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 h-4 font-medium transition-colors ${getPriorityColor(demand.priority)}`}
            >
              {demand.priority || 'Sem prioridade'}
            </Badge>
            {isValidDate && dueDateObj && (
              <div
                className={`flex items-center text-[10px] font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {format(dueDateObj, 'dd/MM')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
