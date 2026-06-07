import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format, differenceInSeconds, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, FilterX, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export function DemandProductivityReport() {
  const [demands, setDemands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [collaborators, setCollaborators] = useState<any[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [collabsRes, demandsRes] = await Promise.all([
        supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome'),
        supabase
          .from('demandas')
          .select(
            'id, protocolo, titulo, descricao, status, data_criacao, data_conclusao, data_atualizacao, responsavel_id, responsavel:usuarios!demandas_responsavel_id_fkey(nome), resposta',
          )
          .order('data_criacao', { ascending: false }),
      ])

      if (collabsRes.data) setCollaborators(collabsRes.data)
      if (demandsRes.data) setDemands(demandsRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (start: string, end: string) => {
    const diffSeconds = Math.max(0, differenceInSeconds(parseISO(end), parseISO(start)))
    const hours = Math.floor(diffSeconds / 3600)
    const minutes = Math.floor((diffSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      if (assigneeId !== 'all' && d.responsavel_id !== assigneeId) return false
      if (search) {
        const q = search.toLowerCase()
        if (!d.protocolo?.toLowerCase().includes(q) && !d.titulo?.toLowerCase().includes(q))
          return false
      }
      if (dateFrom) {
        if (new Date(d.data_criacao) < dateFrom) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (new Date(d.data_criacao) > to) return false
      }
      return true
    })
  }, [demands, assigneeId, search, dateFrom, dateTo])

  const avgTime =
    filteredDemands.length > 0
      ? filteredDemands.reduce((acc, d) => {
          if (d.status === 'Concluído' && d.data_conclusao) {
            return acc + differenceInSeconds(parseISO(d.data_conclusao), parseISO(d.data_criacao))
          }
          return acc
        }, 0) /
        (filteredDemands.filter((d) => d.status === 'Concluído' && d.data_conclusao).length || 1)
      : 0

  const avgHours = isNaN(avgTime) ? 0 : Math.floor(avgTime / 3600)
  const avgMins = isNaN(avgTime) ? 0 : Math.floor((avgTime % 3600) / 60)

  const clearFilters = () => {
    setSearch('')
    setAssigneeId('all')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDemands.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandas Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDemands.filter((d) => d.status === 'Concluído').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Conclusão</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgHours}h {avgMins}m
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-end bg-muted/40">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label>Buscar Demandas</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Protocolo, título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
          <div className="space-y-2 w-[200px]">
            <Label>Responsável</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {collaborators.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-[160px]">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-background',
                    !dateFrom && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2 w-[160px]">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-background',
                    !dateTo && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            <FilterX className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Protocolo / Título</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Tempo Resp.</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredDemands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma demanda encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDemands.map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{demand.protocolo}</span>
                          <span className="truncate max-w-[200px]" title={demand.titulo}>
                            {demand.titulo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {demand.responsavel?.nome || (
                          <span className="text-muted-foreground italic">Não atribuído</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            demand.status === 'Concluído'
                              ? 'default'
                              : demand.status === 'Em Andamento'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            demand.status === 'Concluído'
                              ? 'bg-green-600 hover:bg-green-700'
                              : demand.status === 'Em Andamento'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : ''
                          }
                        >
                          {demand.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs space-y-1">
                        <div>
                          <span className="font-semibold">Criado:</span>{' '}
                          {format(parseISO(demand.data_criacao), 'dd/MM/yyyy HH:mm')}
                        </div>
                        {demand.data_conclusao && (
                          <div className="text-green-600 dark:text-green-500">
                            <span className="font-semibold">Concluído:</span>{' '}
                            {format(parseISO(demand.data_conclusao), 'dd/MM/yyyy HH:mm')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {demand.status === 'Concluído' && demand.data_conclusao ? (
                          <span className="font-semibold text-green-600 dark:text-green-500">
                            {formatDuration(demand.data_criacao, demand.data_conclusao)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Em aberto
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate text-xs text-muted-foreground"
                        title={demand.resposta || demand.descricao}
                      >
                        {demand.resposta || demand.descricao || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
