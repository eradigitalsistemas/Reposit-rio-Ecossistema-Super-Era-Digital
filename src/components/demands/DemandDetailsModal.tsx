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
import { Trash2 } from 'lucide-react'

export function DemandDetailsModal({
  demand,
  children,
}: {
  demand: Demand
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState('')
  const { addResponse, updateStatus, deleteDemand } = useDemandStore()
  const { role, userName } = useAuthStore()

  const handleAddResponse = () => {
    if (!response.trim()) return
    addResponse(demand.id, response, userName)
    setResponse('')
  }

  const handleDelete = () => {
    deleteDemand(demand.id)
    setOpen(false)
  }

  const priorityColors = {
    Urgente: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-transparent',
    'Durante o Dia':
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-transparent',
    'Pode Ficar para Amanhã':
      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-transparent',
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex justify-between items-start pr-6 w-full gap-4">
            <DialogTitle className="text-xl leading-tight">{demand.title}</DialogTitle>
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
              <div className="flex gap-2 flex-wrap">
                <Badge className={priorityColors[demand.priority]}>{demand.priority}</Badge>
                <Badge variant="outline">{demand.status}</Badge>
                <Badge variant="secondary">Responsável: {demand.assignee}</Badge>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {demand.description}
                </p>
                <div className="text-xs text-muted-foreground mt-4 font-medium">
                  Prazo: {format(new Date(demand.dueDate), 'dd/MM/yyyy')}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-sm">Timeline & Respostas</h4>
              {demand.responses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
              ) : (
                <div className="space-y-4">
                  {demand.responses.map((resp) => (
                    <div
                      key={resp.id}
                      className="bg-muted/50 p-4 rounded-xl space-y-2 border border-border/50"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{resp.author}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(resp.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{resp.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20 flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Adicione uma resposta ou atualização..."
              className="min-h-[80px] bg-background resize-none"
            />
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-[120px]">
            <Button onClick={handleAddResponse} className="w-full" disabled={!response.trim()}>
              Enviar
            </Button>
            {demand.status !== 'Concluído' && (
              <Button
                variant="outline"
                className="w-full"
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
