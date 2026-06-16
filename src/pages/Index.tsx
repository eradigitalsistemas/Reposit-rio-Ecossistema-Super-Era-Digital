import { Link } from 'react-router-dom'
import { Users, FileBadge, Briefcase, Calendar, BarChart3, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Index() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-heading { font-family: 'Space Grotesk', sans-serif; }
        .font-sans-custom { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .quick-access-wrapper {
          background-color: #f8fafc; /* off-white */
        }
        
        /* Applied when ThemeProvider injects 'dark' class into html/body */
        :global(.dark) .quick-access-wrapper,
        .dark .quick-access-wrapper {
          background-color: #0f172a; /* midnight-slate variant */
        }
      `}</style>

      <div className="quick-access-wrapper min-h-[calc(100vh-theme(spacing.16))] flex flex-col p-6 lg:p-12 animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Central de Comando
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-sans-custom">
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
              gradient="from-blue-500/10 via-cyan-500/5 to-transparent"
              borderHover="hover:border-cyan-500/50"
              iconColor="text-cyan-600 dark:text-cyan-400"
              iconBg="bg-cyan-500/10"
              delay="0ms"
            />

            <AccessCard
              to="/certificados"
              title="Certificados"
              description="Controle de protocolos, parceiros e emissão de certificados digitais."
              icon={FileBadge}
              gradient="from-emerald-500/10 via-green-500/5 to-transparent"
              borderHover="hover:border-emerald-500/50"
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-500/10"
              delay="100ms"
            />

            <AccessCard
              to="/demandas"
              title="Demandas"
              description="Acompanhamento de tarefas, fluxo de trabalho e checklists operacionais."
              icon={Briefcase}
              gradient="from-violet-500/10 via-purple-500/5 to-transparent"
              borderHover="hover:border-violet-500/50"
              iconColor="text-violet-600 dark:text-violet-400"
              iconBg="bg-violet-500/10"
              delay="200ms"
            />

            <AccessCard
              to="/agenda"
              title="Agenda"
              description="Gerenciamento de compromissos, reuniões e eventos importantes da equipe."
              icon={Calendar}
              gradient="from-amber-500/10 via-orange-500/5 to-transparent"
              borderHover="hover:border-amber-500/50"
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-500/10"
              delay="300ms"
            />

            <AccessCard
              to="/relatorios"
              title="Relatórios"
              description="Métricas, estatísticas avançadas e análise de produtividade geral."
              icon={BarChart3}
              gradient="from-rose-500/10 via-pink-500/5 to-transparent"
              borderHover="hover:border-rose-500/50"
              iconColor="text-rose-600 dark:text-rose-400"
              iconBg="bg-rose-500/10"
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
  gradient,
  borderHover,
  iconColor,
  iconBg,
  delay,
}: {
  to: string
  title: string
  description: string
  icon: any
  gradient: string
  borderHover: string
  iconColor: string
  iconBg: string
  delay: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl p-8',
        'border border-slate-200/60 dark:border-slate-800/60',
        'bg-white/40 dark:bg-[#1e293b]/40 backdrop-blur-xl',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]',
        borderHover,
        'animate-in fade-in slide-in-from-bottom-8',
      )}
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-500 group-hover:opacity-100',
          gradient,
        )}
      />

      <div className="relative z-10 space-y-6">
        <div
          className={cn(
            'p-4 w-fit rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110',
            iconBg,
            iconColor,
          )}
        >
          <Icon className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <h3 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="font-sans-custom text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="relative z-10 pt-8 mt-auto flex items-center text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
        <span>Acessar Módulo</span>
        <ChevronRight className="w-4 h-4 ml-1 opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-2" />
      </div>
    </Link>
  )
}
