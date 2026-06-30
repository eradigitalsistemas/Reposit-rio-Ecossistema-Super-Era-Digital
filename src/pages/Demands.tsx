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
import { useDebounce } from '@/hooks/use-debounce'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DemandCard } from '@/components/demands/DemandCard'
import { ArchiveRestore, History } from 'lucide-react'
import { DemandDetailsModal } from '@/components/demands/DemandDetailsModal'
import { toast } from '@/hooks/use-toast'

export default function Demands() {
  const {
    demands,
    completedDemands,
    collaborators,
    updateStatus,
    isLoading,
    hasMore,
    isLoadingMore,
    loadMoreDemands,
    fetchCompletedDemands,
    loadMoreCompletedDemands,
    hasMoreCompleted,
    isLoadingCompleted,
    isLoadingMoreCompleted,
    fetchSingleDemand,
  } = useDemandStore()

  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    if (historyOpen && completedDemands.length === 0) {
      fetchCompletedDemands()
    }
  }, [historyOpen, completedDemands.length, fetchCompletedDemands])
  const { role, user } = useAuthStore()

  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [exactDateFilter, setExactDateFilter] = useState<Date | undefined>(undefined)
  const [clientsList, setClientsList] = useState<{ id: string; nome: string }[]>([])
  const [clientFilterOpen, setClientFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    supabase
      .from('clientes_externos')
      .select('id, nome')
      .order('nome')
      .then(({ data, error }) => {
        if (!error && data) setClientsList(data)
      })
      .catch(() => {
        // Silently handle
      })
  }, [])

  const [searchParams, setSearchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const urlDemandId = searchParams.get('id') || searchParams.get('highlight')

  const [selectedDemand, setSelectedDemand] = useState<any>(null)
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null)

  useEffect(() => {
    if (urlDemandId) {
      const existing =
        demands.find((d) => d.id === urlDemandId) ||
        completedDemands.find((d) => d.id === urlDemandId)

      if (existing) {
        setSelectedDemand(existing)
        setSelectedDemandId(urlDemandId)
      } else {
        fetchSingleDemand(urlDemandId).then((d) => {
          if (d) {
            setSelectedDemand(d)
            setSelectedDemandId(urlDemandId)
          } else {
            toast({
              title: 'Erro',
              description: 'Demanda não encontrada.',
              variant: 'destructive',
            })
            setSearchParams((prev) => {
              const newParams = new URLSearchParams(prev)
              newParams.delete('id')
              newParams.delete('highlight')
              return newParams
            })
          }
        })
      }
    } else {
      setSelectedDemand(null)
      setSelectedDemandId(null)
    }
  }, [urlDemandId, demands, completedDemands, fetchSingleDemand, setSearchParams])

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
    return ['Pendente', 'Em Andamento'] as DemandStatus[]
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

      if (exact && isValid(exact)) {
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

      if (debouncedSearchQuery.trim() !== '') {
        const q = debouncedSearchQuery.toLowerCase().trim()
        if (
          !d.protocolo?.toLowerCase().includes(q) &&
          !d.title?.toLowerCase().includes(q) &&
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
        if (!demand) return 0
        let latest = 0
        if (demand.updatedAt) {
          const t = new Date(demand.updatedAt).getTime()
          if (!isNaN(t)) latest = t
        } else if (demand.createdAt) {
          const t = new Date(demand.createdAt).getTime()
          if (!isNaN(t)) latest = t
        }

        if (demand.completedAt) {
          const comp = new Date(demand.completedAt).getTime()
          if (!isNaN(comp) && comp > latest) latest = comp
        }
        if (demand.logs && Array.isArray(demand.logs) && demand.logs.length > 0) {
          const logLatest = Math.max(
            ...demand.logs.map((l: any) => {
              if (l && l.createdAt) {
                const t = new Date(l.createdAt).getTime()
                return isNaN(t) ? 0 : t
              }
              return 0
            }),
          )
          if (!isNaN(logLatest) && logLatest > latest) latest = logLatest
        }
        return latest
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
    debouncedSearchQuery,
  ])

  const filteredCompletedDemands = useMemo(() => {
    let filtered = (completedDemands || []).filter((d) => {
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

      if (debouncedSearchQuery.trim() !== '') {
        const q = debouncedSearchQuery.toLowerCase().trim()
        if (
          !d.protocolo?.toLowerCase().includes(q) &&
          !d.title?.toLowerCase().includes(q) &&
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

        if (!matchesCreated && !matchesCompleted && !matchesUpdated && !matchesLogs) {
          return false
        }
      }

      return true
    })

    return filtered.sort((a, b) => {
      const getLatestDate = (demand: any) => {
        if (!demand) return 0
        let latest = 0
        if (demand.updatedAt) {
          const t = new Date(demand.updatedAt).getTime()
          if (!isNaN(t)) latest = t
        } else if (demand.createdAt) {
          const t = new Date(demand.createdAt).getTime()
          if (!isNaN(t)) latest = t
        }

        if (demand.completedAt) {
          const comp = new Date(demand.completedAt).getTime()
          if (!isNaN(comp) && comp > latest) latest = comp
        }
        if (demand.logs && Array.isArray(demand.logs) && demand.logs.length > 0) {
          const logLatest = Math.max(
            ...demand.logs.map((l: any) => {
              if (l && l.createdAt) {
                const t = new Date(l.createdAt).getTime()
                return isNaN(t) ? 0 : t
              }
              return 0
            }),
          )
          if (!isNaN(logLatest) && logLatest > latest) latest = logLatest
        }
        return latest
      }

      const timeA = getLatestDate(a)
      const timeB = getLatestDate(b)
      return timeB - timeA
    })
  }, [
    completedDemands,
    role,
    user?.id,
    collaboratorFilter,
    dateFilter,
    exactDateFilter,
    clientFilter,
    debouncedSearchQuery,
  ])

  const hasFilters =
    (role === 'Admin' && collaboratorFilter !== 'all') ||
    clientFilter !== 'all' ||
    (statusFilter && statusFilter.length > 0) ||
    dateFilter !== 'all' ||
    exactDateFilter !== undefined ||
    debouncedSearchQuery.trim() !== ''

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
    ;(filteredDemands || []).forEach((d) => {
      if (d?.status && cols[d.status]) cols[d.status].push(d)
    })
    return cols
  }, [filteredDemands, activeColumns])

  return (
    <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 text-foreground relative z-10 overflow-x-hidden">
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
                className="w-full sm:w-[200px] pl-9 h-10 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:ring-primary/50"
              />
            </div>
          </div>

          {role === 'Admin' && (
            <div className="space-y-2 w-full sm:w-auto relative z-20">
              <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                Responsável
              </Label>
              <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 bg-background/50 border-border/50 text-foreground shadow-sm focus:ring-primary/50 text-base md:text-sm">
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

          <div className="space-y-2 w-full sm:w-auto relative z-20 px-2 sm:px-0">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider block text-left">
              Cliente
            </Label>
            <Popover open={clientFilterOpen} onOpenChange={setClientFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientFilterOpen}
                  className="w-full sm:w-[220px] justify-between items-center h-10 bg-background/50 border-border/50 text-foreground shadow-sm focus-visible:ring-primary/50 text-base md:text-sm"
                >
                  <span className="truncate">
                    {clientFilter === 'all'
                      ? 'Todos os clientes'
                      : clientsList.find((c) => c.id === clientFilter)?.nome || 'Todos os clientes'}
                  </span>
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
                      {(clientsList || []).map((client) => (
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

          <div className="space-y-2 w-full sm:w-auto relative z-20 pointer-events-auto px-2 sm:px-0">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider block text-left">
              Período
            </Label>
            <Select
              value={dateFilter}
              onValueChange={setDateFilter}
              disabled={exactDateFilter !== undefined}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-10 bg-background/50 border-border/50 text-foreground shadow-sm disabled:opacity-50 focus:ring-primary/50 text-base md:text-sm">
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

          <div className="space-y-2 w-full sm:w-auto relative z-20 pointer-events-auto px-2 sm:px-0">
            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider block text-left">
              Data Específica
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-[160px] h-10 flex justify-start items-center gap-2 px-4 text-left font-normal bg-background/50 border-border/50 text-foreground shadow-sm focus-visible:ring-primary/50 text-base md:text-sm whitespace-nowrap overflow-hidden text-ellipsis',
                    !exactDateFilter && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">
                    {exactDateFilter && isValid(exactDateFilter)
                      ? format(exactDateFilter, 'dd/MM/yyyy')
                      : 'Selecionar data'}
                  </span>
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
              className="bg-background/50 h-10 rounded-md p-1 border border-border/50 justify-start flex-wrap sm:flex-nowrap w-full shadow-sm"
            >
              <ToggleGroupItem
                value="Pendente"
                className="h-8 px-3 text-xs flex-1 sm:flex-none text-muted-foreground hover:text-foreground data-[state=on]:bg-background/50 data-[state=on]:text-foreground data-[state=on]:shadow-sm border-transparent"
              >
                Pendente
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Em Andamento"
                className="h-8 px-3 text-xs flex-1 sm:flex-none text-muted-foreground hover:text-foreground data-[state=on]:bg-background/50 data-[state=on]:text-foreground data-[state=on]:shadow-sm border-transparent"
              >
                Em Andamento
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 text-muted-foreground hover:text-foreground w-full sm:w-auto"
            >
              <FilterX className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 w-full sm:w-auto bg-background/50 border-border/50 text-foreground shadow-sm transition-colors focus-visible:ring-primary/50"
              >
                <History className="w-4 h-4" />
                Histórico
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md lg:max-w-xl overflow-hidden flex flex-col p-0">
              <SheetHeader className="p-6 pb-2 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <ArchiveRestore className="w-5 h-5 text-muted-foreground" />
                  Demandas Concluídas
                </SheetTitle>
                <SheetDescription>
                  Histórico de tarefas finalizadas. Pesquise ou use os filtros principais para
                  refinar.
                </SheetDescription>
              </SheetHeader>
              {(() => {
                if (!(window as any)._DeferredHistoryList) {
                  ;(window as any)._DeferredHistoryList = function DeferredHistoryList({
                    historyOpen,
                    isLoadingCompleted,
                    completedDemands,
                    filteredCompletedDemands,
                    hasMoreCompleted,
                    loadMoreCompletedDemands,
                    isLoadingMoreCompleted,
                  }: any) {
                    const [render, setRender] = useState(false)

                    useEffect(() => {
                      if (historyOpen) {
                        const timer = setTimeout(() => setRender(true), 250)
                        return () => clearTimeout(timer)
                      } else {
                        setRender(false)
                      }
                    }, [historyOpen])

                    const grouped = useMemo(() => {
                      const groups: any = { Hoje: [], Ontem: [], 'Esta Semana': [], Anteriores: [] }
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const yesterday = new Date(today)
                      yesterday.setDate(yesterday.getDate() - 1)
                      const weekStart = new Date(today)
                      const day = weekStart.getDay()
                      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
                      weekStart.setDate(diff)

                      ;(filteredCompletedDemands || []).forEach((d: any) => {
                        if (!d.completedAt) {
                          groups.Anteriores.push(d)
                          return
                        }
                        const dDate = new Date(d.completedAt)
                        dDate.setHours(0, 0, 0, 0)
                        const dTime = dDate.getTime()

                        if (dTime === today.getTime()) groups.Hoje.push(d)
                        else if (dTime === yesterday.getTime()) groups.Ontem.push(d)
                        else if (dTime >= weekStart.getTime()) groups['Esta Semana'].push(d)
                        else groups.Anteriores.push(d)
                      })
                      return groups
                    }, [filteredCompletedDemands])

                    if (!render) {
                      return (
                        <div className="flex-1 p-6 flex items-center justify-center hardware-accelerated">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/50 transition-opacity duration-200"></div>
                        </div>
                      )
                    }

                    if (
                      isLoadingCompleted &&
                      (!completedDemands || completedDemands.length === 0)
                    ) {
                      return (
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 hardware-accelerated will-change-transform">
                          {[1, 2, 3].map((i) => (
                            <Skeleton
                              key={i}
                              className="h-32 w-full rounded-xl transition-[opacity,transform] duration-200"
                            />
                          ))}
                        </div>
                      )
                    }

                    if (!filteredCompletedDemands || filteredCompletedDemands.length === 0) {
                      return (
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center text-muted-foreground h-full hardware-accelerated transition-opacity duration-200">
                          <p>Nenhuma demanda concluída encontrada.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="flex-1 overflow-y-auto p-6 space-y-8 hardware-accelerated will-change-transform pb-24">
                        {Object.entries(grouped).map(([groupName, groupDemands]: [string, any]) => {
                          if (!groupDemands || groupDemands.length === 0) return null
                          return (
                            <div
                              key={groupName}
                              className="space-y-4 animate-fade-in-up duration-200"
                            >
                              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-background/95 backdrop-blur z-10 py-1.5 transition-colors duration-200">
                                {groupName}{' '}
                                <span className="text-xs ml-2 bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
                                  {groupDemands.length}
                                </span>
                              </h3>
                              <div className="space-y-3">
                                {groupDemands.map((demand: any) => (
                                  <div key={demand.id} className="animate-fade-in-up duration-200">
                                    <DemandCard demand={demand} onDropDemand={() => {}} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}

                        {hasMoreCompleted && (
                          <div className="pt-6 flex justify-center animate-fade-in-up duration-200">
                            <Button
                              variant="outline"
                              onClick={loadMoreCompletedDemands}
                              disabled={isLoadingMoreCompleted}
                              className="transition-[opacity,transform,background-color] duration-200 shadow-sm hover:shadow active:scale-95"
                            >
                              {isLoadingMoreCompleted ? 'Carregando...' : 'Carregar Mais Histórico'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  }
                }
                const Component = (window as any)._DeferredHistoryList
                return (
                  <Component
                    historyOpen={historyOpen}
                    isLoadingCompleted={isLoadingCompleted}
                    completedDemands={completedDemands}
                    filteredCompletedDemands={filteredCompletedDemands}
                    hasMoreCompleted={hasMoreCompleted}
                    loadMoreCompletedDemands={loadMoreCompletedDemands}
                    isLoadingMoreCompleted={isLoadingMoreCompleted}
                  />
                )
              })()}
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 w-full sm:w-auto bg-background/50 border-border/50 text-foreground shadow-sm transition-colors focus-visible:ring-primary/50"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[90vw] max-w-[220px] sm:w-56">
              <DropdownMenuItem
                onClick={() =>
                  exportToCSV(
                    [...(filteredDemands || []), ...(filteredCompletedDemands || [])],
                    `demandas_${Date.now()}.csv`,
                  )
                }
                className="min-h-[44px]"
              >
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  exportToPDF([...(filteredDemands || []), ...(filteredCompletedDemands || [])])
                }
                className="min-h-[44px]"
              >
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="w-full pb-12 flex-1">
        <div className="flex flex-col lg:flex-row items-start gap-4 w-full hardware-accelerated h-fit">
          {isLoading && (!demands || demands.length === 0)
            ? (activeColumns || []).map((colName) => (
                <div
                  key={colName || 'unknown'}
                  className="flex flex-col flex-1 w-full bg-white/10 dark:bg-black/20 glass-optimized rounded-[12px] border border-white/20 h-fit shadow-lg p-3 gap-3"
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
            : (activeColumns || []).filter(Boolean).map((colName) => (
                <DemandColumn
                  key={colName}
                  title={colName}
                  demands={columnsDemands[colName] || []}
                  highlightId={highlightId}
                  onDropDemand={(demandId, newStatus) => {
                    if (!demandId || !newStatus) return
                    const demand = demands.find((d) => d?.id === demandId)
                    if (demand && demand.status !== newStatus) {
                      updateStatus(demandId, newStatus as DemandStatus)
                    }
                  }}
                />
              ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6 sticky left-0 right-0">
            <Button
              variant="outline"
              onClick={loadMoreDemands}
              disabled={isLoadingMore}
              className="bg-card/80 backdrop-blur shadow-sm min-w-[200px]"
            >
              {isLoadingMore ? 'Carregando...' : 'Carregar mais demandas'}
            </Button>
          </div>
        )}
      </div>

      {selectedDemand && selectedDemandId && (
        <DemandDetailsModal
          demand={selectedDemand}
          demandId={selectedDemandId}
          open={!!selectedDemandId}
          isOpen={!!selectedDemandId}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev)
                newParams.delete('id')
                newParams.delete('highlight')
                return newParams
              })
            }
          }}
          onClose={() => {
            setSearchParams((prev) => {
              const newParams = new URLSearchParams(prev)
              newParams.delete('id')
              newParams.delete('highlight')
              return newParams
            })
          }}
        />
      )}
    </div>
  )
}
