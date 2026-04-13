import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from '../ReportLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'

export function ExecutiveDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [data, setData] = useState({ total: 0, turnover: 0, absent: 0, prod: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const [empRes, demRes, timeRes] = await Promise.all([
        supabase.from('employees').select('status, hire_date'),
        supabase.from('demandas').select('status'),
        supabase.from('time_entries').select('delay, date'),
      ])

      const emps = empRes.data || []
      const active = emps.filter(
        (e) => e.status === 'Ativo' || e.status === 'Em Experiência',
      ).length
      const inactive = emps.filter((e) => e.status === 'Demitido').length
      const turnover = active > 0 ? (inactive / active) * 100 : 0

      const entries = timeRes.data || []
      const absent =
        entries.length > 0
          ? (entries.filter((e) => e.delay && e.delay > 0).length / entries.length) * 100
          : 0

      const demands = demRes.data || []
      const closed = demands.filter((d) => d.status === 'Concluído').length
      const prod = active > 0 ? closed / active : 0

      const months: Record<string, number> = {}
      emps.forEach((e) => {
        if (e.hire_date) {
          const m = e.hire_date.substring(0, 7)
          months[m] = (months[m] || 0) + 1
        }
      })
      const cData = Object.entries(months)
        .map(([k, v]) => ({ name: k, value: v }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-6)

      setData({ total: active, turnover, absent, prod })
      setChartData(cData)
      setLoading(false)
    }
    fetchMetrics()
  }, [])

  return (
    <ReportLayout
      title="Dashboard Executivo"
      description="Visão consolidada das principais métricas."
      loading={loading}
      summaryCards={
        <>
          <div
            onClick={() => onNavigate('compliance')}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <MetricCard title="Total de Colaboradores" value={data.total} icon={<Users />} />
          </div>
          <div
            onClick={() => onNavigate('onboarding')}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <MetricCard
              title="Turnover Geral"
              value={`${data.turnover.toFixed(1)}%`}
              icon={<TrendingUp />}
            />
          </div>
          <div
            onClick={() => onNavigate('time')}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <MetricCard
              title="Absenteísmo (Atrasos)"
              value={`${data.absent.toFixed(1)}%`}
              icon={<Clock />}
            />
          </div>
          <div
            onClick={() => onNavigate('productivity')}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <MetricCard
              title="Produtividade Média"
              value={`${data.prod.toFixed(1)} dem/colab`}
              icon={<CheckCircle />}
            />
          </div>
        </>
      }
      chart={
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">
            Contratações nos Últimos 6 Meses
          </h3>
          <ChartContainer
            config={{ value: { label: 'Contratações', color: 'hsl(var(--primary))' } }}
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
    />
  )
}

function MetricCard({ title, value, icon }: any) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}
