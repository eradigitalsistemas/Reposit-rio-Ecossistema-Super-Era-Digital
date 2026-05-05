import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { FileBadge, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { useCertificatesReportData } from '@/hooks/useCertificatesReportData'

const typeConfig: ChartConfig = {
  PF: { label: 'PF', color: '#3b82f6' },
  PJ: { label: 'PJ', color: 'hsl(var(--primary))' },
  'SafeID - 4 meses': { label: 'SafeID 4M', color: '#10b981' },
  'SafeID - 3 anos': { label: 'SafeID 3A', color: '#a855f7' },
}

export function CertificatesReport() {
  const { role } = useAuthStore()
  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const {
    loading,
    error,
    filteredCerts,
    totalCerts,
    certsPF,
    certsPJ,
    certsSafeID4,
    certsSafeID3,
  } = useCertificatesReportData(role, dateFilter, customStartDate, customEndDate)

  const certsByTypeData = useMemo(() => {
    return [
      { name: 'PF', value: certsPF, fill: typeConfig.PF.color },
      { name: 'PJ', value: certsPJ, fill: typeConfig.PJ.color },
      { name: 'SafeID - 4 meses', value: certsSafeID4, fill: typeConfig['SafeID - 4 meses'].color },
      { name: 'SafeID - 3 anos', value: certsSafeID3, fill: typeConfig['SafeID - 3 anos'].color },
    ]
  }, [certsPF, certsPJ, certsSafeID4, certsSafeID3])

  const certsByPartnerData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredCerts.forEach((c: any) => {
      const p = c.parceiro || 'Sem Parceiro'
      counts[p] = (counts[p] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10
  }, [filteredCerts])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg border-dashed">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center border rounded-lg border-dashed text-muted-foreground flex-col gap-2">
        <AlertTriangle className="w-8 h-8" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Certificados Digitais</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe o volume de certificados emitidos por parceiro e tipo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="thisWeek">Esta Semana</SelectItem>
              <SelectItem value="thisMonth">Este Mês</SelectItem>
              <SelectItem value="thisYear">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-9 px-3 py-1 rounded-md border border-input bg-transparent text-sm w-[130px]"
              />
              <span className="text-muted-foreground text-sm">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-9 px-3 py-1 rounded-md border border-input bg-transparent text-sm w-[130px]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total de Certificados
            </CardTitle>
            <FileBadge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Pessoa Jurídica (PJ)
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{certsPJ}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">SafeID 4 Meses</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{certsSafeID4}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">SafeID 3 Anos</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{certsSafeID3}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Certificados por Tipo</CardTitle>
            <CardDescription>Volume de emissões por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {totalCerts === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded">
                Nenhum dado
              </div>
            ) : (
              <ChartContainer config={typeConfig} className="h-[250px] w-full">
                <BarChart
                  data={certsByTypeData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
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
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {certsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Parceiros</CardTitle>
            <CardDescription>Volume de certificados (Top 10 parceiros).</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {certsByPartnerData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded">
                Nenhum dado
              </div>
            ) : (
              <ChartContainer
                config={{ count: { label: 'Certificados', color: 'hsl(var(--primary))' } }}
                className="h-[250px] w-full"
              >
                <BarChart
                  data={certsByPartnerData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                    tickFormatter={(val) => (val.length > 10 ? val.substring(0, 10) + '...' : val)}
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
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
