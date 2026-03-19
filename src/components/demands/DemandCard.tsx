import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User2, MessageSquare, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { DemandDetailsModal } from './DemandDetailsModal'
import { useState } from 'react'
import useDemandStore from '@/stores/useDemandStore'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'

interface DemandCardProps {
  demand: Demand
}

export function DemandCard({ demand }: DemandCardProps) {
  const [open, setOpen] = useState(false)
  const { acceptDemand } = useDemandStore()
  const { role } = useAuthStore()
  const { toast } = useToast()

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgente':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'Durante o Dia':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open modal if not clicking an action button inside the card
    const target = e.target as HTMLElement
    if (!target.closest('button')) {
      setOpen(true)
    }
  }

  return (
    <>
      <DemandDetailsModal open={open} onOpenChange={setOpen} demand={demand} />
      <Card
        onClick={handleCardClick}
        className="cursor-pointer hover:border-primary/50 transition-all duration-200 group border-border shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] overflow-hidden"
      >
        <CardContent className="p-4 sm:p-4 flex flex-col gap-3 relative">
          {demand.systemEscalated && (
            <div className="absolute top-0 right-0 -mr-6 mt-4 w-24 text-center rotate-45 text-[9px] font-bold tracking-widest text-white bg-red-600 shadow-md">
              ESCALADO
            </div>
          )}

          <div className="flex justify-between items-start gap-2 pr-8 sm:pr-6">
            <h4 className="font-semibold sm:font-medium text-base sm:text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
              {demand.title}
            </h4>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <Badge
              variant="outline"
              className={`text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 h-auto font-medium ${getPriorityColor(
                demand.priority,
              )}`}
            >
              {demand.priority === 'Urgente' && (
                <AlertCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1" />
              )}
              {demand.priority === 'Durante o Dia' && (
                <Clock className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1" />
              )}
              {demand.priority}
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between text-sm sm:text-xs text-muted-foreground w-full">
              <div className="flex items-center truncate max-w-[65%]">
                <User2 className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
                <span className="truncate">{demand.assignee}</span>
              </div>
              {demand.responses && demand.responses.length > 0 && (
                <div className="flex items-center shrink-0 ml-2">
                  <MessageSquare className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                  <span>{demand.responses.length}</span>
                </div>
              )}
            </div>

            {demand.dueDate && (
              <div className="flex items-center text-sm sm:text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
                <span>Vence em {format(new Date(demand.dueDate), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
