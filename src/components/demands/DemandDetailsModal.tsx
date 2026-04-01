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
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
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
  CheckSquare,
  LayoutTemplate,
  Trash2,
} from 'lucide-react'
import { Demand, DemandAttachment, ChecklistItem } from '@/types/demand'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { sanitizeFilename, cn } from '@/lib/utils'

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
  const { acceptDemand, addResponse, addAttachments, updateChecklist } = useDemandStore()
  const { user } = useAuthStore()
  const [responseText, setResponseText] = useState('')
  const [newChecklistText, setNewChecklistText] = useState('')
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
      const sanitizedName = sanitizeFilename(file.name)
      const fileName = `${crypto.randomUUID()}_${sanitizedName}`
      const { data } = await supabase.storage.from('anexos').upload(fileName, file)
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

  const checklist = demand.checklist || []
  const completedCount = checklist.filter((c) => c.completed).length
  const totalCount = checklist.length
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100

  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    updateChecklist(demand.id, updated)
  }

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return
    const updated = [
      ...checklist,
      { id: crypto.randomUUID(), text: newChecklistText, completed: false },
    ]
    updateChecklist(demand.id, updated)
    setNewChecklistText('')
  }

  const handleRemoveChecklist = (id: string) => {
    const updated = checklist.filter((c) => c.id !== id)
    updateChecklist(demand.id, updated)
  }

  const handleApplyTemplate = (template: string) => {
    let items: string[] = []
    if (template === 'emissao_certificado') {
      items = [
        'Solicitar documentos ao cliente',
        'Validar documentos recebidos',
        'Agendar videoconferência',
        'Realizar validação em vídeo',
        'Emitir certificado',
        'Enviar confirmação ao cliente',
      ]
    } else if (template === 'onboarding') {
      items = [
        'Enviar e-mail de boas-vindas',
        'Coletar dados cadastrais',
        'Configurar acessos no sistema',
        'Agendar reunião de kick-off',
        'Apresentar a plataforma',
      ]
    } else if (template === 'reuniao_alinhamento') {
      items = [
        'Definir pauta da reunião',
        'Convidar participantes',
        'Revisar métricas',
        'Elaborar ata',
        'Distribuir próximos passos (Follow-up)',
      ]
    }

    if (items.length > 0) {
      const newItems = items.map((text) => ({ id: crypto.randomUUID(), text, completed: false }))
      updateChecklist(demand.id, [...checklist, ...newItems])
      toast({ title: 'Modelo aplicado', description: 'Checklist preenchido automaticamente.' })
    }
  }

  const canAccept = demand.status === 'Pendente' && demand.assigneeId !== user?.id
  const canComplete = demand.status === 'Pendente' || demand.status === 'Em Andamento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-3xl flex flex-col max-h-[85vh] p-0 sm:p-0 overflow-hidden bg-white dark:bg-card border border-gray-300 dark:border-border shadow-lg">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-border shrink-0 bg-white dark:bg-card z-10">
            <div className="flex items-center gap-2 mb-2 pr-8">
              <Badge
                variant="outline"
                className="bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground border-gray-300 dark:border-border h-auto py-0.5 text-xs sm:text-xs"
              >
                #{demand.id.toUpperCase().slice(0, 8)}
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-600 dark:text-muted-foreground h-auto py-0.5 text-xs sm:text-xs border-gray-200 dark:border-border"
              >
                {demand.status}
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground pr-6">
              {demand.title}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base mt-2 whitespace-pre-wrap break-words max-h-32 overflow-y-auto text-gray-600 dark:text-muted-foreground">
              {demand.description || 'Nenhuma descrição fornecida.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                  Responsável
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                  <User2 className="w-4 h-4 sm:w-4 sm:h-4 text-gray-400 dark:text-white/50" />
                  {demand.assignee}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                  Prioridade
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                  {demand.priority === 'Urgente' && (
                    <Badge className="bg-red-600 text-white hover:bg-red-700 border-transparent font-bold shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      Urgente
                    </Badge>
                  )}
                  {demand.priority === 'Durante o Dia' && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Durante o Dia
                    </Badge>
                  )}
                  {demand.priority === 'Pode Ficar para Amanhã' && (
                    <Badge
                      variant="outline"
                      className="text-gray-600 dark:text-white/70 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10"
                    >
                      Pode Ficar para Amanhã
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                  Criado em
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-white/50" />
                  {format(new Date(demand.createdAt), 'dd/MM/yyyy')}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                  Vencimento
                </span>
                <div className="flex items-center gap-2 font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-white/50" />
                  {demand.dueDate ? format(new Date(demand.dueDate), 'dd/MM/yyyy') : 'Sem data'}
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-white/10" />

            {/* Checklist Section */}
            <div className="space-y-4 bg-white dark:bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-gray-300 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  Checklist
                </h3>
                {demand.status !== 'Concluído' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 bg-white text-gray-900 border-gray-300 hover:bg-gray-50 shadow-sm dark:bg-transparent dark:text-white dark:border-white/20"
                      >
                        <LayoutTemplate className="w-4 h-4" />
                        Modelos
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleApplyTemplate('emissao_certificado')}>
                        Emissão de Certificado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplyTemplate('onboarding')}>
                        Onboarding de Cliente
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplyTemplate('reuniao_alinhamento')}>
                        Reunião de Alinhamento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {totalCount > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-700 dark:text-white/60 font-medium">
                    <span>
                      Progresso ({completedCount}/{totalCount})
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-gray-200 dark:bg-white/10 [&>div]:bg-primary"
                  />
                </div>
              )}

              <div className="space-y-2 mt-4">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => handleToggleChecklist(item.id)}
                      disabled={demand.status === 'Concluído'}
                      className="border-gray-400 dark:border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span
                      className={cn(
                        'flex-1 text-sm transition-colors',
                        item.completed
                          ? 'line-through text-gray-400 dark:text-white/40'
                          : 'text-gray-900 dark:text-white',
                      )}
                    >
                      {item.text}
                    </span>
                    {demand.status !== 'Concluído' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveChecklist(item.id)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {checklist.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-white/40 italic">
                    Nenhum item adicionado ao checklist.
                  </p>
                )}
              </div>

              {demand.status !== 'Concluído' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <Input
                    placeholder="Adicionar item..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    className="h-9 bg-white dark:bg-black border-gray-300 dark:border-white/10 text-gray-900 dark:text-white shadow-sm"
                  />
                  <Button
                    onClick={handleAddChecklist}
                    className="h-9 px-3 bg-primary text-primary-foreground shadow-sm"
                  >
                    Adicionar
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-gray-200 dark:bg-white/10" />

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Histórico e Auditoria
              </h3>
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-gray-200 dark:border-white/10">
                {demand.logs && demand.logs.length > 0 ? (
                  demand.logs.map((log) => (
                    <div key={log.id} className="relative pl-4 sm:pl-6 pb-2">
                      <div className="absolute -left-[21px] sm:-left-[25px] top-1 w-3 h-3 bg-white dark:bg-black border-2 border-gray-300 dark:border-white rounded-full" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {log.acao}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-white/40 hidden sm:block">
                          •
                        </span>
                        <span className="text-xs text-gray-500 dark:text-white/40">
                          {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70 break-words">
                        {log.detalhes}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-white/50 ml-4">
                    Nenhum histórico registrado.
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-white/10" />

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {demand.status === 'Concluído' ? 'Observação Final' : 'Anotações Internas'}
              </h3>
              {demand.status !== 'Concluído' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Textarea
                    placeholder="Adicione uma nota ou atualização..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-[80px] sm:min-h-[60px] bg-white dark:bg-card border-gray-300 dark:border-input text-gray-900 dark:text-foreground shadow-sm"
                  />
                  <Button
                    onClick={handleAddResponse}
                    variant="default"
                    className="sm:h-auto sm:px-6 w-full sm:w-auto text-primary-foreground font-bold shadow-sm"
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
                      className="bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white text-sm break-words whitespace-pre-wrap shadow-sm"
                    >
                      {resp}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-gray-200 dark:bg-white/10" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-primary" />
                  Arquivos Anexados
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
                  {demand.attachments.map((att, i) => {
                    const fileUrl = supabase.storage.from('anexos').getPublicUrl(att.url)
                      .data.publicUrl
                    return (
                      <a
                        key={i}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={att.name}
                        className="flex items-center gap-3 bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group cursor-pointer shadow-sm"
                      >
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent p-2 rounded group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {att.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-gray-500 dark:text-white" />
                          ) : (
                            <FileIcon className="w-5 h-5 text-gray-500 dark:text-white" />
                          )}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-primary group-hover:text-primary truncate transition-colors">
                            {att.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-white/50 uppercase">
                            {att.type.split('/')[1] || 'FILE'}
                          </p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/5 text-center shadow-sm">
                  Nenhum anexo encontrado.
                </p>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-border bg-white dark:bg-card shrink-0 z-10 flex flex-col sm:flex-row gap-3 justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-11 sm:h-10 text-gray-700 dark:text-foreground border-gray-300 dark:border-border hover:bg-gray-100 dark:hover:bg-accent shadow-sm"
            >
              Fechar
            </Button>
            {canAccept && (
              <Button
                onClick={handleAccept}
                variant="default"
                className="w-full sm:w-auto gap-2 h-11 sm:h-10 shadow-sm text-primary-foreground font-bold"
              >
                <User2 className="w-4 h-4" />
                Assumir Demanda
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={onCompleteClick}
                variant="default"
                className="w-full sm:w-auto gap-2 h-11 sm:h-10 bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold"
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
