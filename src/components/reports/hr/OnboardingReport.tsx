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
import { Progress } from '@/components/ui/progress'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function OnboardingReport() {
  const [data, setData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [empRes, chkRes] = await Promise.all([
        supabase.from('employees').select('id, hire_date, personal_data'),
        supabase.from('onboarding_checklist').select('employee_id, completed'),
      ])

      const emps = empRes.data || []
      const tasks = chkRes.data || []

      const mapped = emps
        .map((e) => {
          const myTasks = tasks.filter((t) => t.employee_id === e.id)
          if (myTasks.length === 0) return null

          const completed = myTasks.filter((t) => t.completed).length
          const prog = Math.round((completed / myTasks.length) * 100)

          return {
            id: e.id,
            nome: e.personal_data?.nome || 'Desconhecido',
            admissao: e.hire_date || '-',
            progresso: prog,
            tarefas: `${completed}/${myTasks.length}`,
          }
        })
        .filter(Boolean) as any[]

      const sorted = mapped.sort((a, b) => b.progresso - a.progresso)
      setData(sorted)
      setChartData(
        sorted.slice(0, 10).map((m) => ({ name: m.nome.split(' ')[0], value: m.progresso })),
      )
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleExport = () => {
    exportToCSV(data, 'onboarding.csv', [
      { header: 'Colaborador', key: 'nome' },
      { header: 'Admissão', key: 'admissao' },
      { header: 'Progresso (%)', key: 'progresso' },
      { header: 'Tarefas', key: 'tarefas' },
    ])
  }

  return (
    <ReportLayout
      title="Relatório de Onboarding"
      description="Acompanhamento da integração de novos talentos."
      loading={loading}
      onExport={handleExport}
      chart={
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Progresso Médio (Top 10)</h3>
          <ChartContainer
            config={{ value: { label: 'Progresso %', color: 'hsl(var(--primary))' } }}
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
                domain={[0, 100]}
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
              <TableHead>Data de Admissão</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Tarefas Concluídas</TableHead>
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
                <TableCell>{row.admissao}</TableCell>
                <TableCell className="w-[30%]">
                  <div className="flex items-center gap-2">
                    <Progress value={row.progresso} className="h-2" />
                    <span className="text-xs text-muted-foreground w-8">{row.progresso}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{row.tarefas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    />
  )
}
