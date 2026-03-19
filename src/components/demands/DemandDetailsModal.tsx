import { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, User2, MessageSquare, History, CheckCircle, Clock } from 'lucide-react'
import { Demand } from '@/types/demand'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'

interface DemandDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demand: Demand
}

export function DemandDetailsModal({ open, onOpenChange, demand }: DemandDetailsModalProps) {
  const { acceptDemand, updateStatus, addResponse } = useDemandStore()
  const { user } = useAuthStore()
  const [responseText, setResponseText] = useState('')

  const handleAccept = () => {
    acceptDemand(demand.id)
  }

  const handleComplete = () => {
    updateStatus(demand.id, 'Concluído')
    onOpenChange(false)
  }

  const handleAddResponse = () => {
    if (!responseText.trim()) return
    addResponse(demand.id, responseText)
    setResponseText('')
  }

  const canAccept = demand.status === 'Pendente' && demand.assigneeId !== user?.id
  const canComplete = demand.status === 'Em Andamento' && demand.assigneeId === user?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl flex flex-col max-h-[90vh] p-0 sm:p-0 overflow-hidden bg-[rgba(20,20,20,0.95)]">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 sm:p-6 border-b border-white/10 shrink-0 bg-black/40 sticky top-0 z-10">
            <div className="flex items-center gap-2 mb-2 pr-8">
              <Badge
                variant="outline"
                className="bg-white/10 text-white border-white/20 h-auto py-0.5 text-xs sm:text-xs"
              >
                #{demand.id.toUpperCase().slice(0, 8)}
              </Badge>
              <Badge
                variant="outline"
                className="text-white/60 h-auto py-0.5 text-xs sm:text-xs border-white/10"
              >
                {demand.status}
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white pr-6">
              {demand.title}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base mt-2 whitespace-pre-wrap break-words max-h-32 overflow-y-auto text-white/70">
              {demand.description || 'Nenhuma descrição fornecida.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Responsável
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-white">
                  <User2 className="w-4 h-4 sm:w-4 sm:h-4 text-white/50" />
                  {demand.assignee}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Prioridade
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-white">
                  {demand.priority === 'Urgente' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                  {demand.priority}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Criado em
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-white">
                  <Calendar className="w-4 h-4 text-white/50" />
                  {format(new Date(demand.createdAt), 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Vencimento
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-white">
                  <Clock className="w-4 h-4 text-white/50" />
                  {demand.dueDate ? format(new Date(demand.dueDate), 'dd/MM/yyyy') : 'Sem data'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Histórico e Auditoria
              </h3>
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-white/10">
                {demand.logs && demand.logs.length > 0 ? (
                  demand.logs.map((log) => (
                    <div key={log.id} className="relative pl-4 sm:pl-6 pb-2">
                      <div className="absolute -left-[21px] sm:-left-[25px] top-1 w-3 h-3 bg-black border-2 border-white rounded-full" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                        <span className="font-semibold text-sm text-white">{log.acao}</span>
                        <span className="text-xs text-white/40 hidden sm:block">•</span>
                        <span className="text-xs text-white/40">
                          {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 break-words">{log.detalhes}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50 ml-4">Nenhum histórico registrado.</p>
                )}
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Anotações Internas
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <Textarea
                  placeholder="Adicione uma nota ou atualização..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-[80px] sm:min-h-[60px]"
                />
                <Button
                  onClick={handleAddResponse}
                  variant="default"
                  className="sm:h-auto sm:px-6 w-full sm:w-auto"
                >
                  Adicionar
                </Button>
              </div>

              {demand.responses && demand.responses.length > 0 && (
                <div className="space-y-3 mt-4">
                  {demand.responses.map((resp, i) => (
                    <div
                      key={i}
                      className="bg-[rgba(255,255,255,0.02)] p-3 sm:p-4 rounded-lg border border-white/10 text-white text-sm break-words"
                    >
                      {resp}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-white/10 bg-black/40 shrink-0 sticky bottom-0 z-10 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-11 sm:h-10"
            >
              Fechar
            </Button>
            {canAccept && (
              <Button
                onClick={handleAccept}
                variant="default"
                className="w-full sm:w-auto gap-2 h-11 sm:h-10 shadow-none"
              >
                <User2 className="w-4 h-4" />
                Assumir Demanda
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={handleComplete}
                variant="default"
                className="w-full sm:w-auto gap-2 h-11 sm:h-10"
              >
                <CheckCircle className="w-4 h-4" />
                Concluir Tarefa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
