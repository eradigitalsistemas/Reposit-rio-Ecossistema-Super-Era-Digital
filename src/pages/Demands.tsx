import { useState, useMemo, useEffect } from 'react'
import { isToday, isThisWeek, isThisMonth, parseISO, format, isValid } from 'date-fns'
import { DemandColumn } from '@/components/demands/DemandColumn'
import { AddDemandModal } from '@/components/demands/AddDemandModal'
import { ChecklistBuilderModal } from '@/components/demands/ChecklistBuilderModal'
import { DemandTemplateBuilderModal } from '@/components/demands/DemandTemplateBuilderModal'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import {
  Download,
  FilterX,
  Columns,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Search,
} from 'lucide-react'
import { exportToCSV, exportToPDF } from '@/utils/export'
import { DemandStatus } from '@/types/demand'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

export default function Demands() {
  const { demands, collaborators, updateStatus, isLoading } = useDemandStore()
  const { role, user } = useAuthStore()

  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [exactDateFilter, setExactDateFilter] = useState<Date | undefined>(undefined)
  const [clientsList, setClientsList] = useState<{ id: string; nome: string }[]>([])
  const [clientFilterOpen, setClientFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    supabase
      .from('clientes_externos')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => {
        if (data) setClientsList(data)
      })
  }, [])

  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')

  useEffect(() => {
    const protocoloParam = searchParams.get('protocolo')
    if (protocoloParam) {
      setCollaboratorFilter('all')
      setClientFilter('all')
      setStatusFilter([])
      setDateFilter('all')
      setExactDateFilter(undefined)
      setSearchQuery(protocoloParam)
    }
  }, [searchParams.get('protocolo')])

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

  const matchDate = (
    dateToTestStr: string | null | undefined,
    exact: Date | undefined,
    filter: string,
  ) => {
    if (!dateToTestStr) return false
    try {
      const date = parseISO(dateToTestStr)
      if (!isValid(date)) return false

      if (exact) {
        return (
          date.getDate() === exact.getDate() &&
          date.getMonth() === exact.getMonth() &&
          date.getFullYear() === exact.getFullYear()
        )
      } else if (filter !== 'all') {
        if (filter === 'today' && isToday(date)) return true
        if (filter === 'week' && isThisWeek(date)) return true
        if (filter === 'month' && isThisMonth(date)) return true
      }
    } catch (e) {
      return false
    }
    return false
  }

  const filteredDemands = useMemo(() => {
    let filtered = (demands || []).filter((d) => {
      if (!d) return false

      if (role !== 'Admin' && d.assigneeId !== user?.id) {
        return false
      }
      if (role === 'Admin' && collaboratorFilter !== 'all') {
        if (collaboratorFilter === 'Não Atribuído' || collaboratorFilter === 'unassigned') {
          if (d.assigneeId !== null) return false
        } else {
          if (d.assigneeId !== collaboratorFilter) return false
        }
      }
      if (clientFilter !== 'all' && d.clientId !== clientFilter) {
        return false
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim()
        if (
          !d.protocolo?.toLowerCase().includes(q) &&
          !d.title.toLowerCase().includes(q) &&
          !d.clientName?.toLowerCase().includes(q)
        ) {
          return false
        }
      }

      if (exactDateFilter || dateFilter !== 'all') {
        const matchesCreated = matchDate(d.createdAt, exactDateFilter, dateFilter)
        const matchesCompleted = matchDate(d.completedAt, exactDateFilter, dateFilter)
        const matchesUpdated = matchDate(d.updatedAt, exactDateFilter, dateFilter)
        const matchesLogs = (d.logs || []).some((l) =>
          matchDate(l.createdAt, exactDateFilter, dateFilter),
        )

        const isActive = d.status === 'Pendente' || d.status === 'Em Andamento'
        let matchesActive = false

        if (isActive) {
          try {
            const createdDate = d.createdAt ? parseISO(d.createdAt) : new Date()
            if (isValid(createdDate)) {
              if (exactDateFilter) {
                const exactEnd = new Date(exactDateFilter)
                exactEnd.setHours(23, 59, 59, 999)
                if (createdDate <= exactEnd) {
                  matchesActive = true
                }
              } else {
                matchesActive = true
              }
            }
          } catch (e) {
            // ignore
          }
        }

        if (
          !matchesCreated &&
          !matchesCompleted &&
          !matchesUpdated &&
          !matchesLogs &&
          !matchesActive
        ) {
          return false
        }
      }

      return true
    })

    return filtered.sort((a, b) => {
      const getLatestDate = (demand: any) => {
        let latest = demand.updatedAt
          ? new Date(demand.updatedAt).getTime()
          : demand.createdAt
            ? new Date(demand.createdAt).getTime()
            : 0

        if (demand.completedAt) {
          const comp = new Date(demand.completedAt).getTime()
          if (!isNaN(comp) && comp > latest) latest = comp
        }
        if (demand.logs && demand.logs.length > 0) {
          const logLatest = Math.max(
            ...demand.logs.map((l: any) => (l.createdAt ? new Date(l.createdAt).getTime() : 0)),
          )
          if (!isNaN(logLatest) && logLatest > latest) latest = logLatest
        }
        return isNaN(latest) ? 0 : latest
      }

      const timeA = getLatestDate(a)
      const timeB = getLatestDate(b)
      return timeB - timeA
    })
  }, [
    demands,
    role,
    user?.id,
    collaboratorFilter,
    dateFilter,
    exactDateFilter,
    clientFilter,
    searchQuery,
  ])

  const hasFilters =
    (role === 'Admin' && collaboratorFilter !== 'all') ||
    clientFilter !== 'all' ||
    (statusFilter && statusFilter.length > 0) ||
    dateFilter !== 'all' ||
    exactDateFilter !== undefined ||
    searchQuery.trim() !== ''

  const clearFilters = () => {
    setCollaboratorFilter('all')
    setClientFilter('all')
    setStatusFilter([])
    setDateFilter('all')
    setExactDateFilter(undefined)
    setSearchQuery('')
  }

  const columnsDemands = useMemo(() => {
    const cols: Record<string, typeof filteredDemands> = {}
    activeColumns.forEach((col) => (cols[col] = []))
    filteredDemands.forEach((d) => {
      if (cols[d.status]) cols[d.status].push(d)
    })
    return cols
  }, [filteredDemands, activeColumns])

  return (
    <div className="min-h-screen w-fit min-w-full flex flex-col flex-1 p-4 sm:p-6 text-foreground relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold tracking-tight drop-shadow-sm text-foreground">
            Gestão de Demandas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {role === 'Admin'
              ? 'Acompanhe as tarefas e atribuições de toda a equipe'
              : 'Acompanhe suas tarefas e atribuições no Kanban'}
          </p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
          {role === 'Admin' && (
            <>
              <DemandTemplateBuilderModal />
              <ChecklistBuilderModal />
              <AddDemandModal />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4 mb-6 bg-card/60 border border-border/50 p-4 rounded-xl shadow-sm shrink-0 hardware-accelerated backdrop-blur-sm w-full">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4 sm:gap-6 w-full xl:w-auto relative z-20">
          <div className="space-y-2 w-full sm:w-auto relative z-20">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Buscar
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Protocolo, título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[200px] pl-9 h-11 sm:h-10 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:ring-primary/50"
              />
            </div>
          </div>

          {role === 'Admin' && (
            <div className="space-y-2 w-full sm:w-auto relative z-20">
              <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                Responsável
              </Label>
              <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10 bg-background/50 border-border/50 text-foreground shadow-sm focus:ring-primary/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  {(collaborators || []).map((c) => (
                    <SelectItem key={c.id} value={c.id || Math.random().toString()}>
                      {c.nome || 'Sem Nome'}
                    </SelectItem>
                  ))}
                  <SelectItem value="unassigned">Não Atribuído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 w-full sm:w-auto relative z-20">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Cliente
            </Label>
            <Popover open={clientFilterOpen} onOpenChange={setClientFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientFilterOpen}
                  className="w-full sm:w-[220px] justify-between h-11 sm:h-10 bg-background/50 border-border/50 text-foreground shadow-sm focus-visible:ring-primary/50"
                >
                  {clientFilter === 'all'
                    ? 'Todos os clientes'
                    : clientsList.find((c) => c.id === clientFilter)?.nome || 'Todos os clientes'}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm">
                      Nenhum cliente encontrado.
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        key="all"
                        value="todos os clientes"
                        onSelect={() => {
                          setClientFilter('all')
                          setClientFilterOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            clientFilter === 'all' ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        Todos os clientes
                      </CommandItem>
                      {clientsList.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.nome}
                          onSelect={() => {
                            setClientFilter(client.id)
                            setClientFilterOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              clientFilter === client.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {client.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 w-full sm:w-auto relative z-20 pointer-events-auto">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Período
            </Label>
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
              disabled={exactDateFilter !== undefined}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-11 sm:h-10 bg-background/50 border-border/50 text-foreground shadow-sm disabled:opacity-50 focus:ring-primary/50">
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
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              Data Específica
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-[160px] h-11 sm:h-10 justify-start text-left font-normal bg-background/50 border-border/50 text-foreground shadow-sm focus-visible:ring-primary/50',
                    !exactDateFilter && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
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
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider flex items-center gap-1">
              <Columns className="w-3 h-3" />
              Colunas Visíveis
            </Label>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val || [])}
              className="bg-background/20 rounded-md min-h-[40px] p-1 border border-border/50 justify-start flex-wrap sm:flex-nowrap w-full shadow-inner"
            >
              <ToggleGroupItem
                value="Pendente"
                className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none text-muted-foreground hover:text-foreground data-[state=on]:bg-background/50 data-[state=on]:text-foreground data-[state=on]:shadow-sm border-transparent"
              >
                Pendente
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Em Andamento"
                className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none text-muted-foreground hover:text-foreground data-[state=on]:bg-background/50 data-[state=on]:text-foreground data-[state=on]:shadow-sm border-transparent"
              >
                Em Andamento
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Concluído"
                className="h-10 sm:h-8 px-3 text-sm sm:text-xs flex-1 sm:flex-none text-muted-foreground hover:text-foreground data-[state=on]:bg-background/50 data-[state=on]:text-foreground data-[state=on]:shadow-sm border-transparent"
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
              className="gap-2 w-full xl:w-auto bg-background/50 border-border/50 text-foreground shadow-sm transition-colors focus-visible:ring-primary/50"
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

      <div className="w-full pb-12 flex-1">
        <div className="flex items-start gap-4 min-w-max pr-4 hardware-accelerated h-fit">
          {isLoading && demands.length === 0
            ? (activeColumns || []).map((colName) => (
                <div
                  key={colName}
                  className="flex flex-col shrink-0 w-[85vw] sm:w-[320px] lg:w-[350px] bg-white/10 dark:bg-black/20 glass-optimized rounded-[12px] border border-white/20 h-fit shadow-lg p-3 gap-3"
                >
                  <div className="flex justify-between items-center mb-2 px-1">
                    <Skeleton className="h-5 w-24 bg-white/20" />
                    <Skeleton className="h-5 w-8 rounded-full bg-white/20" />
                  </div>
                  <Skeleton className="h-[140px] w-full rounded-xl bg-white/10" />
                  <Skeleton className="h-[140px] w-full rounded-xl bg-white/10" />
                  <Skeleton className="h-[140px] w-full rounded-xl bg-white/10" />
                </div>
              ))
            : (activeColumns || []).map((colName) => (
                <DemandColumn
                  key={colName}
                  title={colName}
                  demands={columnsDemands[colName] || []}
                  highlightId={highlightId}
                  onDropDemand={(demandId, newStatus) => {
                    const demand = demands.find((d) => d.id === demandId)
                    if (demand && demand.status !== newStatus) {
                      updateStatus(demandId, newStatus as DemandStatus)
                    }
                  }}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
