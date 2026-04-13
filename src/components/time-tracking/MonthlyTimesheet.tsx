import { useEffect, useState, useMemo } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/utils/export-reports'
import {
  Download,
  Printer,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CalendarOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

const YEARS = [2024, 2025, 2026]

export function MonthlyTimesheet() {
  const { entries, totals, loading, fetchMonthly, employeeId } = useTimeTrackingStore()

  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  useEffect(() => {
    if (employeeId) {
      fetchMonthly(selectedMonth.toString(), selectedYear.toString())
    }
  }, [employeeId, selectedMonth, selectedYear, fetchMonthly])

  const handleExportCSV = () => {
    if (!entries || entries.length === 0) return

    const dataToExport = entries.map((day: any) => {
      let entrada = '-',
        saida = '-'
      const entryIn = day.entries?.find((e: any) => e.entry_type === 'entrada')
      const entryOut = day.entries?.find((e: any) => e.entry_type === 'saida')

      if (entryIn) entrada = format(new Date(entryIn.timestamp), 'HH:mm')
      if (entryOut) saida = format(new Date(entryOut.timestamp), 'HH:mm')

      const dateObj = new Date(day.date + 'T12:00:00Z')
      const formattedDate = isValid(dateObj) ? format(dateObj, 'dd/MM/yyyy') : day.date

      return {
        data: formattedDate,
        entrada,
        saida,
        horas_trabalhadas: day.hours_worked.toFixed(2),
        horas_extras: day.overtime.toFixed(2),
        status: day.entries?.length > 0 ? 'Presente' : 'Falta',
      }
    })

    exportToCSV(dataToExport, `folha_ponto_${selectedMonth}_${selectedYear}.csv`, [
      { header: 'Data', key: 'data' },
      { header: 'Entrada', key: 'entrada' },
      { header: 'Saída', key: 'saida' },
      { header: 'Horas Trabalhadas', key: 'horas_trabalhadas' },
      { header: 'Horas Extras', key: 'horas_extras' },
      { header: 'Status', key: 'status' },
    ])
  }

  const handlePrint = () => {
    window.print()
  }

  const chartData = useMemo(() => {
    if (!entries) return []
    return entries.map((e: any) => {
      const d = new Date(e.date + 'T12:00:00Z')
      return {
        date: isValid(d) ? format(d, 'dd/MM') : e.date,
        horas: e.hours_worked || 0,
        fullDate: e.date,
      }
    })
  }, [entries])

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:m-0">
      {/* Header & Filters (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between bg-card p-4 rounded-xl border shadow-sm print:hidden">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            Filtros de Período
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring w-40"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              disabled={loading}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring w-32"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={loading}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none gap-2"
            onClick={handleExportCSV}
            disabled={loading || !entries?.length}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none gap-2"
            onClick={handlePrint}
            disabled={loading || !entries?.length}
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Folha de Ponto Consolidada</h1>
        <p className="text-gray-600 mt-1">
          Período: {MONTHS.find((m) => m.value === selectedMonth)?.label} de {selectedYear}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-12 h-12" />
          </div>
          <span className="text-sm font-medium text-muted-foreground mb-1 z-10">
            Horas Trabalhadas
          </span>
          <span className="text-3xl font-bold text-foreground z-10">
            {totals?.hours_worked?.toFixed(2) || '0.00'}h
          </span>
        </div>
        <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500">
            <Clock className="w-12 h-12" />
          </div>
          <span className="text-sm font-medium text-muted-foreground mb-1 z-10">Horas Extras</span>
          <span className="text-3xl font-bold text-amber-500 z-10">
            {totals?.overtime?.toFixed(2) || '0.00'}h
          </span>
        </div>
        <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <span className="text-sm font-medium text-muted-foreground mb-1 z-10">
            Atrasos Registrados
          </span>
          <span className="text-3xl font-bold text-rose-500 z-10">{totals?.delay || 0} min</span>
        </div>
        <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500">
            <Calendar className="w-12 h-12" />
          </div>
          <span className="text-sm font-medium text-muted-foreground mb-1 z-10">
            Dias Trabalhados
          </span>
          <span className="text-3xl font-bold text-blue-500 z-10">
            {totals?.days_worked || 0} dias
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center border rounded-xl bg-card/50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-muted-foreground">Gerando folha consolidada...</p>
          </div>
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-1 bg-card rounded-xl border shadow-sm p-6 print:hidden">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-muted-foreground" />
              Evolução Diária
            </h3>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{ horas: { label: 'Horas', color: 'hsl(var(--primary))' } }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="currentColor"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      stroke="currentColor"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--muted-foreground)' }}
                      tickFormatter={(val) => `${val}h`}
                    />
                    <RechartsTooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border rounded-lg shadow-lg p-3">
                              <p className="font-semibold mb-1">{payload[0].payload.fullDate}</p>
                              <p className="text-sm text-primary font-medium">
                                Trabalhou: {Number(payload[0].value).toFixed(2)}h
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="horas"
                      fill="var(--color-horas)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col print:col-span-3 print:border-none print:shadow-none">
            <div className="p-6 border-b bg-muted/20 print:hidden">
              <h3 className="font-semibold text-lg">Detalhamento Diário</h3>
            </div>
            <div className="flex-1 overflow-auto max-h-[500px] print:max-h-none print:overflow-visible">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead className="text-right">Hrs Trab.</TableHead>
                    <TableHead className="text-right">Extras</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((day: any, idx: number) => {
                    let entrada = '--:--'
                    let saida = '--:--'
                    const entryIn = day.entries?.find((e: any) => e.entry_type === 'entrada')
                    const entryOut = day.entries?.find((e: any) => e.entry_type === 'saida')

                    if (entryIn) entrada = format(new Date(entryIn.timestamp), 'HH:mm')
                    if (entryOut) saida = format(new Date(entryOut.timestamp), 'HH:mm')

                    const isMissing = !day.entries || day.entries.length === 0
                    const dateObj = new Date(day.date + 'T12:00:00Z')
                    const formattedDate = isValid(dateObj) ? format(dateObj, 'dd/MM') : day.date

                    return (
                      <TableRow
                        key={idx}
                        className={cn(isMissing && 'bg-destructive/5 text-destructive/80')}
                      >
                        <TableCell className="font-medium">{formattedDate}</TableCell>
                        <TableCell>{entrada}</TableCell>
                        <TableCell>{saida}</TableCell>
                        <TableCell className="text-right font-medium">
                          {day.hours_worked.toFixed(2)}h
                        </TableCell>
                        <TableCell className="text-right text-amber-600 font-medium">
                          {day.overtime > 0 ? `+${day.overtime.toFixed(2)}h` : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                              isMissing
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
                            )}
                          >
                            {isMissing ? 'Falta' : 'Presente'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t bg-muted/10 text-sm text-muted-foreground flex justify-between print:hidden">
              <span>Mostrando {entries.length} dias faturáveis no mês.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border rounded-xl bg-card/50 text-muted-foreground p-8 text-center border-dashed">
          <CalendarOff className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">Nenhum registro encontrado</p>
          <p>
            Não há dados de ponto consolidados para{' '}
            {MONTHS.find((m) => m.value === selectedMonth)?.label} de {selectedYear}.
          </p>
        </div>
      )}
    </div>
  )
}
