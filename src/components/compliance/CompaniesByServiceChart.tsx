import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { PieChart as PieChartIcon, Loader2, AlertCircle, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useServicosChart } from '@/hooks/use-servicos-chart'

export function CompaniesByServiceChart() {
  const { data, total, loading, error, refresh } = useServicosChart()

  const chartConfig: ChartConfig = {}
  for (const item of data) {
    chartConfig[item.name] = { label: item.name, color: item.color }
  }

  if (loading) {
    return (
      <Card className="bg-card/60 border-border/50">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/60 border-border/50">
        <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 text-destructive" />
          <p className="text-sm mb-3">{error}</p>
          <button onClick={refresh} className="text-sm text-primary hover:underline font-medium">
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    )
  }

  if (total === 0) {
    return (
      <Card className="bg-card/60 border-border/50">
        <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">Nenhuma empresa encontrada.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/60 border-border/50 animate-fade-in-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <PieChartIcon className="w-5 h-5 text-primary" />
          Empresas por Tipo de Serviço
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {total} empresa(s) no total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
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
                      {value} empresa(s) • {pct}%
                    </p>
                  </div>
                )
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
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
      </CardContent>
    </Card>
  )
}
