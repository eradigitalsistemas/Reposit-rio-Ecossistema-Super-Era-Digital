import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  LayoutDashboard,
  CheckSquare,
  Building2,
  BarChart3,
  Users,
  Loader2,
  ArrowRight,
  Home,
  Calendar,
  Download,
  Database,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { exportFullDatabaseJSON, exportAllTablesCSV } from '@/utils/export'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [counts, setCounts] = useState({
    leads: null as number | null,
    demandas: null as number | null,
    clientes: null as number | null,
    colaboradores: null as number | null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (!user) return

    const fetchCounts = async () => {
      setLoading(true)
      try {
        const [leadsRes, demandasRes, clientesRes, colabRes] = await Promise.all([
          supabase.from('leads').select('id', { count: 'exact', head: false }).limit(1),
          supabase
            .from('demandas')
            .select('id', { count: 'exact', head: false })
            .in('status', ['Pendente', 'Em Andamento'])
            .limit(1),
          supabase.from('clientes_externos').select('id', { count: 'exact', head: false }).limit(1),
          supabase
            .from('usuarios')
            .select('id', { count: 'exact', head: false })
            .eq('ativo', true)
            .limit(1),
        ])

        if (isMounted) {
          setCounts({
            leads: leadsRes.count ?? 0,
            demandas: demandasRes.count ?? 0,
            clientes: clientesRes.count ?? 0,
            colaboradores: colabRes.count ?? 0,
          })
        }
      } catch (e) {
        // Silently handled in production
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCounts()

    return () => {
      isMounted = false
    }
  }, [user])

  const cards = [
    {
      title: 'Era Digital Vendas',
      description: 'Gerenciamento de Leads e Funil de Vendas',
      icon: LayoutDashboard,
      count: counts.leads,
      countLabel: 'Leads Ativos',
      route: '/vendas',
    },
    {
      title: 'Demandas',
      description: 'Tarefas e Solicitações Pendentes',
      icon: CheckSquare,
      count: counts.demandas,
      countLabel: 'Demandas em Aberto',
      route: '/demandas',
    },
    {
      title: 'Agenda',
      description: 'Calendário e Compromissos',
      icon: Calendar,
      count: null,
      countLabel: 'Acessar Calendário',
      route: '/agenda',
    },
    {
      title: 'Clientes Externos',
      description: 'Gestão de Contas e Documentos',
      icon: Building2,
      count: counts.clientes,
      countLabel: 'Clientes Cadastrados',
      route: '/clientes',
    },
    {
      title: 'Relatórios',
      description: 'Métricas e Análises de Desempenho',
      icon: BarChart3,
      count: null,
      countLabel: 'Acessar Dashboard',
      route: '/relatorios',
    },
    {
      title: 'Colaboradores',
      description: 'Equipe e Níveis de Acesso',
      icon: Users,
      count: counts.colaboradores,
      countLabel: 'Usuários Ativos',
      route: '/colaboradores',
    },
  ]

  return (
    <div className="flex-1 w-full bg-background min-h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Home className="w-8 h-8 text-primary" />
              Dashboard Geral
            </h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">
              Bem-vindo ao CRM. Selecione um módulo para começar a trabalhar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={async () => {
                setIsExporting(true)
                try {
                  await exportAllTablesCSV()
                  toast({
                    title: 'Exportação concluída',
                    description: 'Todos os CSVs foram baixados.',
                  })
                } catch (e) {
                  toast({
                    title: 'Erro',
                    description: 'Falha na exportação',
                    variant: 'destructive',
                  })
                } finally {
                  setIsExporting(false)
                }
              }}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSVs
            </Button>
            <Button
              onClick={async () => {
                setIsExporting(true)
                try {
                  await exportFullDatabaseJSON()
                  toast({
                    title: 'Backup concluído',
                    description: 'Arquivo JSON gerado com sucesso.',
                  })
                } catch (e) {
                  toast({
                    title: 'Erro',
                    description: 'Falha na exportação',
                    variant: 'destructive',
                  })
                } finally {
                  setIsExporting(false)
                }
              }}
              disabled={isExporting}
              className="gap-2"
            >
              <Database className="w-4 h-4" />
              Backup Completo (JSON)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card) => (
            <Card
              key={card.route}
              onClick={() => navigate(card.route)}
              className={cn(
                'group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300',
                'shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col h-full overflow-hidden',
              )}
            >
              <CardContent className="p-6 flex flex-col flex-1 relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4 group-hover:scale-110 duration-500 pointer-events-none text-foreground">
                  <card.icon className="w-24 h-24" />
                </div>

                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 ring-1 ring-primary/20 group-hover:ring-primary/50 transition-all">
                  <card.icon className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-xl font-bold text-card-foreground mb-2">{card.title}</h2>
                <p className="text-muted-foreground text-sm mb-6 flex-1">{card.description}</p>

                <div className="flex items-end justify-between mt-auto pt-4 border-t border-border group-hover:border-primary/20 transition-colors relative z-10">
                  <div className="flex flex-col">
                    {loading ? (
                      <div className="flex items-center gap-2 text-muted-foreground h-8">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Carregando...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-foreground leading-none mb-1">
                          {card.count !== null ? card.count : '---'}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {card.countLabel}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 text-secondary-foreground">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
