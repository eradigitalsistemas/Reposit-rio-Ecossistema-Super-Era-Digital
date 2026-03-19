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
      className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all duration-200 bg-card border-border shadow-sm hover:shadow-[0_0_10px_rgba(34,197,94,0.1)] relative group"
    >
      <CardContent className="p-3 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm text-foreground leading-tight">{lead.name}</h4>
          {lead.stage === 'ativo' && (
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
          )}
        </div>

        {lead.company && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Building2 className="w-3 h-3 mr-1" />
            {lead.company}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {lead.email && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 h-4 bg-transparent text-muted-foreground border-border group-hover:border-primary/30 transition-colors"
            >
              <Mail className="w-3 h-3 mr-1" />
              Email
            </Badge>
          )}
          {lead.phone && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 h-4 bg-transparent text-muted-foreground border-border group-hover:border-primary/30 transition-colors"
            >
              <Phone className="w-3 h-3 mr-1" />
              Telefone
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
