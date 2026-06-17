import { Demand } from '@/types/demand'
import { DemandCard } from './DemandCard'
import { Badge } from '@/components/ui/badge'

import React, { memo } from 'react'

interface DemandColumnProps {
  title: string
  demands: Demand[]
  highlightId?: string | null
  onDropDemand?: (demandId: string, newStatus: string) => void
}

export const DemandColumn = memo(
  function DemandColumn({ title, demands, highlightId, onDropDemand }: DemandColumnProps) {
    return (
      <div
        className="flex flex-col shrink-0 min-w-[85vw] sm:min-w-[320px] max-w-[400px] bg-white/10 dark:bg-black/20 glass-optimized rounded-[12px] border border-white/20 h-fit snap-center shadow-lg transition-[background-color,border-color] data-[drag-over=true]:bg-white/20 data-[drag-over=true]:border-emerald-400/50 hardware-accelerated relative overflow-visible"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          e.currentTarget.setAttribute('data-drag-over', 'true')
        }}
        onDragLeave={(e) => {
          e.currentTarget.removeAttribute('data-drag-over')
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.removeAttribute('data-drag-over')
          const demandId = e.dataTransfer.getData('text/plain')
          if (demandId && onDropDemand) {
            onDropDemand(demandId, title)
          }
        }}
      >
        <div className="p-4 border-b border-white/10 shrink-0 flex items-center justify-between bg-white/5 dark:bg-black/10 z-10 sticky top-0 glass-optimized rounded-t-[11px]">
          <h3 className="font-semibold text-white text-lg sm:text-base tracking-tight">{title}</h3>
          <Badge
            variant="secondary"
            className="px-2 font-medium text-sm sm:text-xs text-emerald-950 bg-emerald-100/90 dark:bg-emerald-900/50 dark:text-emerald-100 border-none"
          >
            {(demands || []).length}
          </Badge>
        </div>
        <div className="p-3 space-y-3 bg-transparent">
          {!(demands && demands.length > 0) ? (
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/20 rounded-lg m-2 bg-white/5">
              <span className="text-sm text-white/60 font-medium">Sem demandas</span>
            </div>
          ) : (
            (demands || []).map((demand) => (
              <div
                key={demand.id}
                id={`demand-card-${demand.id}`}
                className={
                  highlightId === demand.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg transition-all duration-1000 shadow-[0_0_20px_rgba(34,197,94,0.4)] hardware-accelerated'
                    : 'transition-opacity duration-300 hardware-accelerated'
                }
              >
                <DemandCard demand={demand} />
              </div>
            ))
          )}
        </div>
      </div>
    )
  },
  (prev, next) => {
    return (
      prev.title === next.title &&
      prev.highlightId === next.highlightId &&
      prev.demands.length === next.demands.length &&
      prev.demands.every(
        (d, i) => d.id === next.demands[i]?.id && d.updatedAt === next.demands[i]?.updatedAt,
      )
    )
  },
)
