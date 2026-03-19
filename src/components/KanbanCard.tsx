import { Lead } from '@/types/crm'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, Building, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'
import useLeadStore from '@/stores/useLeadStore'
import { Button } from './ui/button'

interface KanbanCardProps {
  lead: Lead
}

export function KanbanCard({ lead }: KanbanCardProps) {
  const { role } = useAuthStore()
  const { deleteLead } = useLeadStore()

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1'
    }
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors bg-background relative',
      )}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2 pr-6">
          <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-1">
            {lead.name}
          </h4>
        </div>

        {role === 'Admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              deleteLead(lead.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}

        <div className="space-y-1.5 mt-2">
          {lead.company && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Building className="w-3 h-3 mr-1.5 shrink-0" />
              <span className="truncate">{lead.company}</span>
            </div>
          )}
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail className="w-3 h-3 mr-1.5 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="w-3 h-3 mr-1.5 shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
