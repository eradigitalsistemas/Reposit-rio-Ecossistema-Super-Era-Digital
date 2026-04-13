import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import { LogIn, LogOut, Coffee, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type ActionType = 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida'

export function DailyPunch() {
  const { todayEntries, fetchToday, registerAction } = useTimeTrackingStore()
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  const getLastAction = (): ActionType | null => {
    if (!todayEntries || todayEntries.length === 0) return null
    // Sort by timestamp to ensure we get the real last action
    const sorted = [...todayEntries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    return sorted[sorted.length - 1].entry_type as ActionType
  }

  const getNextActionInfo = () => {
    const last = getLastAction()
    switch (last) {
      case null:
        return {
          type: 'entrada',
          label: 'Registrar Entrada',
          icon: LogIn,
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700',
        }
      case 'entrada':
        return {
          type: 'intervalo_saida',
          label: 'Saída para Intervalo',
          icon: Coffee,
          color: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600',
        }
      case 'intervalo_saida':
        return {
          type: 'intervalo_entrada',
          label: 'Retorno do Intervalo',
          icon: CheckCircle2,
          color: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700',
        }
      case 'intervalo_entrada':
        return {
          type: 'saida',
          label: 'Registrar Saída',
          icon: LogOut,
          color: 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700',
        }
      case 'saida':
        return null // Day complete
      default:
        return null
    }
  }

  const handleActionClick = (type: ActionType) => {
    setSelectedAction(type)
    setNotes('')
    setModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!selectedAction) return
    setLoading(true)
    const { success, error } = await registerAction(selectedAction, notes)
    setLoading(false)

    if (success) {
      toast.success('Ponto registrado com sucesso!')
      setModalOpen(false)
    } else {
      toast.error('Erro ao registrar ponto', { description: error })
    }
  }

  const nextAction = getNextActionInfo()
  const todayDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  // Helper to find specific entries for the summary
  const getEntryTime = (type: ActionType) => {
    const entry = todayEntries.find((e: any) => e.entry_type === type)
    if (!entry) return '--:--'
    return format(new Date(entry.timestamp), 'HH:mm')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Esquerda: Status e Ação */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Status Atual
              </h3>
              <span className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border">
                {todayDate}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col p-4 bg-muted/30 rounded-lg border">
                <span className="text-sm text-muted-foreground mb-1">Entrada</span>
                <span className="text-2xl font-bold text-foreground">
                  {getEntryTime('entrada')}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-muted/30 rounded-lg border">
                <span className="text-sm text-muted-foreground mb-1">Saída Final</span>
                <span className="text-2xl font-bold text-foreground">{getEntryTime('saida')}</span>
              </div>
              <div className="flex flex-col p-4 bg-muted/30 rounded-lg border">
                <span className="text-sm text-muted-foreground mb-1">Saída Intervalo</span>
                <span className="text-xl font-semibold text-foreground">
                  {getEntryTime('intervalo_saida')}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-muted/30 rounded-lg border">
                <span className="text-sm text-muted-foreground mb-1">Retorno Intervalo</span>
                <span className="text-xl font-semibold text-foreground">
                  {getEntryTime('intervalo_entrada')}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-background">
              {nextAction ? (
                <>
                  <p className="text-muted-foreground mb-4 text-center">
                    Seu próximo passo esperado é:
                  </p>
                  <Button
                    size="lg"
                    className={cn(
                      'w-full sm:w-auto min-w-[280px] h-16 text-lg font-bold shadow-md transition-all active:scale-95 border-b-4 active:border-b-0 active:translate-y-1',
                      nextAction.color,
                    )}
                    onClick={() => handleActionClick(nextAction.type as ActionType)}
                    disabled={loading}
                  >
                    <nextAction.icon className="w-6 h-6 mr-3" />
                    {loading ? 'Processando...' : nextAction.label}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">Jornada Concluída</h4>
                  <p className="text-muted-foreground">Você já finalizou seus registros de hoje.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Direita: Histórico */}
      <div className="lg:col-span-5">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col">
          <div className="p-6 border-b border-border/50">
            <h3 className="font-semibold text-lg">Histórico de Hoje</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {!todayEntries || todayEntries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-60 py-12">
                <Clock className="w-12 h-12" />
                <p>Nenhum registro encontrado hoje.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {[...todayEntries]
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((entry, idx) => {
                    const time = format(new Date(entry.timestamp), 'HH:mm')
                    const isEntrada = entry.entry_type.includes('entrada')

                    let label = ''
                    let Icon = CheckCircle2
                    let colorClass = ''

                    switch (entry.entry_type) {
                      case 'entrada':
                        label = 'Entrada'
                        Icon = LogIn
                        colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                        break
                      case 'intervalo_saida':
                        label = 'Saída p/ Intervalo'
                        Icon = Coffee
                        colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                        break
                      case 'intervalo_entrada':
                        label = 'Retorno Intervalo'
                        Icon = CheckCircle2
                        colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                        break
                      case 'saida':
                        label = 'Saída Final'
                        Icon = LogOut
                        colorClass = 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                        break
                    }

                    return (
                      <div
                        key={entry.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-background z-10">
                          <Icon className={cn('w-4 h-4', colorClass.split(' ')[0])} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-foreground">{time}</span>
                            <span
                              className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded-full border',
                                colorClass,
                              )}
                            >
                              {label}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md italic">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Confirmar Registro
            </DialogTitle>
            <DialogDescription>
              Você está prestes a registrar <strong>{nextAction?.label.toLowerCase()}</strong>{' '}
              agora.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Horário Atual
              </span>
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {format(new Date(), 'HH:mm')}
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notas adicionais (opcional)
              </label>
              <textarea
                id="notes"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
                placeholder="Ex: Esqueci de bater na hora exata..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              className={cn(
                'min-w-[120px]',
                nextAction?.color?.split(' ')[0],
                nextAction?.color?.split(' ')[1],
              )}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
