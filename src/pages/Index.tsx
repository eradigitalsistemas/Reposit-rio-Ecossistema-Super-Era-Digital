import { Link } from 'react-router-dom'
import { Users, FileBadge, Briefcase, Calendar, BarChart3, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Index() {
  return (
    <>
      <div className="min-h-[calc(100vh-theme(spacing.16))] flex flex-col p-6 lg:p-12 animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Central de Comando
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-white/80">
              Acesse rapidamente os principais módulos do sistema. Navegue de forma inteligente e
              eficiente através do nosso painel de controle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AccessCard
              to="/vendas"
              title="CRM & Vendas"
              description="Gerencie seus leads, oportunidades e acompanhe o funil de vendas em tempo real."
              icon={Users}
              delay="0ms"
            />

            <AccessCard
              to="/certificados"
              title="Certificados"
              description="Controle de protocolos, parceiros e emissão de certificados digitais."
              icon={FileBadge}
              delay="100ms"
            />

            <AccessCard
              to="/demandas"
              title="Demandas"
              description="Acompanhamento de tarefas, fluxo de trabalho e checklists operacionais."
              icon={Briefcase}
              delay="200ms"
            />

            <AccessCard
              to="/agenda"
              title="Agenda"
              description="Gerenciamento de compromissos, reuniões e eventos importantes da equipe."
              icon={Calendar}
              delay="300ms"
            />

            <AccessCard
              to="/relatorios"
              title="Relatórios"
              description="Métricas, estatísticas avançadas e análise de produtividade geral."
              icon={BarChart3}
              delay="400ms"
            />
          </div>
        </div>
      </div>
    </>
  )
}

function AccessCard({
  to,
  title,
  description,
  icon: Icon,
  delay,
}: {
  to: string
  title: string
  description: string
  icon: any
  delay: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl p-8',
        'border border-slate-200/60 dark:border-primary/30',
        'bg-white/60 dark:bg-card/60 backdrop-blur-xl',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.2)]',
        'hover:border-primary/50 dark:hover:border-primary/60',
        'animate-in fade-in slide-in-from-bottom-8',
      )}
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
        )}
      />

      <div className="relative z-10 space-y-6">
        <div
          className={cn(
            'p-4 w-fit rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110',
            'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white',
            'border border-primary/20 dark:border-primary/30',
          )}
        >
          <Icon className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        </div>

        <div className="space-y-3">
          <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-white/80 leading-relaxed text-sm md:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="relative z-10 pt-8 mt-auto flex items-center text-sm font-semibold tracking-wide text-slate-500 dark:text-white/70 group-hover:text-primary dark:group-hover:text-white transition-colors">
        <span>Acessar Módulo</span>
        <ChevronRight className="w-4 h-4 ml-1 opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-2 text-accent/70 dark:text-accent/70 group-hover:text-primary dark:group-hover:text-white" />
      </div>
    </Link>
  )
}
