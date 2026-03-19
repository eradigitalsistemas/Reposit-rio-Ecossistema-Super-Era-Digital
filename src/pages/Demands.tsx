import { useState, useMemo } from 'react'
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
import { Download, FilterX, Columns } from 'lucide-react'
import { exportToCSV, exportToPDF } from '@/utils/export'
import { DemandStatus } from '@/types/demand'

export default function Demands() {
  const { demands, collaborators } = useDemandStore()
  const { role, userName } = useAuthStore()

  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  const activeColumns = useMemo(() => {
    if (statusFilter.length > 0) {
      return statusFilter as DemandStatus[]
    }
    return ['Pendente', 'Em Andamento', 'Concluído'] as DemandStatus[]
  }, [statusFilter])

  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      if (role !== 'Admin' && d.assignee !== userName && d.assignee !== 'Não Atribuído') {
        return false
      }
      if (role === 'Admin' && collaboratorFilter !== 'all' && d.assignee !== collaboratorFilter) {
        return false
      }
      return true
    })
  }, [demands, role, userName, collaboratorFilter])

  const hasFilters = (role === 'Admin' && collaboratorFilter !== 'all') || statusFilter.length > 0

  const clearFilters = () => {
    setCollaboratorFilter('all')
    setStatusFilter([])
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-slate-50/50 dark:bg-background overflow-hidden min-h-0">
      <div className="flex flex-col flex-1 p-4 sm:p-6 min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
          <div>
            <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-foreground">
              Gestão de Demandas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {role === 'Admin'
                ? 'Acompanhe as tarefas e atribuições de toda a equipe'
                : 'Acompanhe suas tarefas e atribuições no Kanban'}
            </p>
          </div>
          <div className="w-full sm:w-auto">{role === 'Admin' && <AddDemandModal />}</div>
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4 mb-6 bg-card p-4 rounded-xl border shrink-0">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4 sm:gap-6 w-full xl:w-auto">
            {role === 'Admin' && (
              <div className="space-y-2 w-full sm:w-auto">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Filtrar por Responsável
                </Label>
                <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                  <SelectTrigger className="w-full sm:w-[220px] bg-background h-11 sm:h-10">
                    <SelectValue placeholder="Todos os colaboradores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os colaboradores</SelectItem>
                    {collaborators.map((c) => (
                      <SelectItem key={c.id} value={c.nome}>
                        {c.nome}
                      </SelectItem>
                    ))}
                    <SelectItem value="Não Atribuído">Não Atribuído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Columns className="w-3 h-3" />
                Colunas Visíveis
              </Label>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="bg-background rounded-md min-h-[40px] p-1 border justify-start flex-wrap sm:flex-nowrap w-full"
              >
                <ToggleGroupItem
                  value="Pendente"
                  className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none data-[state=on]:bg-primary/20 data-[state=on]:text-primary border-transparent data-[state=on]:border-primary/30"
                >
                  Pendente
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Em Andamento"
                  className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-400 border-transparent data-[state=on]:border-blue-500/30"
                >
                  Em Andamento
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Concluído"
                  className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 border-transparent data-[state=on]:border-emerald-500/30"
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
                className="h-11 sm:h-10 text-muted-foreground hover:text-foreground w-full sm:w-auto mb-[1px]"
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
                className="gap-2 bg-background border shadow-sm hover:bg-muted w-full xl:w-auto"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[90vw] max-w-[220px] sm:w-56">
              <DropdownMenuItem
                onClick={() => exportToCSV(filteredDemands, `demandas_${Date.now()}.csv`)}
                className="min-h-[44px]"
              >
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportToPDF(filteredDemands)}
                className="min-h-[44px]"
              >
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar min-h-0">
          <div className="flex h-full items-start gap-4 min-w-max [&>div]:!w-[85vw] sm:[&>div]:!w-[320px] [&>div]:!max-w-[400px] [&>div]:snap-center pr-4 pb-4">
            {activeColumns.map((colName) => (
              <DemandColumn
                key={colName}
                title={colName}
                demands={filteredDemands.filter((d) => d.status === colName)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
