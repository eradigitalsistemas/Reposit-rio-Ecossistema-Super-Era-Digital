import { useState } from 'react'
import { COLLABORATORS } from '@/types/demand'
import { DemandColumn } from '@/components/demands/DemandColumn'
import { AddDemandModal } from '@/components/demands/AddDemandModal'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FilterX } from 'lucide-react'
import { exportToCSV, exportToPDF } from '@/utils/export'

export default function Demands() {
  const { demands } = useDemandStore()
  const { role, userName } = useAuthStore()

  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  const baseDemands = role === 'Admin' ? demands : demands.filter((d) => d.assignee === userName)

  const filteredDemands = baseDemands.filter((d) => {
    if (role === 'Admin' && collaboratorFilter !== 'all' && d.assignee !== collaboratorFilter) {
      return false
    }
    if (statusFilter.length > 0 && !statusFilter.includes(d.status)) {
      return false
    }
    return true
  })

  const activeCollaborators =
    role === 'Admin'
      ? collaboratorFilter === 'all'
        ? COLLABORATORS
        : [collaboratorFilter]
      : [userName]

  const hasFilters = (role === 'Admin' && collaboratorFilter !== 'all') || statusFilter.length > 0

  const clearFilters = () => {
    setCollaboratorFilter('all')
    setStatusFilter([])
  }

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gestão de Demandas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {role === 'Admin'
                ? 'Acompanhe as tarefas e atribuições de toda a equipe'
                : 'Acompanhe suas tarefas e atribuições'}
            </p>
          </div>
          <AddDemandModal />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-6 bg-card p-4 rounded-xl border shrink-0">
          <div className="flex flex-wrap items-end gap-6 w-full lg:w-auto">
            {role === 'Admin' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Responsável
                </Label>
                <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                  <SelectTrigger className="w-full sm:w-[220px] bg-background">
                    <SelectValue placeholder="Todos os colaboradores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os colaboradores</SelectItem>
                    {COLLABORATORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </Label>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="bg-background rounded-md h-10 p-1 border justify-start flex-wrap sm:flex-nowrap"
              >
                <ToggleGroupItem
                  value="Pendente"
                  className="h-8 px-3 text-xs data-[state=on]:bg-slate-100 dark:data-[state=on]:bg-slate-800"
                >
                  Pendente
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Em Andamento"
                  className="h-8 px-3 text-xs data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 dark:data-[state=on]:bg-blue-900/20 dark:data-[state=on]:text-blue-400"
                >
                  Em Andamento
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Concluído"
                  className="h-8 px-3 text-xs data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-600 dark:data-[state=on]:bg-emerald-900/20 dark:data-[state=on]:text-emerald-400"
                >
                  Concluído
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 text-muted-foreground hover:text-foreground mb-[1px]"
              >
                <FilterX className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 bg-background border shadow-sm hover:bg-muted w-full lg:w-auto"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => exportToCSV(filteredDemands, `demandas_${Date.now()}.csv`)}
              >
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(filteredDemands)}>
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full items-start gap-4 pb-4 min-w-max">
            {activeCollaborators.map((collaborator) => (
              <DemandColumn
                key={collaborator}
                collaborator={collaborator}
                demands={filteredDemands.filter((d) => d.assignee === collaborator)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
