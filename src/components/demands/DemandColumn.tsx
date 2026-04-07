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
    <div className="flex flex-col shrink-0 min-w-[85vw] sm:min-w-[320px] max-w-[400px] bg-gray-50/80 dark:bg-[rgba(255,255,255,0.02)] rounded-xl border border-gray-300 dark:border-white/10 h-fit snap-center shadow-sm dark:shadow-subtle overflow-hidden">
      <div className="p-4 border-b border-gray-300 dark:border-white/10 shrink-0 flex items-center justify-between bg-gray-100/50 dark:bg-black/20 z-10 sticky top-0 backdrop-blur-md">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg sm:text-base tracking-tight">
          {title}
        </h3>
        <Badge
          variant="secondary"
          className="px-2 font-medium text-sm sm:text-xs text-gray-700 bg-gray-200 dark:bg-secondary dark:text-secondary-foreground"
        >
          {demands.length}
        </Badge>
      </div>
      <div className="p-3 space-y-3 bg-transparent">
        {demands.length === 0 ? (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-white/10 rounded-lg m-2">
            <span className="text-sm text-gray-500 dark:text-white/40 font-medium">
              Sem demandas
            </span>
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
