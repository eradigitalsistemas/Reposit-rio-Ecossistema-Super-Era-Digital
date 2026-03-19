import { useState } from 'react'
import { Demand } from '@/types/demand'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { format } from 'date-fns'
import { Trash2, User } from 'lucide-react'

export function DemandDetailsModal({
  demand,
  children,
}: {
  demand: Demand
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState('')
  const { addResponse, updateStatus, deleteDemand, acceptDemand } = useDemandStore()
  const { role } = useAuthStore()

  const handleAddResponse = () => {
    if (!response.trim()) return
    addResponse(demand.id, response)
    setResponse('')
  }

  const handleDelete = () => {
    deleteDemand(demand.id)
    setOpen(false)
  }

  const handleAccept = () => {
    acceptDemand(demand.id)
  }

  const priorityColors = {
    Urgente: 'bg-red-500/10 text-red-500 border-red-500/20',
    'Durante o Dia': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Pode Ficar para Amanhã': 'bg-green-500/10 text-green-500 border-green-500/20',
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 bg-zinc-950 border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex justify-between items-start pr-6 w-full gap-4">
            <DialogTitle className="text-xl leading-tight text-foreground">
              {demand.title}
            </DialogTitle>
            {role === 'Admin' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 -mr-4 -mt-2"
                title="Excluir demanda"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 pb-4">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap items-center">
                <Badge variant="outline" className={priorityColors[demand.priority]}>
                  {demand.priority}
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {demand.status}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-muted/50 border-border">
                  <User className="w-3 h-3" />
                  {demand.assignee}
                </Badge>
                {demand.status === 'Pendente' && (
                  <Button
                    size="sm"
                    className="h-6 text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 ml-auto"
                    onClick={handleAccept}
                  >
                    Aceitar Demanda
                  </Button>
                )}
              </div>

              <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {demand.description || 'Sem descrição detalhada.'}
                </p>
                {demand.dueDate && (
                  <div className="text-xs text-muted-foreground mt-4 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    Prazo: {format(new Date(demand.dueDate), 'dd/MM/yyyy')}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-sm text-foreground/90">Histórico de Atividades</h4>
              {demand.logs.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg border border-dashed border-border/50 text-center">
                  Nenhum evento registrado ainda.
                </p>
              ) : (
                <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-border/50 pl-1">
                  {demand.logs.map((log) => (
                    <div key={log.id} className="relative flex gap-4 items-start group">
                      <div className="w-[22px] h-[22px] rounded-full bg-zinc-950 border-2 border-primary/80 shrink-0 mt-0.5 z-10 shadow-[0_0_8px_rgba(34,197,94,0.3)] group-hover:border-primary transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 bg-card/50 p-3.5 rounded-xl border border-border/60 shadow-sm transition-colors hover:bg-card hover:border-border">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-foreground tracking-tight">
                            {log.acao}
                          </span>
                          <span className="text-muted-foreground/80 font-medium">
                            {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        {log.detalhes && (
                          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/30">
                            {log.detalhes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-card flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Adicione uma nota, resposta ou atualização..."
              className="min-h-[80px] bg-background resize-none border-border focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-[120px]">
            <Button
              onClick={handleAddResponse}
              className="w-full shadow-[0_0_10px_rgba(34,197,94,0.2)]"
              disabled={!response.trim()}
            >
              Registrar
            </Button>
            {demand.status !== 'Concluído' && (
              <Button
                variant="outline"
                className="w-full border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                onClick={() => updateStatus(demand.id, 'Concluído')}
              >
                Concluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
