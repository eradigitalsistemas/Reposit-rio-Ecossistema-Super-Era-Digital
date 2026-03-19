import { COLLABORATORS } from '@/types/demand'
import { DemandColumn } from '@/components/demands/DemandColumn'
import { AddDemandModal } from '@/components/demands/AddDemandModal'
import useDemandStore from '@/stores/useDemandStore'

export default function Demands() {
  const { demands } = useDemandStore()

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestão de Demandas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe as tarefas e atribuições de toda a equipe
            </p>
          </div>
          <AddDemandModal />
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full items-start gap-4 pb-4 min-w-max">
            {COLLABORATORS.map((collaborator) => (
              <DemandColumn
                key={collaborator}
                collaborator={collaborator}
                demands={demands.filter((d) => d.assignee === collaborator)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
