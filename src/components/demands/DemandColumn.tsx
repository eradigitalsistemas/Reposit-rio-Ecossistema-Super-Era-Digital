import { Demand } from '@/types/demand'
import { DemandCard } from './DemandCard'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  collaborator: string
  demands: Demand[]
}

export function DemandColumn({ collaborator, demands = [] }: Props) {
  return (
    <div className="flex flex-col h-full max-h-full w-[350px] shrink-0 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-border/50">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-semibold text-sm text-foreground truncate pr-2">
          {collaborator || 'Sem responsável'}
        </h3>
        <span className="bg-background text-foreground shadow-sm text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0">
          {demands.length}
        </span>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-3 pb-4">
          {demands.map((demand) => (
            <DemandCard key={demand.id} demand={demand} />
          ))}
          {demands.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
              Nenhuma demanda atribuída
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
