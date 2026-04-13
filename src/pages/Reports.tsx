import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAuthStore from '@/stores/useAuthStore'
import { Navigate } from 'react-router-dom'
import { ExecutiveDashboard } from '@/components/reports/hr/ExecutiveDashboard'
import { ProductivityReport } from '@/components/reports/hr/ProductivityReport'
import { TimeTrackingReport } from '@/components/reports/hr/TimeTrackingReport'
import { VacationReport } from '@/components/reports/hr/VacationReport'
import { ComplianceReport } from '@/components/reports/hr/ComplianceReport'
import { OnboardingReport } from '@/components/reports/hr/OnboardingReport'
import { CrmReport } from '@/components/reports/crm/CrmReport'

export default function Reports() {
  const { role } = useAuthStore()
  const [activeTab, setActiveTab] = useState('executive')

  if (role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="w-full min-h-full bg-background flex flex-col p-4 sm:p-6 text-foreground overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard e Relatórios
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão executiva completa: RH, Operação e Comercial.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex-wrap h-auto justify-start mb-6">
          <TabsTrigger value="executive">Visão Geral</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="time">Ponto</TabsTrigger>
          <TabsTrigger value="vacation">Férias</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="crm">CRM Comercial</TabsTrigger>
        </TabsList>
        <TabsContent value="executive">
          <ExecutiveDashboard onNavigate={setActiveTab} />
        </TabsContent>
        <TabsContent value="productivity">
          <ProductivityReport />
        </TabsContent>
        <TabsContent value="time">
          <TimeTrackingReport />
        </TabsContent>
        <TabsContent value="vacation">
          <VacationReport />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceReport />
        </TabsContent>
        <TabsContent value="onboarding">
          <OnboardingReport />
        </TabsContent>
        <TabsContent value="crm">
          <CrmReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
