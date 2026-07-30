import { GlobalComplianceChart } from '@/components/compliance/GlobalComplianceChart'

export default function Index() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] flex flex-col p-6 lg:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
            Central de Comando
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-white/70">
            Visão geral de conformidade do portfólio.
          </p>
        </div>
        <GlobalComplianceChart />
      </div>
    </div>
  )
}
