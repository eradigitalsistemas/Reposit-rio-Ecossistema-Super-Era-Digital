import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts'
import {
  Download,
  Clock,
  AlertTriangle,
  FileText,
  CalendarIcon,
  Eye,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { exportToCSV, exportToPDF } from '@/utils/export'

export default function FolhaPonto() {
  const { user, role } = useAuthStore()
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const [timesheets, setTimesheets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTs, setSelectedTs] = useState<any>(null)
  const [details, setDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchTimesheets = async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('monthly_timesheets')
        .select('*, employees(personal_data, id)')
        .eq('month', parseInt(month))
        .eq('year', parseInt(year))

      if (role !== 'admin' && role !== 'rh') {
        const { data: empId } = await supabase.rpc('get_user_employee_id')
        if (empId) {
          query = query.eq('employee_id', empId)
        }
      }

      const { data, error } = await query
      if (error) throw error
      setTimesheets(data || [])

      if (data && data.length === 1) {
        handleSelectTs(data[0])
      } else {
        setSelectedTs(null)
      }
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao buscar folhas de ponto',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimesheets()
  }, [month, year, user, role])

  const handleSelectTs = async (ts: any) => {
    setSelectedTs(ts)
    setDetailsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        `monthly-timesheets/${ts.id}/details`,
        {
          method: 'GET',
        },
      )
      if (error) throw error
      setDetails(data)
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar detalhamento diário',
        variant: 'destructive',
      })
    } finally {
      setDetailsLoading(false)
    }
  }

  const weeklyData = useMemo(() => {
    if (!details || !details.daily_breakdown) return []
    const weeks: any[] = []
    let currentWeek = 1
    let currentWeekHours = 0
    let dayCount = 0

    details.daily_breakdown.forEach((day: any) => {
      currentWeekHours += day.worked_hours || 0
      dayCount++
      if (dayCount === 7) {
        weeks.push({ name: `Semana ${currentWeek}`, horas: Number(currentWeekHours.toFixed(2)) })
        currentWeek++
        currentWeekHours = 0
        dayCount = 0
      }
    })
    if (dayCount > 0) {
      weeks.push({ name: `Semana ${currentWeek}`, horas: Number(currentWeekHours.toFixed(2)) })
    }
    return weeks
  }, [details])

  const handleExportPDF = () => {
    if (!details || !details.daily_breakdown) return
    window.print()
  }

  const handleExportCSV = () => {
    if (!details || !details.daily_breakdown) return
    const rows = details.daily_breakdown.map((d: any) => ({
      Data: d.date,
      Entrada: d.entry_time || '-',
      Saida: d.exit_time || '-',
      Trabalhadas: d.worked_hours || 0,
      Extras: d.extra_hours || 0,
      Atraso: d.delay_minutes || 0,
      Status: d.status,
    }))
    exportToCSV(
      rows,
      `Folha_Ponto_${selectedTs?.employees?.personal_data?.nome || 'Colaborador'}_${month}_${year}.csv`,
    )
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-background min-h-full p-4 sm:p-6 print-area">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Folha de Ponto Mensal
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualização consolidada de horas e registros
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto bg-card border border-border p-2 rounded-xl shadow-sm">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Mês {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px] bg-background">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchTimesheets} variant="default" className="font-bold">
            Filtrar
          </Button>
        </div>
      </div>

      {loading && !selectedTs ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !selectedTs && timesheets.length > 0 ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              Folhas do Mês {month}/{year}
            </CardTitle>
            <CardDescription>Selecione um colaborador para ver os detalhes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Colaborador</th>
                    <th className="px-4 py-3 font-semibold">Hrs Trabalhadas</th>
                    <th className="px-4 py-3 font-semibold">Hrs Extras</th>
                    <th className="px-4 py-3 font-semibold">Atrasos</th>
                    <th className="px-4 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {timesheets.map((ts) => (
                    <tr key={ts.id} className="bg-card hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {ts.employees?.personal_data?.nome || 'Desconhecido'}
                      </td>
                      <td className="px-4 py-3">{ts.total_hours_worked}h</td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
                        {ts.total_extra_hours}h
                      </td>
                      <td className="px-4 py-3 text-orange-600 dark:text-orange-400 font-medium">
                        {ts.total_delays_minutes} min
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleSelectTs(ts)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : selectedTs ? (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          {(role === 'admin' || role === 'rh') && timesheets.length > 1 && (
            <Button
              variant="ghost"
              className="w-fit mb-2 no-print"
              onClick={() => setSelectedTs(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a lista
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card shadow-sm border-l-4 border-l-primary">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Horas Trabalhadas
                  </span>
                </div>
                <span className="text-3xl font-bold text-foreground">
                  {selectedTs.total_hours_worked}h
                </span>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-l-4 border-l-green-500">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Horas Extras
                  </span>
                </div>
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {selectedTs.total_extra_hours}h
                </span>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-l-4 border-l-orange-500">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Atrasos</span>
                </div>
                <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {selectedTs.total_delays_minutes} min
                </span>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-l-4 border-l-destructive">
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CalendarIcon className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Faltas / Dias
                  </span>
                </div>
                <span className="text-3xl font-bold text-destructive">
                  {selectedTs.total_absences}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {selectedTs.days_worked} trab.
                  </span>
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Detalhamento Diário</CardTitle>
                  <CardDescription>
                    {selectedTs.employees?.personal_data?.nome} - Mês {month}/{year}
                  </CardDescription>
                </div>
                <div className="flex gap-2 no-print">
                  <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!details}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel (CSV)
                  </Button>
                  <Button variant="default" size="sm" onClick={handleExportPDF} disabled={!details}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto max-h-[500px] p-0 relative">
                {detailsLoading ? (
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : details?.daily_breakdown ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Data</th>
                        <th className="px-4 py-3 font-semibold">Entrada</th>
                        <th className="px-4 py-3 font-semibold">Saída</th>
                        <th className="px-4 py-3 font-semibold">Trabalhado</th>
                        <th className="px-4 py-3 font-semibold">Extras/Atraso</th>
                        <th className="px-4 py-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {details.daily_breakdown.map((day: any, i: number) => (
                        <tr key={i} className="bg-card hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap font-medium">{day.date}</td>
                          <td className="px-4 py-3">{day.entry_time || '-'}</td>
                          <td className="px-4 py-3">{day.exit_time || '-'}</td>
                          <td className="px-4 py-3 font-medium">
                            {day.worked_hours ? `${day.worked_hours}h` : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {day.extra_hours > 0 && (
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                +{day.extra_hours}h{' '}
                              </span>
                            )}
                            {day.delay_minutes > 0 && (
                              <span className="text-orange-600 dark:text-orange-400 font-bold">
                                -{day.delay_minutes}m
                              </span>
                            )}
                            {!day.extra_hours && !day.delay_minutes && (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Badge
                              variant={
                                day.status === 'completo'
                                  ? 'default'
                                  : day.status === 'falta'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className="uppercase text-[10px]"
                            >
                              {day.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    Nenhum dado diário encontrado.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm no-print">
              <CardHeader>
                <CardTitle>Horas por Semana</CardTitle>
                <CardDescription>Evolução da jornada no mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ChartContainer
                    config={{
                      horas: {
                        label: 'Horas',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weeklyData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          tickMargin={10}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          tickFormatter={(v) => `${v}h`}
                        />
                        <ChartTooltip
                          cursor={{ fill: 'hsl(var(--muted))' }}
                          content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                          {weeklyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-border rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Nenhuma folha encontrada</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Não há registros consolidados para o período selecionado. Tente alterar o mês ou o ano.
          </p>
        </div>
      )}
    </div>
  )
}
