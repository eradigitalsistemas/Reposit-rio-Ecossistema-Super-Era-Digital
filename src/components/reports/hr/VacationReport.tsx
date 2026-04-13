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
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

export function VacationReport() {
  const [data, setData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: balances } = await supabase
        .from('vacation_balance')
        .select(
          'id, days_accrued, days_used, days_remaining, expiration_date, employees(personal_data)',
        )

      let sumAcumuladas = 0,
        sumUtilizadas = 0,
        sumRestantes = 0

      const mapped =
        balances
          ?.map((b: any) => {
            const remaining = Number(b.days_remaining)
            const expDate = b.expiration_date ? new Date(b.expiration_date) : null

            sumAcumuladas += Number(b.days_accrued || 0)
            sumUtilizadas += Number(b.days_used || 0)
            sumRestantes += remaining

            let status = 'OK'
            if (remaining > 0 && expDate) {
              const daysToExpiration =
                (expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              if (daysToExpiration < 30) status = 'CRÍTICO'
              else if (daysToExpiration < 90) status = 'ATENÇÃO'
            }
            return {
              id: b.id,
              nome: b.employees?.personal_data?.nome || 'Desconhecido',
              acumulado: b.days_accrued,
              usado: b.days_used,
              restante: remaining,
              vencimento: b.expiration_date || '-',
              status,
            }
          })
          .sort((a, b) => b.restante - a.restante) || []

      setData(mapped)
      setChartData([
        { name: 'Restantes', value: sumRestantes, fill: '#22c55e' },
        { name: 'Utilizadas', value: sumUtilizadas, fill: '#eab308' },
      ])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleExport = () => {
    exportToCSV(data, 'ferias.csv', [
      { header: 'Colaborador', key: 'nome' },
      { header: 'Acumulado', key: 'acumulado' },
      { header: 'Utilizado', key: 'usado' },
      { header: 'Restante', key: 'restante' },
      { header: 'Vencimento', key: 'vencimento' },
      { header: 'Status', key: 'status' },
    ])
  }

  return (
    <ReportLayout
      title="Relatório de Férias"
      description="Gestão de saldos e controle de vencimentos."
      loading={loading}
      onExport={handleExport}
      chart={
        <div className="space-y-4 flex flex-col items-center">
          <h3 className="font-semibold text-lg text-foreground text-center">
            Distribuição Geral de Dias
          </h3>
          <ChartContainer
            config={{ Restantes: { color: '#22c55e' }, Utilizadas: { color: '#eab308' } }}
            className="h-[250px] w-full max-w-sm"
          >
            <PieChart>
              <Tooltip formatter={(value, name) => [`${value} dias`, name]} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      }
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead className="text-right">Acumulado</TableHead>
              <TableHead className="text-right">Utilizado</TableHead>
              <TableHead className="text-right">Restante</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum dado
                </TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.nome}</TableCell>
                <TableCell className="text-right">{row.acumulado}</TableCell>
                <TableCell className="text-right">{row.usado}</TableCell>
                <TableCell className="text-right font-bold">{row.restante}</TableCell>
                <TableCell>{row.vencimento}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === 'CRÍTICO'
                        ? 'destructive'
                        : row.status === 'ATENÇÃO'
                          ? 'outline'
                          : 'secondary'
                    }
                    className={
                      row.status === 'ATENÇÃO'
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-none'
                        : ''
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    />
  )
}
