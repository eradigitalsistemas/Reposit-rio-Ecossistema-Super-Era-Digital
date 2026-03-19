import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameDay,
} from 'date-fns'
import { Users, CheckSquare, AlertTriangle, UserCheck } from 'lucide-react'

interface LeadData {
  estagio: string
  data_criacao: string
}

interface DemandData {
  status: string
  prioridade: string
  responsavel_id: string | null
  data_criacao: string
  data_vencimento: string | null
}

interface UserData {
  id: string
  nome: string
}

const leadsConfig: ChartConfig = {
  leads: { label: 'Leads', color: '#94a3b8' },
  prospeccao: { label: 'Prospecção', color: '#f97316' },
  convertido: { label: 'Convertido', color: '#6366f1' },
  treinamento: { label: 'Em Treinamento', color: '#a855f7' },
  finalizado: { label: 'Finalizado', color: '#10b981' },
  pos_venda: { label: 'Pós Venda', color: '#f43f5e' },
  ativo: { label: 'Ativo', color: '#0ea5e9' },
}

const priorityConfig: ChartConfig = {
  Urgente: { label: 'Urgente', color: '#ef4444' },
  'Durante o Dia': { label: 'Durante o Dia', color: '#f59e0b' },
  'Pode Ficar para Amanhã': { label: 'Pode Ficar para Amanhã', color: '#3b82f6' },
}

export default function Reports() {
  const { role } = useAuthStore()

  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [leadsData, setLeadsData] = useState<LeadData[]>([])
  const [demandsData, setDemandsData] = useState<DemandData[]>([])
  const [usersData, setUsersData] = useState<UserData[]>([])

  useEffect(() => {
    if (role !== 'Admin') return

    const fetchData = async () => {
      const [leadsRes, demandsRes, usersRes] = await Promise.all([
        supabase.from('leads').select('estagio, data_criacao'),
        supabase
          .from('demandas')
          .select('status, prioridade, responsavel_id, data_criacao, data_vencimento'),
        supabase.from('usuarios').select('id, nome'),
      ])

      if (leadsRes.data) setLeadsData(leadsRes.data as LeadData[])
      if (demandsRes.data) setDemandsData(demandsRes.data as DemandData[])
      if (usersRes.data) setUsersData(usersRes.data as UserData[])
    }
    fetchData()
  }, [role])

  const filterInterval = useMemo(() => {
    const now = new Date()
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        }
      case 'thisMonth':
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }, [dateFilter])

  const isDateInFilter = useCallback(
    (dateString: string) => {
      if (!dateString) return false
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return false
      return isWithinInterval(date, filterInterval)
    },
    [filterInterval],
  )

  const filteredLeads = useMemo(
    () => leadsData.filter((d) => isDateInFilter(d.data_criacao)),
    [leadsData, isDateInFilter],
  )

  const filteredDemands = useMemo(
    () => demandsData.filter((d) => isDateInFilter(d.data_criacao)),
    [demandsData, isDateInFilter],
  )

  const totalLeads = filteredLeads.length

  const demandsToday = useMemo(() => {
    const now = new Date()
    return demandsData.filter((d) => {
      const isCreatedToday = d.data_criacao ? isSameDay(new Date(d.data_criacao), now) : false
      const isDueToday = d.data_vencimento ? isSameDay(new Date(d.data_vencimento), now) : false
      return isCreatedToday || isDueToday
    }).length
  }, [demandsData])

  const urgentesAberto = useMemo(
    () =>
      filteredDemands.filter((d) => d.prioridade === 'Urgente' && d.status !== 'Concluído').length,
    [filteredDemands],
  )

  const leadsConvertidos = useMemo(
    () =>
      filteredLeads.filter(
        (d) => d.estagio === 'convertido' || d.estagio === 'finalizado' || d.estagio === 'ativo',
      ).length,
    [filteredLeads],
  )

  const leadsChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredLeads.forEach((l) => {
      counts[l.estagio] = (counts[l.estagio] || 0) + 1
    })
    return Object.entries(counts).map(([stage, count]) => {
      const configItem = leadsConfig[stage as keyof typeof leadsConfig]
      return {
        id: stage,
        name: configItem?.label || stage,
        value: count,
        fill: configItem?.color || '#94a3b8',
      }
    })
  }, [filteredLeads])

  const demandsPriorityData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredDemands.forEach((d) => {
      counts[d.prioridade] = (counts[d.prioridade] || 0) + 1
    })
    return Object.entries(counts).map(([priority, count]) => {
      const configItem = priorityConfig[priority as keyof typeof priorityConfig]
      return {
        id: priority,
        name: configItem?.label || priority,
        value: count,
        fill: configItem?.color || '#ccc',
      }
    })
  }, [filteredDemands])

  const teamData = useMemo(() => {
    const userMap = new Map(usersData.map((u) => [u.id, u.nome]))
    const counts: Record<string, number> = {}

    usersData.forEach((u) => {
      counts[u.nome] = 0
    })

    filteredDemands.forEach((d) => {
      if (d.responsavel_id) {
        const userName = userMap.get(d.responsavel_id) || 'Não Atribuído'
        if (counts[userName] !== undefined) {
          counts[userName] += 1
        } else {
          counts[userName] = 1
        }
      }
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [filteredDemands, usersData])

  if (role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard de Relatórios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe métricas em tempo real de demandas, leads e produtividade.
          </p>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="thisWeek">Esta Semana</SelectItem>
            <SelectItem value="thisMonth">Este Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandas do Dia</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandsToday}</div>
            <p className="text-xs text-muted-foreground">Criadas ou com vencimento hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentesAberto}</div>
            <p className="text-xs text-muted-foreground">Em aberto no período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Convertidos</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsConvertidos}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição de Leads</CardTitle>
            <CardDescription>Volume de leads por estágio do funil.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={leadsConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={leadsChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Prioridade das Demandas</CardTitle>
            <CardDescription>Volume de tarefas por nível de prioridade.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priorityConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={demandsPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demandsPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Produtividade da Equipe</CardTitle>
          <CardDescription>Volume de demandas atribuídas por colaborador.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ count: { label: 'Demandas', color: 'hsl(var(--primary))' } }}
            className="h-[350px] w-full"
          >
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
