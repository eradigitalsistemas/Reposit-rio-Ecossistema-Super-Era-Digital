import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from '../ReportLayout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { exportToCSV } from '@/utils/export-reports'
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function TimeTrackingReport() {
  const [data, setData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: entries } = await supabase
        .from('time_entries')
        .select('employee_id, hours_worked, overtime, delay, date, employees(personal_data)')
      const grouped: any = {}
      const monthGroup: any = {}

      entries?.forEach((e) => {
        const id = e.employee_id
        if (!grouped[id])
          grouped[id] = {
            id,
            nome: (e.employees as any)?.personal_data?.nome || 'Desconhecido',
            horas: 0,
            extra: 0,
            atraso: 0,
            dias: 0,
          }
        grouped[id].horas += Number(e.hours_worked || 0)
        grouped[id].extra += Number(e.overtime || 0)
        grouped[id].atraso += Number(e.delay || 0)
        grouped[id].dias += 1

        const m = e.date.substring(0, 7)
        monthGroup[m] = (monthGroup[m] || 0) + Number(e.hours_worked || 0)
      })

      setData(Object.values(grouped).sort((a: any, b: any) => b.horas - a.horas))
      setChartData(
        Object.entries(monthGroup)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(-6),
      )
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleExport = () => {
    exportToCSV(data, 'ponto.csv', [
      { header: 'Colaborador', key: 'nome' },
      { header: 'Dias Trabalhados', key: 'dias' },
      { header: 'Total Horas', key: 'horas' },
      { header: 'Horas Extras', key: 'extra' },
      { header: 'Atrasos (h)', key: 'atraso' },
    ])
  }

  return (
    <ReportLayout
      title="Relatório de Ponto e Assiduidade"
      description="Consolidado de horas trabalhadas, extras e atrasos."
      loading={loading}
      onExport={handleExport}
      chart={
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Horas Trabalhadas (6 Meses)</h3>
          <ChartContainer
            config={{ value: { label: 'Horas', color: 'hsl(var(--primary))' } }}
            className="h-[250px] w-full"
          >
            <LineChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      }
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead className="text-right">Dias Trab.</TableHead>
              <TableHead className="text-right">Total Horas</TableHead>
              <TableHead className="text-right text-green-600">Horas Extras</TableHead>
              <TableHead className="text-right text-red-600">Atrasos (h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum dado
                </TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.nome}</TableCell>
                <TableCell className="text-right">{row.dias}</TableCell>
                <TableCell className="text-right">{row.horas.toFixed(2)}</TableCell>
                <TableCell className="text-right text-green-600">{row.extra.toFixed(2)}</TableCell>
                <TableCell className="text-right text-red-600">{row.atraso.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    />
  )
}
