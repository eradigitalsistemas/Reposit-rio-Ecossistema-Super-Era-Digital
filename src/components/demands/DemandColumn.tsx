import { Demand } from '@/types/demand'
import { DemandCard } from './DemandCard'
import { Badge } from '@/components/ui/badge'

interface DemandColumnProps {
  title: string
  demands: Demand[]
  highlightId?: string | null
}

export function DemandColumn({ title, demands, highlightId }: DemandColumnProps) {
  return (
    <div className="flex flex-col shrink-0 min-w-[85vw] sm:min-w-[320px] max-w-[400px] bg-card rounded-xl border h-full snap-center shadow-sm overflow-hidden">
      <div className="p-4 border-b shrink-0 flex items-center justify-between bg-card z-10">
        <h3 className="font-semibold text-foreground text-lg sm:text-base tracking-tight">
          {title}
        </h3>
        <Badge variant="secondary" className="px-2 font-medium text-sm sm:text-xs bg-muted">
          {demands.length}
        </Badge>
      </div>
      <div className="flex-1 p-3 overflow-y-auto overflow-x-auto space-y-3 bg-muted/20 kanban-scrollbar min-h-0">
        {demands.length === 0 ? (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted rounded-lg m-2">
            <span className="text-sm text-muted-foreground font-medium">Sem demandas</span>
          </div>
        ) : (
          demands.map((demand) => (
            <div
              key={demand.id}
              id={`demand-card-${demand.id}`}
              className={
                highlightId === demand.id
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg transition-all duration-1000 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : 'transition-all duration-500'
              }
            >
              <DemandCard demand={demand} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
