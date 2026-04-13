import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DailyPunch } from '@/components/time-tracking/DailyPunch'
import { MonthlyTimesheet } from '@/components/time-tracking/MonthlyTimesheet'
import useAuthStore from '@/stores/useAuthStore'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import { Clock, CalendarDays } from 'lucide-react'

export default function MeuPonto() {
  const { user } = useAuthStore()
  const { fetchEmployeeId, employeeId, loading, error } = useTimeTrackingStore()
  const [activeTab, setActiveTab] = useState('daily')

  useEffect(() => {
    if (user?.email && !employeeId) {
      fetchEmployeeId(user.email)
    }
  }, [user, employeeId, fetchEmployeeId])

  if (loading && !employeeId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-8 text-center text-destructive">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
          <h3 className="font-semibold text-lg mb-2">Erro de Acesso</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!employeeId) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-8 text-center text-muted-foreground">
        <p>Colaborador não encontrado ou não vinculado ao seu usuário.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Meu Ponto</h2>
        <p className="text-muted-foreground">
          Gerencie seus registros diários e consulte sua folha consolidada.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-muted/50 p-1">
          <TabsTrigger value="daily" className="flex items-center gap-2 py-2.5 px-4">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Registro</span> Diário
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2 py-2.5 px-4">
            <CalendarDays className="w-4 h-4" />
            Folha <span className="hidden sm:inline">Mensal Consolidada</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="daily"
          className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <DailyPunch />
        </TabsContent>

        <TabsContent
          value="monthly"
          className="m-0 border-0 p-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <MonthlyTimesheet />
        </TabsContent>
      </Tabs>
    </div>
  )
}
