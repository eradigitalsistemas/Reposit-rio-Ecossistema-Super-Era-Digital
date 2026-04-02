import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  User2,
  MessageSquare,
  History,
  CheckCircle,
  Clock,
  Paperclip,
  File as FileIcon,
  Image as ImageIcon,
  CheckSquare,
  LayoutTemplate,
  Trash2,
  Building2,
  Send,
  Check,
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
  const {
    demands,
    acceptDemand,
    addResponse,
    addAttachments,
    updateChecklist,
    checklistTemplates,
  } = useDemandStore()
  const { user } = useAuthStore()
  const [responseText, setResponseText] = useState('')
  const [newChecklistText, setNewChecklistText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentDemand = demands.find((d) => d.id === demand.id) || demand

  const handleAccept = () => acceptDemand(currentDemand.id)

  const handleAddResponse = async () => {
    if (responseText.trim()) {
      setIsSubmitting(true)
      try {
        await addResponse(currentDemand.id, responseText)
        setResponseText('')
      } finally {
        setIsSubmitting(false)
      }
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
      await addAttachments(currentDemand.id, newAttachments)
      toast({
        title: 'Anexos adicionados',
        description: 'Arquivos foram salvos com sucesso na timeline.',
      })
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const checklist = currentDemand.checklist || []
  const completedCount = checklist.filter((c) => c.completed).length
  const totalCount = checklist.length
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100

  const handleToggleChecklist = (item: ChecklistItem) => {
    const updated = checklist.map((c) => (c.id === item.id ? { ...c, completed: !c.completed } : c))
    updateChecklist(
      currentDemand.id,
      updated,
      `Marcou a etapa "${item.text}" como ${!item.completed ? 'concluída' : 'pendente'}`,
    )
  }

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return
    const updated = [
      ...checklist,
      { id: crypto.randomUUID(), text: newChecklistText, completed: false },
    ]
    updateChecklist(
      currentDemand.id,
      updated,
      `Adicionou a etapa "${newChecklistText}" ao checklist`,
    )
    setNewChecklistText('')
  }

  const handleRemoveChecklist = (item: ChecklistItem) => {
    const updated = checklist.filter((c) => c.id !== item.id)
    updateChecklist(currentDemand.id, updated, `Removeu a etapa "${item.text}" do checklist`)
  }

  const handleApplyTemplateDb = (template: import('@/types/demand').ChecklistTemplate) => {
    if (template.itens.length > 0) {
      const newItems = template.itens.map((text) => ({
        id: crypto.randomUUID(),
        text,
        completed: false,
      }))
      updateChecklist(
        currentDemand.id,
        [...checklist, ...newItems],
        `Aplicou o template de checklist "${template.nome}"`,
      )
      toast({ title: 'Modelo aplicado', description: 'Checklist preenchido automaticamente.' })
    }
  }

  const canAccept = currentDemand.status === 'Pendente'
  const canComplete = currentDemand.status === 'Em Andamento'

  const sortedLogs = currentDemand.logs
    ? [...currentDemand.logs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[1300px] h-[95vh] sm:h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-card border border-gray-300 dark:border-border shadow-xl rounded-xl">
        {/* Header Section */}
        <div className="shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-border bg-white dark:bg-card z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground border-gray-300 font-mono text-xs"
              >
                #{currentDemand.id.toUpperCase().slice(0, 8)}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'border-gray-200 text-xs font-semibold',
                  currentDemand.status === 'Pendente' &&
                    'text-amber-600 bg-amber-50 border-amber-200',
                  currentDemand.status === 'Em Andamento' &&
                    'text-blue-600 bg-blue-50 border-blue-200',
                  currentDemand.status === 'Concluído' &&
                    'text-green-600 bg-green-50 border-green-200',
                )}
              >
                {currentDemand.status}
              </Badge>
              {currentDemand.clientName && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1 border-transparent px-2"
                >
                  <Building2 className="w-3 h-3" />
                  {currentDemand.clientName}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground pr-6">
              {currentDemand.title}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canAccept && (
              <Button
                onClick={handleAccept}
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:text-white shadow-sm font-bold"
              >
                <Check className="w-4 h-4" />
                Aceitar Demanda
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={onCompleteClick}
                variant="default"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white shadow-sm font-bold"
              >
                <CheckCircle className="w-4 h-4" />
                Concluir Tarefa
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Panel: Primary Information & Checklist */}
          <div className="flex-1 overflow-y-auto lg:border-r border-gray-200 dark:border-border bg-white dark:bg-card">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                    Responsável
                  </span>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-900 dark:text-white">
                    <User2 className="w-4 h-4 text-gray-400" />
                    {currentDemand.assignee}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                    Prioridade
                  </span>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-900 dark:text-white">
                    {currentDemand.priority === 'Urgente' ? (
                      <Badge className="bg-red-600 text-white hover:bg-red-700 border-transparent px-1.5 py-0 font-bold">
                        Urgente
                      </Badge>
                    ) : currentDemand.priority === 'Durante o Dia' ? (
                      <Badge
                        variant="outline"
                        className="text-orange-600 bg-orange-50 border-orange-200 px-1.5 py-0 font-bold"
                      >
                        Dia
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-gray-600 bg-gray-100 border-gray-200 px-1.5 py-0 font-bold"
                      >
                        Amanhã
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                    Criado em
                  </span>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(new Date(currentDemand.createdAt), 'dd/MM/yyyy')}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider">
                    Vencimento
                  </span>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-900 dark:text-white">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {currentDemand.dueDate
                      ? format(new Date(currentDemand.dueDate), 'dd/MM/yyyy')
                      : 'Sem prazo'}
                  </div>
                </div>
              </div>

              {/* Description Container */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                  Descrição da Tarefa
                </h3>
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {currentDemand.description || (
                    <span className="italic text-gray-400">Nenhuma descrição fornecida.</span>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-white/10" />

              {/* Dynamic Checklist */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    Checklist Dinâmico
                  </h3>
                  {currentDemand.status !== 'Concluído' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 shadow-sm bg-white dark:bg-transparent border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
                        >
                          <LayoutTemplate className="w-4 h-4" />
                          Importar Modelo
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {checklistTemplates.map((t) => (
                          <DropdownMenuItem key={t.id} onClick={() => handleApplyTemplateDb(t)}>
                            {t.nome}
                          </DropdownMenuItem>
                        ))}
                        {checklistTemplates.length === 0 && (
                          <DropdownMenuItem disabled>Nenhum modelo salvo</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                  {totalCount > 0 && (
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
                        <span>
                          Progresso ({completedCount}/{totalCount})
                        </span>
                        <span className="text-primary">{Math.round(progress)}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2.5 bg-gray-100 dark:bg-white/10 [&>div]:bg-primary"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 group p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleChecklist(item)}
                          disabled={currentDemand.status === 'Concluído'}
                          className="mt-0.5 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span
                          className={cn(
                            'flex-1 text-sm font-medium leading-tight transition-colors whitespace-pre-wrap break-words',
                            item.completed
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-800 dark:text-gray-200',
                          )}
                        >
                          {item.text}
                        </span>
                        {currentDemand.status !== 'Concluído' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChecklist(item)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 shrink-0 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {checklist.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic p-2 text-center">
                        Nenhum passo adicionado. Use os modelos ou crie abaixo.
                      </p>
                    )}
                  </div>

                  {currentDemand.status !== 'Concluído' && (
                    <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
                      <Input
                        placeholder="Adicionar nova etapa no checklist..."
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                        className="h-10 bg-gray-50 dark:bg-black shadow-inner border-gray-300 dark:border-white/10 text-gray-900 dark:text-white focus-visible:ring-1"
                      />
                      <Button
                        onClick={handleAddChecklist}
                        className="h-10 px-5 shadow-sm font-bold"
                        disabled={!newChecklistText.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Timeline Log */}
          <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col bg-gray-50/50 dark:bg-black/20 border-t lg:border-t-0 border-gray-200 dark:border-border shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-border bg-white dark:bg-card shrink-0 flex items-center justify-between shadow-sm z-10">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Linha do Tempo (Auditoria)
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4 sm:p-6 relative">
              <div className="space-y-6 pb-6">
                {sortedLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-10 opacity-50">
                    <History className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Nenhum registro de auditoria encontrado.
                    </p>
                  </div>
                ) : (
                  sortedLogs.map((log, index) => {
                    const isComment = log.acao === 'Comentário' || log.acao === 'Nova Mensagem'
                    const isAttachment = log.acao === 'Novo Anexo' || log.acao === 'Anexo'
                    const isChecklist =
                      log.acao === 'Checklist Atualizado' || log.acao === 'Checklist'

                    return (
                      <div key={log.id || index} className="relative pl-7 animate-fade-in">
                        {/* Timeline Connector Line */}
                        {index !== sortedLogs.length - 1 && (
                          <div className="absolute left-[13px] top-7 bottom-[-28px] w-px bg-gray-300 dark:bg-white/10" />
                        )}

                        {/* Timeline Icon/Dot */}
                        <div
                          className={cn(
                            'absolute left-0 top-1.5 w-7 h-7 rounded-full border-[3px] border-gray-50 dark:border-card flex items-center justify-center shadow-sm z-10',
                            isComment
                              ? 'bg-blue-100 text-blue-600 border-white'
                              : isAttachment
                                ? 'bg-amber-100 text-amber-600 border-white'
                                : isChecklist
                                  ? 'bg-green-100 text-green-600 border-white'
                                  : 'bg-gray-200 text-gray-600 dark:bg-white/20 dark:text-white/70',
                          )}
                        >
                          {isComment ? (
                            <MessageSquare className="w-3.5 h-3.5" />
                          ) : isAttachment ? (
                            <Paperclip className="w-3.5 h-3.5" />
                          ) : isChecklist ? (
                            <CheckSquare className="w-3.5 h-3.5" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>

                        {/* Log Content Wrapper */}
                        <div className="flex flex-col gap-1.5 pt-1.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                              {log.userName || 'Sistema'}
                            </span>
                            <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap bg-white/50 dark:bg-black/50 px-1.5 py-0.5 rounded">
                              {format(new Date(log.createdAt), 'dd/MM/yy HH:mm')}
                            </span>
                          </div>

                          {/* Render specifics based on log type */}
                          {isComment ? (
                            <div className="mt-1 bg-white dark:bg-card p-3 rounded-tr-xl rounded-b-xl border border-gray-200 dark:border-white/10 shadow-sm text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed relative">
                              <div className="absolute -left-[6px] top-0 w-3 h-3 bg-white dark:bg-card border-l border-t border-gray-200 dark:border-white/10 rotate-[-45deg] -z-10" />
                              {log.detalhes}
                            </div>
                          ) : isAttachment ? (
                            <div className="mt-1 space-y-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                {log.detalhes}
                              </p>
                              {log.dados_novos?.anexos && Array.isArray(log.dados_novos.anexos) && (
                                <div className="flex flex-col gap-2">
                                  {log.dados_novos.anexos.map((att: any, i: number) => {
                                    const fileUrl = att.url?.startsWith('http')
                                      ? att.url
                                      : supabase.storage.from('anexos').getPublicUrl(att.url).data
                                          .publicUrl
                                    return (
                                      <a
                                        key={i}
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 bg-white dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-colors shadow-sm group overflow-hidden"
                                      >
                                        <div className="p-2 rounded bg-gray-100 dark:bg-black/50 text-gray-500 group-hover:text-primary transition-colors shrink-0">
                                          {att.type?.startsWith('image/') ? (
                                            <ImageIcon className="w-4 h-4" />
                                          ) : (
                                            <FileIcon className="w-4 h-4" />
                                          )}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors whitespace-pre-wrap break-words">
                                          {att.name}
                                        </span>
                                      </a>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 dark:text-gray-400 bg-white/50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-transparent whitespace-pre-wrap break-words">
                              <span className="font-bold mr-1 text-gray-900 dark:text-white">
                                {log.acao}:
                              </span>
                              {log.detalhes}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input Section at the Root of Timeline */}
            {currentDemand.status !== 'Concluído' && (
              <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-border bg-white dark:bg-card shrink-0 space-y-3 z-10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
                <Textarea
                  placeholder="Escreva uma observação para a timeline..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[80px] bg-gray-50 dark:bg-black resize-none border-gray-300 dark:border-white/20 text-sm shadow-inner text-gray-900 dark:text-white focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                />
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || isSubmitting}
                    className="bg-white dark:bg-transparent shadow-sm border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white font-medium h-9"
                  >
                    {uploading ? (
                      <span className="animate-pulse">Enviando...</span>
                    ) : (
                      <>
                        <Paperclip className="w-4 h-4 mr-2" /> Anexar Arquivo
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleAddResponse}
                    size="sm"
                    className="shadow-sm gap-2 px-5 h-9 font-bold transition-all"
                    disabled={!responseText.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse flex items-center gap-2">Salvando...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Registrar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
