import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAuthStore from '@/stores/useAuthStore'
import { BarChart, Users, CheckSquare, TrendingUp, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Reports() {
  const { role } = useAuthStore()
  const navigate = useNavigate()

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Apenas administradores possuem acesso ao painel de relatórios.
        </p>
        <Button onClick={() => navigate('/')} variant="default">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  const metrics = [
    { title: 'Total de Leads', value: '1,234', icon: Users, trend: '+12%' },
    { title: 'Demandas Concluídas', value: '456', icon: CheckSquare, trend: '+5%' },
    { title: 'Taxa de Conversão', value: '23%', icon: TrendingUp, trend: '+2%' },
    { title: 'Receita Estimada', value: 'R$ 45.000', icon: BarChart, trend: '+18%' },
  ]

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-6 overflow-y-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard de Análises</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe o desempenho das equipes e indicadores-chave.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {metric.trend} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex-1 min-h-[400px]">
        <CardHeader>
          <CardTitle>Desempenho Geral</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed border-border rounded-xl m-6 mt-0 bg-muted/20">
          O gráfico de detalhamento de conversões será renderizado aqui.
        </CardContent>
      </Card>
    </div>
  )
}
