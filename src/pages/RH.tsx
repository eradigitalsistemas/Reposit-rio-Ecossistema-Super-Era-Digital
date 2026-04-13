import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  UserPlus,
  Clock,
  CalendarRange,
  BarChart3,
  ArrowRight,
  Briefcase,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

export default function RH() {
  const { role } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeEmployees: 0,
    onboarding: 0,
    pendingVacations: 0,
    todayEntries: 0,
  })

  useEffect(() => {
    if (role !== 'Admin') return

    async function fetchStats() {
      try {
        const today = new Date()
        const localDate = new Date(today.getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0]

        const [empRes, onbRes, vacRes, timeRes] = await Promise.all([
          supabase.from('employees').select('id', { count: 'exact' }).eq('status', 'Ativo'),
          supabase
            .from('employees')
            .select('id', { count: 'exact' })
            .eq('status', 'Em Experiência'),
          supabase
            .from('vacation_requests')
            .select('id', { count: 'exact' })
            .eq('status', 'Pendente'),
          supabase
            .from('time_entries')
            .select('id', { count: 'exact' })
            .eq('date', localDate)
            .not('entry_time', 'is', null),
        ])

        setStats({
          activeEmployees: empRes.count || 0,
          onboarding: onbRes.count || 0,
          pendingVacations: vacRes.count || 0,
          todayEntries: timeRes.count || 0,
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas de RH', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [role])

  if (role !== 'Admin') {
    return <Navigate to="/meu-ponto" replace />
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Central de Recursos Humanos</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral e acesso rápido aos módulos de gestão de pessoas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Colaboradores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.activeEmployees}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" /> Em Experiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.onboarding}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-orange-500" /> Férias Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.pendingVacations}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Pontos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.todayEntries}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Módulos de Gestão</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/50 transition-colors group flex flex-col">
            <CardHeader>
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Colaboradores</CardTitle>
              <CardDescription>
                Gestão de perfis, cadastros, documentos e histórico completo.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to="/colaboradores">
                  Acessar Módulo <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors group flex flex-col">
            <CardHeader>
              <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-3 group-hover:scale-105 transition-transform">
                <UserPlus className="w-6 h-6 text-emerald-500" />
              </div>
              <CardTitle>Admissão & Onboarding</CardTitle>
              <CardDescription>
                Acompanhe checklists, documentos pendentes e o período de experiência.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to="/onboarding">
                  Acessar Módulo <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors group flex flex-col">
            <CardHeader>
              <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle>Relatórios Executivos</CardTitle>
              <CardDescription>
                Dashboard interativo de produtividade, assiduidade, conformidade e férias.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to="/relatorios">
                  Acessar Módulo <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
