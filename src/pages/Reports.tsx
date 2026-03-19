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
import { Users, CheckSquare, AlertTriangle, UserCheck, Loader2 } from 'lucide-react'

interface LeadData {
  estagio: string
  data_criacao: string
}

interface DemandData {
  status: string
  prioridade: string
  responsavel_id: string | null
  data_criacao: string
}

interface UserData {
  id: string
  nome: string
}

const leadsConfig: ChartConfig = {
  leads: { label: 'Leads', color: 'rgba(255,255,255,0.2)' },
  prospeccao: { label: 'Prospecção', color: 'rgba(255,255,255,0.4)' },
  convertido: { label: 'Convertido', color: '#3b82f6' }, // Semantic Blue
  treinamento: { label: 'Em Treinamento', color: 'rgba(255,255,255,0.6)' },
  finalizado: { label: 'Finalizado', color: '#0ea5e9' }, // Semantic Light Blue
  pos_venda: { label: 'Pós Venda', color: 'rgba(255,255,255,0.8)' },
  ativo: { label: 'Ativo', color: 'hsl(var(--primary))' }, // Primary Green
}

const priorityConfig: ChartConfig = {
  Urgente: { label: 'Urgente', color: '#ef4444' }, // Semantic Red
  'Durante o Dia': { label: 'Durante o Dia', color: '#f97316' }, // Semantic Orange
  'Pode Ficar para Amanhã': { label: 'Ficar para Amanhã', color: 'rgba(255,255,255,0.3)' }, // Subtle Grey
}

export default function Reports() {
  const { role } = useAuthStore()

  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [data, setData] = useState<{ leads: LeadData[]; demands: DemandData[]; users: UserData[] }>(
    {
      leads: [],
      demands: [],
      users: [],
    },
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (role !== 'Admin') return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [leadsRes, demandsRes, usersRes] = await Promise.all([
          supabase.from('leads').select('estagio, data_criacao'),
          supabase.from('demandas').select('status, prioridade, responsavel_id, data_criacao'),
          supabase.from('usuarios').select('id, nome'),
        ])

        if (leadsRes.error) throw leadsRes.error
        if (demandsRes.error) throw demandsRes.error
        if (usersRes.error) throw usersRes.error

        setData({
          leads: leadsRes.data as LeadData[],
          demands: demandsRes.data as DemandData[],
          users: usersRes.data as UserData[],
        })
      } catch (err: any) {
        console.error(err)
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
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
    () => data.leads.filter((d) => isDateInFilter(d.data_criacao)),
    [data.leads, isDateInFilter],
  )

  const filteredDemands = useMemo(
    () => data.demands.filter((d) => isDateInFilter(d.data_criacao)),
    [data.demands, isDateInFilter],
  )

  // KPIs
  const totalLeads = filteredLeads.length

  const demandsToday = useMemo(() => {
    const now = new Date()
    return data.demands.filter((d) => d.data_criacao && isSameDay(new Date(d.data_criacao), now))
      .length
  }, [data.demands])

  const urgentesAberto = useMemo(
    () =>
      filteredDemands.filter((d) => d.prioridade === 'Urgente' && d.status !== 'Concluído').length,
    [filteredDemands],
  )

  const leadsConvertidos = useMemo(
    () =>
      filteredLeads.filter((d) =>
        ['convertido', 'treinamento', 'finalizado', 'pos_venda', 'ativo'].includes(d.estagio),
      ).length,
    [filteredLeads],
  )

  // Charts Data
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
        fill: configItem?.color || 'rgba(255,255,255,0.2)',
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
        fill: configItem?.color || 'rgba(255,255,255,0.3)',
      }
    })
  }, [filteredDemands])

  const teamData = useMemo(() => {
    const userMap = new Map(data.users.map((u) => [u.id, u.nome]))
    const counts: Record<string, number> = {}

    data.users.forEach((u) => {
      counts[u.nome] = 0
    })

    filteredDemands.forEach((d) => {
      if (d.responsavel_id) {
        const userName = userMap.get(d.responsavel_id) || 'Não Atribuído'
        counts[userName] = (counts[userName] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .filter((item) => item.count > 0 || data.users.some((u) => u.nome === item.name))
  }, [filteredDemands, data.users])

  if (role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center p-6 text-foreground">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium text-white">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center p-6 text-foreground">
        <Card className="max-w-md w-full text-center p-6 border-white/10 bg-[rgba(255,255,255,0.05)]">
          <AlertTriangle className="w-10 h-10 text-white/60 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Erro</h2>
          <p className="text-sm text-white/60">{error}</p>
        </Card>
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className="h-[300px] w-full flex items-center justify-center text-sm text-white/40 bg-[rgba(255,255,255,0.02)] rounded-lg border border-white/10 border-dashed p-4 text-center">
      Nenhum dado encontrado para o período selecionado.
    </div>
  )

  return (
    <div className="h-full w-full bg-background flex flex-col p-4 sm:p-6 overflow-y-auto text-foreground">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard de Relatórios</h1>
          <p className="text-white/60 text-sm mt-1">
            Acompanhe métricas de conversão, produtividade da equipe e prioridades.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-10">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="thisWeek">Esta Semana</SelectItem>
              <SelectItem value="thisMonth">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalLeads}</div>
            <p className="text-xs text-white/40 mt-1">Criados no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Demandas do Dia</CardTitle>
            <CheckSquare className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{demandsToday}</div>
            <p className="text-xs text-white/40 mt-1">Criadas hoje (Independente do filtro)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Demandas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{urgentesAberto}</div>
            <p className="text-xs text-white/40 mt-1">Em aberto no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Leads Convertidos</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{leadsConvertidos}</div>
            <p className="text-xs text-white/40 mt-1">No período selecionado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Distribuição de Leads</CardTitle>
            <CardDescription className="text-white/60">
              Volume de leads por estágio do funil.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {leadsChartData.length === 0 ? (
              renderEmptyState()
            ) : (
              <ChartContainer config={leadsConfig} className="h-[250px] sm:h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={leadsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {leadsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Prioridade das Demandas</CardTitle>
            <CardDescription className="text-white/60">
              Volume de tarefas por nível de prioridade.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {demandsPriorityData.length === 0 ? (
              renderEmptyState()
            ) : (
              <ChartContainer config={priorityConfig} className="h-[250px] sm:h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={demandsPriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {demandsPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-white">Produtividade da Equipe</CardTitle>
          <CardDescription className="text-white/60">
            Volume de demandas atribuídas por colaborador.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 overflow-x-auto">
          {filteredDemands.length === 0 ? (
            <div className="h-[300px] sm:h-[350px] w-full flex items-center justify-center text-sm text-white/40 bg-[rgba(255,255,255,0.02)] rounded-lg border border-white/10 border-dashed p-4 text-center">
              Nenhuma demanda encontrada para o período selecionado.
            </div>
          ) : (
            <div className="min-w-[500px] w-full">
              <ChartContainer
                config={{ count: { label: 'Demandas', color: 'hsl(var(--primary))' } }}
                className="h-[300px] sm:h-[350px] w-full"
              >
                <BarChart data={teamData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
