import { Lead } from '@/types/crm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditLeadModal } from './EditLeadModal'
import { DeleteLeadAlert } from './DeleteLeadAlert'
import { NewInteractionModal } from './NewInteractionModal'
import { LeadHistorySheet } from './LeadHistorySheet'

interface KanbanCardProps {
  lead: Lead
}

export function KanbanCard({ lead }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all duration-200 bg-card border-border shadow-sm hover:shadow-md dark:hover:shadow-[0_0_10px_rgba(34,197,94,0.1)] relative group touch-manipulation"
    >
      <CardContent className="p-4 sm:p-3 flex flex-col gap-2.5 sm:gap-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2">
            {lead.stage === 'ativo' && (
              <div className="mt-1.5 sm:mt-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(34,197,94,0.8)] shrink-0" />
            )}
            <h4 className="font-semibold sm:font-medium text-base sm:text-sm text-card-foreground leading-tight pr-24 sm:pr-24">
              {lead.name}
            </h4>
          </div>
          {/* Always visible icons with muted styling, highlighting on hover */}
          <div className="flex items-center gap-0.5 absolute right-2 top-2 sm:right-1.5 sm:top-1.5 bg-background/90 backdrop-blur-sm rounded-md px-1 z-10 border border-border shadow-sm">
            <LeadHistorySheet lead={lead} />
            <EditLeadModal lead={lead} />
            <DeleteLeadAlert lead={lead} />
          </div>
        </div>

        {lead.company && (
          <div className="flex items-center text-sm sm:text-xs text-muted-foreground mt-0.5">
            <Building2 className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        {lead.address && (
          <div className="flex items-center text-sm sm:text-xs text-muted-foreground">
            <MapPin className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
            <span className="truncate">{lead.address}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-1 sm:mt-1">
          <Badge
            variant="default"
            className={cn(
              'text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 sm:py-0 h-6 sm:h-4 transition-colors font-semibold border-0 shadow-none hover:opacity-90',
              lead.interestStatus === 'Não Interessado'
                ? 'bg-red-600 text-white'
                : 'bg-green-600 text-white',
            )}
          >
            {lead.interestStatus || 'Interessado'}
          </Badge>
          {lead.email && (
            <Badge
              variant="outline"
              className="text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 sm:py-0 h-6 sm:h-4 bg-transparent text-muted-foreground border-border group-hover:border-primary/30 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1" />
              Email
            </Badge>
          )}
          {lead.phone && (
            <Badge
              variant="outline"
              className="text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 sm:py-0 h-6 sm:h-4 bg-transparent text-muted-foreground border-border group-hover:border-primary/30 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1" />
              Telefone
            </Badge>
          )}
        </div>

        <NewInteractionModal lead={lead} />
      </CardContent>
    </Card>
  )
}
