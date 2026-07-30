import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { PieChart as PieChartIcon, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { fetchPieChartData, type PieChartSummaryItem } from '@/services/empresa-pie-chart'

const chartConfig = {
  Anexados: { label: 'Anexados', color: '#22c55e' },
  'A Vencer': { label: 'A Vencer', color: '#f59e0b' },
  Vencidos: { label: 'Vencidos', color: '#ef4444' },
  Pendentes: { label: 'Pendentes', color: '#9ca3af' },
} satisfies ChartConfig

export function CompliancePieChart({ empresaId }: { empresaId: string | null }) {
  const [data, setData] = useState<PieChartSummaryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!empresaId) {
      setData([])
      return
    }
    setLoading(true)
    fetchPieChartData(empresaId)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [empresaId])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PieChartIcon className="w-4 h-4 text-primary" />
          Resumo de Conformidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!empresaId ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Selecione uma empresa para visualizar o gráfico
          </p>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : total === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhum documento encontrado.
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const item = payload[0]
                    const value = item.value as number
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0
                    return (
                      <div className="bg-background border border-border rounded-lg p-2 shadow-md text-xs">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground">
                          {value} documento(s) • {pct}%
                        </p>
                      </div>
                    )
                  }}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-3 mt-3 flex-wrap">
              {data.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}:</span>
                  <span className="font-medium">
                    {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
