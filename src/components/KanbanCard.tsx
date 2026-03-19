import { Building, Phone, Mail } from 'lucide-react'
import { Lead } from '@/types/crm'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useLeadStore from '@/stores/useLeadStore'

interface KanbanCardProps {
  lead: Lead
}

export function KanbanCard({ lead }: KanbanCardProps) {
  const { updateTrainingStep } = useLeadStore()

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'

    // Add a slight opacity to original card
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('opacity-50')
      }
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50')
    }
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all duration-150 animate-fade-in-up"
    >
      <CardContent className="p-4 space-y-3">
        <div className="font-semibold text-base leading-tight text-foreground">{lead.name}</div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {lead.company && (
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lead.company}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
          {lead.email && !lead.phone && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
        </div>

        {lead.stage === 'treinamento' && (
          <div className="pt-2 border-t mt-2" onPointerDown={(e) => e.stopPropagation()}>
            <Tabs
              value={`etapa-${lead.trainingStep || 1}`}
              onValueChange={(val) =>
                updateTrainingStep(lead.id, parseInt(val.replace('etapa-', '')) as 1 | 2 | 3)
              }
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="etapa-1" className="text-xs px-1">
                  E1
                </TabsTrigger>
                <TabsTrigger value="etapa-2" className="text-xs px-1">
                  E2
                </TabsTrigger>
                <TabsTrigger value="etapa-3" className="text-xs px-1">
                  E3
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
