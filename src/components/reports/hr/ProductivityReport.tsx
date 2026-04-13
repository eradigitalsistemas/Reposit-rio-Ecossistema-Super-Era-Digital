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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function ProductivityReport() {
  const [data, setData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: users } = await supabase.from('usuarios').select('id, nome')
      const { data: demands } = await supabase
        .from('demandas')
        .select('status, responsavel_id, data_criacao, data_resposta')

      if (users && demands) {
        const mapped = users
          .map((u) => {
            const myDemands = demands.filter((d) => d.responsavel_id === u.id)
            const closed = myDemands.filter((d) => d.status === 'Concluído')

            let time = 0
            closed.forEach((d) => {
              if (d.data_resposta && d.data_criacao) {
                time += new Date(d.data_resposta).getTime() - new Date(d.data_criacao).getTime()
              }
            })
            const avgTime =
              closed.length > 0 ? (time / closed.length / (1000 * 60 * 60)).toFixed(1) : '0.0'

            return {
              id: u.id,
              nome: u.nome,
              fechadas: closed.length,
              total: myDemands.length,
              tempoMedio: avgTime,
              taxa:
                myDemands.length > 0
                  ? ((closed.length / myDemands.length) * 100).toFixed(1)
                  : '0.0',
            }
          })
          .filter((u) => u.total > 0)
          .sort((a, b) => b.fechadas - a.fechadas)

        setData(mapped)
        setChartData(
          mapped.slice(0, 10).map((m) => ({ name: m.nome.split(' ')[0], value: m.fechadas })),
        )
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleExport = () => {
    exportToCSV(data, 'produtividade.csv', [
      { header: 'Colaborador', key: 'nome' },
      { header: 'Demandas Fechadas', key: 'fechadas' },
      { header: 'Tempo Médio (h)', key: 'tempoMedio' },
      { header: 'Taxa de Conclusão (%)', key: 'taxa' },
    ])
  }

  return (
    <ReportLayout
      title="Relatório de Produtividade"
      description="Análise de entregas por colaborador."
      loading={loading}
      onExport={handleExport}
      chart={
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Top 10 - Demandas Fechadas</h3>
          <ChartContainer
            config={{ value: { label: 'Demandas', color: 'hsl(var(--primary))' } }}
            className="h-[250px] w-full"
          >
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
                dataKey="value"
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ChartContainer>
        </div>
      }
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead className="text-right">Demandas Fechadas</TableHead>
              <TableHead className="text-right">Tempo Médio (h)</TableHead>
              <TableHead className="text-right">Conclusão (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum dado
                </TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.nome}</TableCell>
                <TableCell className="text-right">{row.fechadas}</TableCell>
                <TableCell className="text-right">{row.tempoMedio}h</TableCell>
                <TableCell className="text-right">{row.taxa}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    />
  )
}
