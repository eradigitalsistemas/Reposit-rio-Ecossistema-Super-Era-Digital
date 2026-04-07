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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
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
  startOfYear,
  endOfYear,
  isWithinInterval,
  isSameDay,
} from 'date-fns'
import { Users, CheckSquare, AlertTriangle, UserCheck, Loader2, FileText, X } from 'lucide-react'
import { exportDetailedPDF } from '@/utils/export'

interface LeadData {
  estagio: string
  data_criacao: string
  status_interesse: string
}

interface DemandData {
  status: string
  prioridade: string
  responsavel_id: string | null
  data_criacao: string
  data_vencimento: string | null
  data_resposta: string | null
  checklist: any
}

interface UserData {
  id: string
  nome: string
}

const leadsConfig: ChartConfig = {
  leads: { label: 'Leads', color: 'hsl(var(--primary))' },
  prospeccao: { label: 'Prospecção', color: 'hsl(var(--primary))' },
  convertido: { label: 'Convertido', color: '#3b82f6' },
  treinamento: { label: 'Em Treinamento', color: 'hsl(var(--primary))' },
  finalizado: { label: 'Finalizado', color: 'hsl(var(--foreground))' },
  pos_venda: { label: 'Pós Venda', color: 'hsl(var(--primary))' },
  ativo: { label: 'Ativo', color: 'hsl(var(--primary))' },
}

const priorityConfig: ChartConfig = {
  Urgente: { label: 'Urgente', color: '#ef4444' },
  'Durante o Dia': { label: 'Durante o Dia', color: '#eab308' },
  'Pode Ficar para Amanhã': { label: 'Ficar para Amanhã', color: 'hsl(var(--primary))' },
}

export default function Reports() {
  const { role } = useAuthStore()

  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    startDate: '',
    endDate: '',
    collaboratorIds: [] as string[],
    metrics: { demands: true, leads: true },
  })

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
    let isMounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [leadsRes, demandsRes, usersRes] = await Promise.all([
          supabase.from('leads').select('estagio, data_criacao, status_interesse'),
          supabase
            .from('demandas')
            .select(
              'status, prioridade, responsavel_id, data_criacao, data_vencimento, data_resposta, checklist',
            ),
          supabase.from('usuarios').select('id, nome'),
        ])

        if (!isMounted) return

        if (leadsRes.error) throw leadsRes.error
        if (demandsRes.error) throw demandsRes.error
        if (usersRes.error) throw usersRes.error

        setData({
          leads: leadsRes.data as LeadData[],
          demands: demandsRes.data as DemandData[],
          users: usersRes.data as UserData[],
        })
      } catch (err: any) {
        if (!isMounted) return
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()

    return () => {
      isMounted = false
    }
  }, [role])

  const parseLocalDate = useCallback((dateStr: string, isEnd: boolean) => {
    if (!dateStr) return isEnd ? new Date(8640000000000000) : new Date(0)
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return isEnd ? endOfDay(d) : startOfDay(d)
  }, [])

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
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom': {
        const start = parseLocalDate(customStartDate, false)
        let end = parseLocalDate(customEndDate, true)
        if (start > end) end = start
        return { start, end }
      }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }, [dateFilter, customStartDate, customEndDate, parseLocalDate])

  const isDateInFilter = useCallback(
    (dateString: string) => {
      if (!dateString) return false
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return false
      return isWithinInterval(date, filterInterval)
    },
    [filterInterval],
  )

  const handleGenerateReport = () => {
    exportDetailedPDF(data, reportConfig)
    setReportModalOpen(false)
  }

  const filteredLeads = useMemo(
    () => data.leads.filter((d) => isDateInFilter(d.data_criacao)),
    [data.leads, isDateInFilter],
  )

  const filteredDemands = useMemo(
    () => data.demands.filter((d) => isDateInFilter(d.data_criacao)),
    [data.demands, isDateInFilter],
  )

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
        fill: configItem?.color || 'hsl(var(--primary))',
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
        fill: configItem?.color || 'hsl(var(--primary))',
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
          <p className="text-sm font-medium text-foreground">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center p-6 text-foreground">
        <Card className="max-w-md w-full text-center p-6">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Erro</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className="h-[300px] w-full flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-border border-dashed p-4 text-center">
      Nenhum dado encontrado para o período selecionado.
    </div>
  )

  return (
    <div className="w-full min-h-full bg-background flex flex-col p-4 sm:p-6 text-foreground">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard de Relatórios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe métricas de conversão, produtividade da equipe e prioridades.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="thisWeek">Esta Semana</SelectItem>
                <SelectItem value="thisMonth">Este Mês</SelectItem>
                <SelectItem value="thisYear">Este Ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm w-[130px] sm:w-[140px]"
                />
                <span className="text-muted-foreground text-sm">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm w-[130px] sm:w-[140px]"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório Detalhado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Criados no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Demandas do Dia</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{demandsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Criadas hoje (Independente do filtro)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Demandas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{urgentesAberto}</div>
            <p className="text-xs text-muted-foreground mt-1">Em aberto no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Leads Convertidos</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{leadsConvertidos}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição de Leads</CardTitle>
            <CardDescription className="text-muted-foreground">
              Volume de leads por estágio do funil.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {leadsChartData.length === 0 ? (
              renderEmptyState()
            ) : (
              <ChartContainer
                config={leadsConfig}
                className="h-[250px] sm:h-[300px] w-full text-foreground"
              >
                <BarChart
                  data={leadsChartData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {leadsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Prioridade das Demandas</CardTitle>
            <CardDescription className="text-muted-foreground">
              Volume de tarefas por nível de prioridade.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {demandsPriorityData.length === 0 ? (
              renderEmptyState()
            ) : (
              <ChartContainer
                config={priorityConfig}
                className="h-[250px] sm:h-[300px] w-full text-foreground"
              >
                <BarChart
                  data={demandsPriorityData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {demandsPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-foreground">Produtividade da Equipe</CardTitle>
          <CardDescription className="text-muted-foreground">
            Volume de demandas atribuídas por colaborador.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 overflow-x-auto">
          {filteredDemands.length === 0 ? (
            <div className="h-[300px] sm:h-[350px] w-full flex items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg border border-border border-dashed p-4 text-center">
              Nenhuma demanda encontrada para o período selecionado.
            </div>
          ) : (
            <div className="min-w-[500px] w-full">
              <ChartContainer
                config={{ count: { label: 'Demandas', color: 'hsl(var(--primary))' } }}
                className="h-[300px] sm:h-[350px] w-full text-foreground"
              >
                <BarChart data={teamData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
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

      {/* Report Builder Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white text-black p-6 rounded-lg shadow-2xl w-full max-w-xl border border-gray-300 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">Gerar Relatório Detalhado</h2>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Data Inicial</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:ring-black focus:border-black"
                    value={reportConfig.startDate}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Data Final</label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:ring-black focus:border-black"
                    value={reportConfig.endDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Colaboradores</label>
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto p-3 border border-gray-300 rounded-md bg-white shadow-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="colab-all"
                      className="h-4 w-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                      checked={reportConfig.collaboratorIds.length === 0}
                      onChange={(e) => {
                        if (e.target.checked)
                          setReportConfig({ ...reportConfig, collaboratorIds: [] })
                      }}
                    />
                    <label
                      htmlFor="colab-all"
                      className="text-sm text-black cursor-pointer font-medium"
                    >
                      Todos os Colaboradores
                    </label>
                  </div>
                  {data.users.map((u) => (
                    <div key={u.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`colab-${u.id}`}
                        className="h-4 w-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                        checked={reportConfig.collaboratorIds.includes(u.id)}
                        onChange={(e) => {
                          let newIds = [...reportConfig.collaboratorIds]
                          if (e.target.checked) {
                            newIds.push(u.id)
                          } else {
                            newIds = newIds.filter((id) => id !== u.id)
                          }
                          setReportConfig({ ...reportConfig, collaboratorIds: newIds })
                        }}
                      />
                      <label
                        htmlFor={`colab-${u.id}`}
                        className="text-sm text-black cursor-pointer"
                      >
                        {u.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-bold text-black block border-b border-gray-200 pb-2">
                  Métricas a Incluir
                </label>
                <div className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    id="m-demands"
                    className="h-4 w-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                    checked={reportConfig.metrics.demands}
                    onChange={(e) =>
                      setReportConfig({
                        ...reportConfig,
                        metrics: { ...reportConfig.metrics, demands: e.target.checked },
                      })
                    }
                  />
                  <label htmlFor="m-demands" className="text-sm text-black cursor-pointer">
                    Demandas (Volume, Status, Prioridade, Tempo Médio)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="m-leads"
                    className="h-4 w-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                    checked={reportConfig.metrics.leads}
                    onChange={(e) =>
                      setReportConfig({
                        ...reportConfig,
                        metrics: { ...reportConfig.metrics, leads: e.target.checked },
                      })
                    }
                  />
                  <label htmlFor="m-leads" className="text-sm text-black cursor-pointer">
                    Leads (Conversão, Estágio, Volume Total)
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-black text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateReport}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 text-sm font-bold flex items-center transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
