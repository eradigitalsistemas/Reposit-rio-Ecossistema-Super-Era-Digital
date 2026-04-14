import { useState, useMemo, useEffect } from 'react'
import { isToday, isThisWeek, isThisMonth, parseISO, format, isValid } from 'date-fns'
import { DemandColumn } from '@/components/demands/DemandColumn'
import { AddDemandModal } from '@/components/demands/AddDemandModal'
import { ChecklistBuilderModal } from '@/components/demands/ChecklistBuilderModal'
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
import { Download, FilterX, Columns, CalendarIcon } from 'lucide-react'
import { exportToCSV, exportToPDF } from '@/utils/export'
import { DemandStatus } from '@/types/demand'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'

export default function Demands() {
  const { demands, collaborators } = useDemandStore()
  const { role, user } = useAuthStore()

  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [exactDateFilter, setExactDateFilter] = useState<Date | undefined>(undefined)
  const [clientsList, setClientsList] = useState<{ id: string; nome: string }[]>([])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase
        .from('clientes_externos')
        .select('id, nome')
        .order('nome')
        .then(({ data }) => {
          if (data) setClientsList(data)
        })
    })
  }, [])

  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')

  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        try {
          const el = document.getElementById(`demand-card-${highlightId}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        } catch (e) {
          // ignorar erro de rolagem
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [highlightId])

  const activeColumns = useMemo(() => {
    if (statusFilter && statusFilter.length > 0) {
      return statusFilter as DemandStatus[]
    }
    return ['Pendente', 'Em Andamento', 'Concluído'] as DemandStatus[]
  }, [statusFilter])

  const filteredDemands = useMemo(() => {
    let filtered = (demands || []).filter((d) => {
      if (!d) return false

      if (role !== 'Admin' && d.assigneeId !== user?.id) {
        return false
      }
      if (role === 'Admin' && collaboratorFilter !== 'all' && d.assignee !== collaboratorFilter) {
        return false
      }
      if (clientFilter !== 'all' && d.clientId !== clientFilter) {
        return false
      }
      if (exactDateFilter && d.createdAt) {
        try {
          const date = parseISO(d.createdAt)
          if (!isValid(date)) return false

          if (
            date.getDate() !== exactDateFilter.getDate() ||
            date.getMonth() !== exactDateFilter.getMonth() ||
            date.getFullYear() !== exactDateFilter.getFullYear()
          ) {
            return false
          }
        } catch (e) {
          return false
        }
      } else if (dateFilter !== 'all' && d.createdAt) {
        try {
          const date = parseISO(d.createdAt)
          if (!isValid(date)) return false

          if (dateFilter === 'today' && !isToday(date)) return false
          if (dateFilter === 'week' && !isThisWeek(date)) return false
          if (dateFilter === 'month' && !isThisMonth(date)) return false
        } catch (e) {
          return false
        }
      }
      return true
    })

    return filtered.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA)
    })
  }, [demands, role, user?.id, collaboratorFilter, dateFilter, exactDateFilter, clientFilter])

  const hasFilters =
    (role === 'Admin' && collaboratorFilter !== 'all') ||
    clientFilter !== 'all' ||
    (statusFilter && statusFilter.length > 0) ||
    dateFilter !== 'all' ||
    exactDateFilter !== undefined

  const clearFilters = () => {
    setCollaboratorFilter('all')
    setClientFilter('all')
    setStatusFilter([])
    setDateFilter('all')
    setExactDateFilter(undefined)
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-background min-h-full">
      <div className="flex flex-col flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
          <div>
            <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-foreground">
              Gestão de Demandas
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground text-sm mt-1">
              {role === 'Admin'
                ? 'Acompanhe as tarefas e atribuições de toda a equipe'
                : 'Acompanhe suas tarefas e atribuições no Kanban'}
            </p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            {role === 'Admin' && (
              <>
                <ChecklistBuilderModal />
                <AddDemandModal />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4 mb-6 bg-white dark:bg-card border-gray-300 dark:border-border p-4 rounded-xl border shadow-md dark:shadow-sm shrink-0">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4 sm:gap-6 w-full xl:w-auto relative z-20">
            {role === 'Admin' && (
              <div className="space-y-2 w-full sm:w-auto relative z-20">
                <Label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wider">
                  Responsável
                </Label>
                <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10 bg-white dark:bg-background border-gray-300 dark:border-input text-gray-900 dark:text-foreground shadow-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {(collaborators || []).map((c) => (
                      <SelectItem key={c.id} value={c.nome}>
                        {c.nome}
                      </SelectItem>
                    ))}
                    <SelectItem value="Não Atribuído">Não Atribuído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 w-full sm:w-auto relative z-20">
              <Label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wider">
                Cliente
              </Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10 bg-white dark:bg-background border-gray-300 dark:border-input text-gray-900 dark:text-foreground shadow-sm">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {(clientsList || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full sm:w-auto relative z-20 pointer-events-auto">
              <Label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wider">
                Período
              </Label>
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
                disabled={exactDateFilter !== undefined}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-11 sm:h-10 bg-white dark:bg-background border-gray-300 dark:border-input text-gray-900 dark:text-foreground shadow-sm disabled:opacity-50">
                  <SelectValue placeholder="Qualquer data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer data</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full sm:w-auto relative z-20 pointer-events-auto">
              <Label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wider">
                Data Específica
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full sm:w-[160px] h-11 sm:h-10 justify-start text-left font-normal bg-white dark:bg-background border-gray-300 dark:border-input text-gray-900 dark:text-foreground shadow-sm',
                      !exactDateFilter && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exactDateFilter && isValid(exactDateFilter)
                      ? format(exactDateFilter, 'dd/MM/yyyy')
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={exactDateFilter}
                    onSelect={setExactDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-xs font-semibold text-gray-700 dark:text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Columns className="w-3 h-3" />
                Colunas Visíveis
              </Label>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val || [])}
                className="bg-gray-100 dark:bg-muted/50 rounded-md min-h-[40px] p-1 border border-gray-300 dark:border-border justify-start flex-wrap sm:flex-nowrap w-full shadow-sm"
              >
                <ToggleGroupItem
                  value="Pendente"
                  className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none text-gray-600 dark:text-muted-foreground data-[state=on]:bg-white dark:data-[state=on]:bg-background data-[state=on]:text-gray-900 dark:data-[state=on]:text-foreground data-[state=on]:shadow border-transparent data-[state=on]:border-gray-200 dark:data-[state=on]:border-transparent"
                >
                  Pendente
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Em Andamento"
                  className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none text-gray-600 dark:text-muted-foreground data-[state=on]:bg-white dark:data-[state=on]:bg-background data-[state=on]:text-gray-900 dark:data-[state=on]:text-foreground data-[state=on]:shadow border-transparent data-[state=on]:border-gray-200 dark:data-[state=on]:border-transparent"
                >
                  Em Andamento
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Concluído"
                  className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none text-gray-600 dark:text-muted-foreground data-[state=on]:bg-white dark:data-[state=on]:bg-background data-[state=on]:text-gray-900 dark:data-[state=on]:text-foreground data-[state=on]:shadow border-transparent data-[state=on]:border-gray-200 dark:data-[state=on]:border-transparent"
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
                variant="outline"
                className="gap-2 w-full xl:w-auto bg-white dark:bg-background border-gray-300 dark:border-input text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent shadow-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[90vw] max-w-[220px] sm:w-56">
              <DropdownMenuItem
                onClick={() => exportToCSV(filteredDemands || [], `demandas_${Date.now()}.csv`)}
                className="min-h-[44px]"
              >
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportToPDF(filteredDemands || [])}
                className="min-h-[44px]"
              >
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4">
          <div className="flex items-start gap-4 min-w-max [&>div]:!w-[85vw] sm:[&>div]:!w-[320px] [&>div]:!max-w-[400px] [&>div]:snap-center pr-4">
            {(activeColumns || []).map((colName) => (
              <DemandColumn
                key={colName}
                title={colName}
                demands={(filteredDemands || []).filter((d) => d?.status === colName)}
                highlightId={highlightId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
