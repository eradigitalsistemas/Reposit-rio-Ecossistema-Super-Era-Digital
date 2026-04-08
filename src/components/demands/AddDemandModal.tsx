import { useState, useEffect, useRef } from 'react'
import { Plus, Paperclip, X, File as FileIcon, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { DemandPriority, DemandStatus, DemandAttachment, ChecklistItem } from '@/types/demand'
import { supabase } from '@/lib/supabase/client'
import { sanitizeFilename } from '@/lib/utils'
import { ScheduleActionFields } from '../ScheduleActionFields'
import { useToast } from '@/hooks/use-toast'

export function AddDemandModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [schedEnabled, setSchedEnabled] = useState(false)
  const [schedType, setSchedType] = useState('Tarefa')
  const [schedDate, setSchedDate] = useState('')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDesc, setSchedDesc] = useState('')

  const { user } = useAuthStore()
  const { toast } = useToast()

  const {
    addDemand,
    collaborators,
    fetchCollaborators,
    checklistTemplates,
    fetchChecklistTemplates,
  } = useDemandStore()

  useEffect(() => {
    if (open) {
      fetchCollaborators()
      fetchChecklistTemplates()
      setSchedEnabled(false)
    }
  }, [open, fetchCollaborators, fetchChecklistTemplates])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
  }
  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index))

  const handleTemplateChange = (val: string) => {
    setSelectedTemplate(val)
    if (val !== 'none') {
      const template = checklistTemplates.find((t) => t.id === val)
      if (template) {
        setChecklist(
          template.itens.map((text) => ({
            id: crypto.randomUUID(),
            text,
            completed: false,
          })),
        )
      }
    } else {
      setChecklist([])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const assigneeIdStr = formData.get('assigneeId') as string
    const demandTitle = formData.get('title') as string

    const dueDateStr = formData.get('dueDate') as string
    const finalDueDate = dueDateStr ? new Date(dueDateStr + 'T12:00:00').toISOString() : null

    const attachments: DemandAttachment[] = []
    for (const file of files) {
      const sanitizedName = sanitizeFilename(file.name)
      const fileName = `${crypto.randomUUID()}_${sanitizedName}`
      const { data, error } = await supabase.storage.from('anexos').upload(fileName, file)
      if (error) continue
      if (data) attachments.push({ name: file.name, url: data.path, type: file.type })
    }

    try {
      const newDemand = await addDemand({
        title: demandTitle,
        description: formData.get('description') as string,
        priority: formData.get('priority') as DemandPriority,
        status: formData.get('status') as DemandStatus,
        dueDate: finalDueDate,
        assigneeId: assigneeIdStr === 'none' ? null : assigneeIdStr,
        attachments,
        checklist,
      })

      if (newDemand && schedEnabled && user && schedDate) {
        const formattedDate = schedDate.length === 16 ? `${schedDate}:00-03:00` : schedDate
        const { error: agendaError } = await supabase.from('agenda_eventos').insert({
          titulo: schedTitle,
          descricao: schedDesc,
          data_inicio: formattedDate,
          data_fim: formattedDate,
          tipo: schedType as any,
          demanda_id: newDemand.id,
          usuario_id: user.id,
        })
        if (agendaError) throw agendaError
        toast({
          title: 'Demanda e Ação Salvas',
          description: 'Ação agendada na agenda com sucesso.',
        })
      } else if (newDemand) {
        toast({ title: 'Demanda Criada', description: 'Sua demanda foi cadastrada com sucesso.' })
      }

      setFiles([])
      setSelectedTemplate('none')
      setChecklist([])
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar a demanda ou a ação.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 w-full sm:w-auto h-11 sm:h-10 text-primary-foreground"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="sm:inline font-bold">Nova Demanda</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[550px] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Criar Nova Demanda</DialogTitle>
              <DialogDescription>
                Adicione uma nova tarefa e planeje as próximas ações.
              </DialogDescription>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-foreground font-medium">
                  Título *
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  disabled={loading}
                  className="bg-background text-foreground border-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="text-foreground font-medium">
                    Urgência
                  </Label>
                  <Select name="priority" defaultValue="Pode Ficar para Amanhã" disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pode Ficar para Amanhã">Ficar para Amanhã</SelectItem>
                      <SelectItem value="Durante o Dia">Durante o Dia</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-foreground font-medium">
                    Status Inicial
                  </Label>
                  <Select name="status" defaultValue="Pendente" disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assigneeId" className="text-foreground font-medium">
                    Responsável
                  </Label>
                  <Select name="assigneeId" defaultValue="none" disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não Atribuído</SelectItem>
                      {collaborators.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate" className="text-foreground font-medium">
                    Vencimento
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    className="bg-background text-foreground border-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground font-medium">Importar Checklist</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-background text-foreground border-input">
                    <SelectValue placeholder="Sem checklist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem checklist</SelectItem>
                    {checklistTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Itens do Checklist</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setChecklist([
                        ...checklist,
                        { id: crypto.randomUUID(), text: '', completed: false },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </div>
                {checklist.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Input
                          value={item.text}
                          onChange={(e) =>
                            setChecklist(
                              checklist.map((c) =>
                                c.id === item.id ? { ...c, text: e.target.value } : c,
                              ),
                            )
                          }
                          placeholder="Passo"
                          className="flex-1 h-9 bg-background text-foreground"
                        />
                        <Input
                          type="datetime-local"
                          value={item.dueDate || ''}
                          onChange={(e) =>
                            setChecklist(
                              checklist.map((c) =>
                                c.id === item.id ? { ...c, dueDate: e.target.value } : c,
                              ),
                            )
                          }
                          className="w-[180px] h-9 bg-background text-foreground"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setChecklist(checklist.filter((c) => c.id !== item.id))}
                          className="h-9 w-9 text-red-500 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-foreground font-medium">
                  Descrição / Detalhes
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="min-h-[80px] bg-background text-foreground border-input"
                  disabled={loading}
                />
              </div>

              <ScheduleActionFields
                enabled={schedEnabled}
                setEnabled={setSchedEnabled}
                type={schedType}
                setType={setSchedType}
                date={schedDate}
                setDate={setSchedDate}
                title={schedTitle}
                setTitle={setSchedTitle}
                desc={schedDesc}
                setDesc={setSchedDesc}
              />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Anexos</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 gap-2 h-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Paperclip className="w-4 h-4" /> Adicionar
                  </Button>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                {files.length > 0 && (
                  <div className="space-y-2 mt-1 max-h-32 overflow-y-auto pr-1">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-muted/50 border border-border rounded-md p-2 text-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <FileIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate text-foreground">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="p-6 pt-4 border-t border-border">
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-full sm:w-auto font-bold"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Demanda'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
