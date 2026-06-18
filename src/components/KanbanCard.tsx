import { Lead } from '@/types/crm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditLeadModal } from './EditLeadModal'
import { DeleteLeadAlert } from './DeleteLeadAlert'
import { NewInteractionModal } from './NewInteractionModal'
import { LeadHistorySheet } from './LeadHistorySheet'
import { WhatsAppChatSheet } from './WhatsAppChatSheet'
import React, { memo } from 'react'

interface KanbanCardProps {
  lead: Lead
}

export const KanbanCard = memo(function KanbanCard({ lead }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-[border-color,box-shadow,transform] duration-200 bg-card border-border shadow-md dark:shadow-sm hover:shadow-lg dark:hover:shadow-[0_0_10px_rgba(34,197,94,0.1)] relative group touch-manipulation will-change-transform"
    >
      <CardContent className="p-4 sm:p-3 pb-2 sm:pb-2 flex flex-col gap-2.5 sm:gap-2">
        <div className="flex justify-between items-start gap-2 w-full">
          <div className="flex items-start gap-2 w-full">
            {lead.stage === 'ativo' && (
              <div className="mt-1.5 sm:mt-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(34,197,94,0.8)] shrink-0" />
            )}
            <h4 className="font-bold sm:font-semibold text-base sm:text-sm text-card-foreground leading-snug break-words w-full pr-1">
              {lead.name}
            </h4>
          </div>
        </div>

        {lead.company && (
          <div className="flex items-center text-sm sm:text-xs text-foreground/80 dark:text-muted-foreground mt-0.5 font-medium">
            <Building2 className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0 opacity-70" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        {lead.address && (
          <div className="flex items-center text-sm sm:text-xs text-foreground/80 dark:text-muted-foreground font-medium">
            <MapPin className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0 opacity-70" />
            <span className="truncate">{lead.address}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-2 sm:mt-1.5">
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
              className="text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 sm:py-0 h-6 sm:h-4 bg-transparent text-foreground/70 dark:text-muted-foreground border-border group-hover:border-primary/30 transition-colors font-medium"
            >
              <Mail className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1 opacity-70" />
              Email
            </Badge>
          )}
          {lead.phone && (
            <Badge
              variant="outline"
              className="text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 sm:py-0 h-6 sm:h-4 bg-transparent text-foreground/70 dark:text-muted-foreground border-border group-hover:border-primary/30 transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1 opacity-70" />
              Telefone
            </Badge>
          )}
        </div>
      </CardContent>
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-t border-border/50 bg-muted/10 rounded-b-xl">
        <div className="flex-1">
          <NewInteractionModal lead={lead} />
        </div>
        <div className="flex items-center gap-1 shrink-0 bg-background rounded-md p-1 border border-border shadow-sm">
          <WhatsAppChatSheet lead={lead} />
          <LeadHistorySheet lead={lead} />
          <EditLeadModal lead={lead} />
          <DeleteLeadAlert lead={lead} />
        </div>
      </div>
    </Card>
  )
})
