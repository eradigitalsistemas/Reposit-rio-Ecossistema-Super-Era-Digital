import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { subDays, startOfMonth, endOfMonth } from 'date-fns'

export default function Reports() {
  const { role } = useAuthStore()

  const [dateFilter, setDateFilter] = useState('30days')
  const [leadsData, setLeadsData] = useState<any[]>([])
  const [demandsData, setDemandsData] = useState<any[]>([])
  const [usersData, setUsersData] = useState<any[]>([])

  useEffect(() => {
    if (role !== 'Admin') return

    const fetchData = async () => {
      const [leadsRes, demandsRes, usersRes] = await Promise.all([
        supabase.from('leads').select('estagio, data_criacao'),
        supabase.from('demandas').select('status, responsavel_id, data_criacao'),
        supabase.from('usuarios').select('id, nome'),
      ])

      if (leadsRes.data) setLeadsData(leadsRes.data)
      if (demandsRes.data) setDemandsData(demandsRes.data)
      if (usersRes.data) setUsersData(usersRes.data)
    }
    fetchData()
  }, [role])

  // Filtering Logic
  const filterByDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    if (dateFilter === '30days') {
      return date >= subDays(now, 30)
    } else if (dateFilter === 'thisMonth') {
      return date >= startOfMonth(now) && date <= endOfMonth(now)
    }
    return true // allTime
  }

  const filteredLeads = useMemo(
    () => leadsData.filter((d) => filterByDate(d.data_criacao)),
    [leadsData, dateFilter],
  )
  const filteredDemands = useMemo(
    () => demandsData.filter((d) => filterByDate(d.data_criacao)),
    [demandsData, dateFilter],
  )

  // Leads Overview Chart Data
  const leadsChartData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredLeads.forEach((l) => {
      counts[l.estagio] = (counts[l.estagio] || 0) + 1
    })
    return Object.entries(counts).map(([stage, count]) => ({ stage, count }))
  }, [filteredLeads])

  // Demands Status Chart Data
  const demandsStatusData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredDemands.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({ name: status, value: count }))
  }, [filteredDemands])

  // Team Productivity Data
  const teamData = useMemo(() => {
    const userMap = new Map(usersData.map((u) => [u.id, u.nome]))
    const counts: Record<string, { concluido: number; andamento: number }> = {}

    usersData.forEach((u) => {
      counts[u.nome] = { concluido: 0, andamento: 0 }
    })

    filteredDemands.forEach((d) => {
      if (d.responsavel_id) {
        const userName = userMap.get(d.responsavel_id) || 'Desconhecido'
        if (!counts[userName]) counts[userName] = { concluido: 0, andamento: 0 }

        if (d.status === 'Concluído') {
          counts[userName].concluido += 1
        } else if (d.status === 'Em Andamento') {
          counts[userName].andamento += 1
        }
      }
    })
    return Object.entries(counts).map(([name, data]) => ({ name, ...data }))
  }, [filteredDemands, usersData])

  if (role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b']

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard de Relatórios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe métricas em tempo real de demandas, leads e produtividade.
          </p>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Últimos 30 Dias</SelectItem>
            <SelectItem value="thisMonth">Este Mês</SelectItem>
            <SelectItem value="allTime">Todo o Período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Leads por Estágio</CardTitle>
            <CardDescription>Distribuição atual de leads no funil de vendas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: 'Leads', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={leadsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Status das Demandas</CardTitle>
            <CardDescription>Proporção geral de demandas ativas e concluídas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={demandsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demandsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mb-6">
        <CardHeader>
          <CardTitle>Produtividade da Equipe</CardTitle>
          <CardDescription>Comparativo de tarefas por colaborador da plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              concluido: { label: 'Concluído', color: '#10b981' },
              andamento: { label: 'Em Andamento', color: '#3b82f6' },
            }}
            className="h-[350px] w-full"
          >
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="andamento" fill="var(--color-andamento)" stackId="a" />
              <Bar
                dataKey="concluido"
                fill="var(--color-concluido)"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
