import { useEffect, useState, useMemo } from 'react'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import { TimeEntryCard } from './TimeEntryCard'
import { TimeEntryHistory } from './TimeEntryHistory'
import { TimeEntryModal } from './TimeEntryModal'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TimeTracker() {
  const { fetchToday, todayEntries, loading, error, registerAction } = useTimeTrackingStore()
  const [init, setInit] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida' | null
  }>({ isOpen: false, type: null })
  const { toast } = useToast()

  useEffect(() => {
    fetchToday().finally(() => setInit(false))
  }, [fetchToday])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchToday()
    setIsRefreshing(false)
  }

  const entries = useMemo(() => {
    return [...(todayEntries || [])].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
  }, [todayEntries])

  const currentStatus = useMemo(() => {
    if (!entries.length) return 'waiting_entry'
    const hasEntrada = entries.some((e) => e.entry_type === 'entrada')
    const hasIntSaida = entries.some((e) => e.entry_type === 'intervalo_saida')
    const hasIntEntrada = entries.some((e) => e.entry_type === 'intervalo_entrada')
    const hasSaida = entries.some((e) => e.entry_type === 'saida')

    if (hasSaida) return 'complete'
    if (hasIntSaida && !hasIntEntrada) return 'waiting_break_return'
    if (hasEntrada && !hasSaida) return 'waiting_exit'
    return 'waiting_entry'
  }, [entries])

  const entryTime = entries.find((e) => e.entry_type === 'entrada')?.timestamp
  const exitTime = entries.find((e) => e.entry_type === 'saida')?.timestamp

  const calculateWorkedHours = () => {
    if (!entryTime) return 0
    let end = new Date()
    if (exitTime) end = new Date(exitTime)

    let ms = end.getTime() - new Date(entryTime).getTime()

    const intSaida = entries.find((e) => e.entry_type === 'intervalo_saida')?.timestamp
    const intEntrada = entries.find((e) => e.entry_type === 'intervalo_entrada')?.timestamp

    if (intSaida) {
      const intEnd = intEntrada ? new Date(intEntrada) : end
      ms -= intEnd.getTime() - new Date(intSaida).getTime()
    }

    return Math.max(0, ms / (1000 * 60 * 60))
  }

  const workedHours = calculateWorkedHours()
  const extraHours = workedHours > 8 ? workedHours - 8 : 0

  const handleActionClick = (
    type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida',
  ) => {
    setModalState({ isOpen: true, type })
  }

  const handleConfirmAction = async (notes: string) => {
    if (!modalState.type) return

    const result = await registerAction(modalState.type, notes)

    if (result.success) {
      toast({
        title: 'Sucesso',
        description: 'Ponto registrado com sucesso.',
      })
      setModalState({ isOpen: false, type: null })
    } else {
      toast({
        title: 'Erro',
        description: result.error || 'Erro ao registrar ponto.',
        variant: 'destructive',
      })
    }
  }

  if (init) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[350px] w-full rounded-2xl" />
        <Skeleton className="h-[120px] w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6">
        <TimeEntryCard
          status={currentStatus}
          entryTime={entryTime}
          exitTime={exitTime}
          workedHours={workedHours}
          extraHours={extraHours}
          delayMinutes={0}
          isLoading={loading}
          error={error || undefined}
          onActionClick={handleActionClick}
        />
      </div>

      <div className="bg-card border rounded-2xl p-6 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h3 className="font-semibold text-lg">Atividades de Hoje</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 rounded-full hover:bg-secondary"
          >
            <RefreshCw
              className={cn('h-4 w-4 text-muted-foreground', isRefreshing && 'animate-spin')}
            />
          </Button>
        </div>
        <TimeEntryHistory entries={entries} isLoading={isRefreshing} />
      </div>

      <TimeEntryModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalState({ isOpen: false, type: null })}
      />
    </div>
  )
}
