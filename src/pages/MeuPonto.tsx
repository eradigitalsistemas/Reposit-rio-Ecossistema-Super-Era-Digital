import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import { useVacationStore } from '@/stores/useVacationStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeTracker } from '@/components/time-tracking/TimeTracker'
import { VacationManager } from '@/components/time-tracking/VacationManager'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Clock, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function MeuPonto() {
  const { employeeId, fetchEmployeeId, error, loading } = useTimeTrackingStore()
  const { fetchBalance, fetchRequests } = useVacationStore()
  const [init, setInit] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        fetchEmployeeId(data.user.email).then((id) => {
          if (id) {
            fetchBalance(id)
            fetchRequests(id)
          }
          setInit(false)
        })
      } else {
        setInit(false)
      }
    })
  }, [fetchEmployeeId, fetchBalance, fetchRequests])

  if (init || loading) {
    return (
      <div className="p-8 w-full">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !employeeId) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            {error || 'Seu usuário não está vinculado a um colaborador ativo. Contate o RH.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Ponto & Férias</h1>
      </div>

      <Tabs defaultValue="ponto" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="ponto">Controle de Ponto</TabsTrigger>
          <TabsTrigger value="ferias">Férias</TabsTrigger>
        </TabsList>
        <TabsContent value="ponto" className="mt-6">
          <TimeTracker />
        </TabsContent>
        <TabsContent value="ferias" className="mt-6">
          <VacationManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
