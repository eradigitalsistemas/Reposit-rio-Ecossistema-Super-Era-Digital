import { useState, useMemo } from 'react'
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
import { Users, CheckSquare, AlertTriangle, UserCheck, Loader2, FileText } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useCrmReportData } from '@/hooks/useCrmReportData'
import { CrmExportModal } from './CrmExportModal'

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

export function CrmReport() {
  const { role } = useAuthStore()
  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const {
    raw,
    loading,
    error,
    filteredLeads,
    filteredDemands,
    totalLeads,
    demandsToday,
    urgentesAberto,
    leadsConvertidos,
  } = useCrmReportData(role, dateFilter, customStartDate, customEndDate)

  const leadsChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredLeads.forEach((l: any) => {
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
    filteredDemands.forEach((d: any) => {
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
    if (!raw.users) return []
    const userMap = new Map(raw.users.map((u: any) => [u.id, u.nome]))
    const counts: Record<string, number> = {}

    raw.users.forEach((u: any) => {
      counts[u.nome] = 0
    })

    filteredDemands.forEach((d: any) => {
      if (d.responsavel_id) {
        const userName = userMap.get(d.responsavel_id) || 'Não Atribuído'
        counts[userName] = (counts[userName] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: Number(count) }))
      .filter((item) => item.count > 0 || raw.users.some((u: any) => u.nome === item.name))
  }, [filteredDemands, raw.users])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg border-dashed">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg border-dashed text-muted-foreground flex-col gap-2">
        <AlertTriangle className="w-8 h-8" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">CRM Comercial & Operação</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe métricas de conversão e demandas operacionais.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px] h-9">
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
                className="h-9 px-3 py-1 rounded-md border border-input bg-transparent text-sm w-[130px]"
              />
              <span className="text-muted-foreground text-sm">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-9 px-3 py-1 rounded-md border border-input bg-transparent text-sm w-[130px]"
              />
            </div>
          )}

          <button
            onClick={() => setReportModalOpen(true)}
            className="h-9 px-3 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF Detalhado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Demandas do Dia</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{demandsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Demandas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{urgentesAberto}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Leads Convertidos</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{leadsConvertidos}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Leads</CardTitle>
            <CardDescription>Volume por estágio do funil.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {leadsChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded">
                Nenhum dado
              </div>
            ) : (
              <ChartContainer config={leadsConfig} className="h-[250px] w-full">
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
            <CardTitle>Prioridade das Demandas</CardTitle>
            <CardDescription>Volume de tarefas por nível de prioridade.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {demandsPriorityData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded">
                Nenhum dado
              </div>
            ) : (
              <ChartContainer config={priorityConfig} className="h-[250px] w-full">
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

      <Card>
        <CardHeader>
          <CardTitle>Produtividade da Equipe Operacional</CardTitle>
          <CardDescription>Volume de demandas atribuídas por colaborador.</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 overflow-x-auto">
          {filteredDemands.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded">
              Nenhuma demanda
            </div>
          ) : (
            <div className="min-w-[500px] w-full">
              <ChartContainer
                config={{ count: { label: 'Demandas', color: 'hsl(var(--primary))' } }}
                className="h-[300px] w-full"
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

      {reportModalOpen && (
        <CrmExportModal rawData={raw} onClose={() => setReportModalOpen(false)} />
      )}
    </div>
  )
}
