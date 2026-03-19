import { Lead } from '@/types/crm'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone } from 'lucide-react'

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
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all duration-200 bg-card border-border shadow-sm hover:shadow-[0_0_10px_rgba(34,197,94,0.1)] relative group touch-manipulation"
    >
      <CardContent className="p-4 sm:p-3 flex flex-col gap-2.5 sm:gap-2">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold sm:font-medium text-base sm:text-sm text-foreground leading-tight">
            {lead.name}
          </h4>
          {lead.stage === 'ativo' && (
            <div className="h-2.5 w-2.5 sm:h-2 sm:w-2 mt-0.5 sm:mt-0 rounded-full bg-primary shadow-[0_0_5px_rgba(34,197,94,0.8)] shrink-0" />
          )}
        </div>

        {lead.company && (
          <div className="flex items-center text-sm sm:text-xs text-muted-foreground mt-0.5">
            <Building2 className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-1 sm:mt-1">
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
      </CardContent>
    </Card>
  )
}
