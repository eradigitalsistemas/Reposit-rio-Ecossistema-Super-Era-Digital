import { useState, useRef } from 'react'
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
import {
  Calendar,
  User2,
  MessageSquare,
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  Paperclip,
  File as FileIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { Demand, DemandAttachment } from '@/types/demand'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

interface DemandDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demand: Demand
  onCompleteClick: () => void
}

export function DemandDetailsModal({
  open,
  onOpenChange,
  demand,
  onCompleteClick,
}: DemandDetailsModalProps) {
  const { acceptDemand, addResponse, addAttachments } = useDemandStore()
  const { user } = useAuthStore()
  const [responseText, setResponseText] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAccept = () => acceptDemand(demand.id)
  const handleAddResponse = () => {
    if (responseText.trim()) {
      addResponse(demand.id, responseText)
      setResponseText('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    const newAttachments: DemandAttachment[] = []

    for (const file of Array.from(e.target.files)) {
      const fileName = `${crypto.randomUUID()}_${file.name}`
      const { data } = await supabase.storage.from('demandas_anexos').upload(fileName, file)
      if (data) {
        newAttachments.push({ name: file.name, url: data.path, type: file.type })
      } else {
        toast({
          title: 'Erro',
          description: `Falha ao anexar ${file.name}`,
          variant: 'destructive',
        })
      }
    }

    if (newAttachments.length > 0) {
      await addAttachments(demand.id, newAttachments)
      toast({ title: 'Anexos adicionados', description: 'Arquivos foram salvos com sucesso.' })
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async (attachment: DemandAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('demandas_anexos')
        .createSignedUrl(attachment.url, 3600)
      if (error) throw error
      window.open(data.signedUrl, '_blank')
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar o arquivo.',
        variant: 'destructive',
      })
    }
  }

  const canAccept = demand.status === 'Pendente' && demand.assigneeId !== user?.id
  const canComplete = demand.status === 'Pendente' || demand.status === 'Em Andamento'

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
                    <Badge className="bg-red-600 text-white hover:bg-red-700 border-transparent font-bold">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      Urgente
                    </Badge>
                  )}
                  {demand.priority === 'Durante o Dia' && (
                    <Badge
                      variant="outline"
                      className="text-orange-400 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Durante o Dia
                    </Badge>
                  )}
                  {demand.priority === 'Pode Ficar para Amanhã' && (
                    <Badge
                      variant="outline"
                      className="text-white/70 bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      Pode Ficar para Amanhã
                    </Badge>
                  )}
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

            <Separator className="bg-white/10" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-primary" />
                  Anexos
                </h3>
                {demand.status !== 'Concluído' && (
                  <div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2 h-8"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span className="animate-pulse">Enviando...</span>
                      ) : (
                        <>
                          <Paperclip className="w-4 h-4" /> Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {demand.attachments && demand.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demand.attachments.map((att, i) => (
                    <button
                      key={i}
                      onClick={() => handleDownload(att)}
                      className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="bg-white/5 p-2 rounded group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {att.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <FileIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium text-primary group-hover:text-primary/80 truncate transition-colors">
                          {att.name}
                        </p>
                        <p className="text-xs text-white/50 uppercase">
                          {att.type.split('/')[1] || 'FILE'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/50 bg-white/5 p-4 rounded-lg border border-white/5 text-center">
                  Nenhum anexo encontrado.
                </p>
              )}
            </div>

            <Separator className="bg-white/10" />

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
                {demand.status === 'Concluído' ? 'Observação Final' : 'Anotações Internas'}
              </h3>
              {demand.status !== 'Concluído' && (
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
              )}
              {demand.responses && demand.responses.length > 0 && (
                <div className="space-y-3 mt-4">
                  {demand.responses.map((resp, i) => (
                    <div
                      key={i}
                      className="bg-[rgba(255,255,255,0.02)] p-3 sm:p-4 rounded-lg border border-white/10 text-white text-sm break-words whitespace-pre-wrap"
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
                onClick={onCompleteClick}
                variant="default"
                className="w-full sm:w-auto gap-2 h-11 sm:h-10 bg-green-600 hover:bg-green-700 text-white shadow-none"
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
