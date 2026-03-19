import { Demand } from '@/types/demand'
import { DemandCard } from './DemandCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DemandDetailsModal } from './DemandDetailsModal'

interface Props {
  title: string
  demands: Demand[]
}

export function DemandColumn({ title, demands = [] }: Props) {
  return (
    <div className="flex flex-col h-full max-h-full w-[350px] shrink-0 bg-zinc-950 rounded-xl border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground truncate pr-2">{title}</h3>
        <span className="bg-background text-foreground shadow-sm text-xs font-semibold px-2.5 py-0.5 rounded-full border border-border shrink-0">
          {demands.length}
        </span>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-3 pb-4">
          {demands.map((demand) => (
            <DemandDetailsModal key={demand.id} demand={demand}>
              <div className="cursor-pointer">
                <DemandCard demand={demand} />
              </div>
            </DemandDetailsModal>
          ))}
          {demands.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
              Nenhuma demanda neste status
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
