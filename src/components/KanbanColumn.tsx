import { useState } from 'react'
import { StageConfig, Lead } from '@/types/crm'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'
import useLeadStore from '@/stores/useLeadStore'

interface KanbanColumnProps {
  stage: StageConfig
  leads: Lead[]
}

export function KanbanColumn({ stage, leads }: KanbanColumnProps) {
  const { moveLead } = useLeadStore()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      moveLead(leadId, stage.id)
    }
  }

  return (
    <div className="w-[85vw] sm:w-[300px] flex-shrink-0 flex flex-col h-full snap-center">
      <div
        className={cn(
          'px-4 py-3 rounded-t-lg font-semibold text-sm flex justify-between items-center',
          stage.color,
        )}
      >
        <span className="tracking-wide uppercase text-xs">{stage.title}</span>
        <Badge
          variant="secondary"
          className="bg-black/10 dark:bg-black/20 text-foreground hover:bg-black/20 dark:hover:bg-black/30 px-2 h-5 text-xs border-0 transition-colors"
        >
          {leads.length}
        </Badge>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex-1 bg-muted/50 border border-t-0 border-border rounded-b-lg p-3 overflow-y-auto space-y-3 transition-all duration-200 hide-scrollbar',
          isDragOver && 'bg-muted border-dashed border-2',
          isDragOver && stage.bgColor,
        )}
      >
        {leads.length === 0 ? (
          <div className="h-full flex items-center justify-center min-h-[100px]">
            <span className="text-sm text-muted-foreground text-center px-4 border border-dashed border-border rounded-md p-4 w-full">
              Arraste leads para cá
            </span>
          </div>
        ) : (
          leads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}
