import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Loader2, PieChart as PieChartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import {
  fetchComplianceSummary,
  type ComplianceSummaryItem,
} from '@/services/empresa-compliance-summary'

const chartConfig = {
  anexado: { label: 'Anexado', color: '#22c55e' },
  avencer: { label: 'A vencer', color: '#f59e0b' },
  vencido: { label: 'Vencido', color: '#ef4444' },
  pendente: { label: 'Pendente', color: '#9ca3af' },
} satisfies ChartConfig

export function CompliancePieChart({ empresaId }: { empresaId: string }) {
  const [data, setData] = useState<ComplianceSummaryItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchComplianceSummary(empresaId))
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    load()
  }, [load])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (loading) {
    return (
      <Card className="bg-card/60 border-border/50">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PieChartIcon className="w-4 h-4 text-primary" />
          Resumo de Conformidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
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
