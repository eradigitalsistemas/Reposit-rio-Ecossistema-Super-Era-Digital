import { useState, useEffect, useRef } from 'react'
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
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import useDemandStore from '@/stores/useDemandStore'

import useAuthStore from '@/stores/useAuthStore'
import { Demand, DemandPriority, DemandAttachment, ChecklistItem } from '@/types/demand'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import {
  Paperclip,
  X,
  Plus,
  File as FileIcon,
  Image as ImageIcon,
  Search,
  Check,
} from 'lucide-react'
import { sanitizeFilename, cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScheduleActionFields } from '../ScheduleActionFields'
import { useToast } from '@/hooks/use-toast'

interface EditDemandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demand: Demand
}

export function EditDemandModal({ open, onOpenChange, demand }: EditDemandModalProps) {
  const { editDemand, collaborators, fetchCollaborators } = useDemandStore()
  const { user } = useAuthStore()

  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<DemandAttachment[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [schedEnabled, setSchedEnabled] = useState(false)
  const [schedType, setSchedType] = useState('Tarefa')
  const [schedDate, setSchedDate] = useState('')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDesc, setSchedDesc] = useState('')

  const [clientsList, setClientsList] = useState<{ id: string; nome: string }[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('none')
  const [clientOpen, setClientOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchCollaborators()
      setSelectedClient(demand.clientId || 'none')

      supabase
        .from('clientes_externos')
        .select('id, nome')
        .order('nome')
        .then(({ data }) => {
          if (data) setClientsList(data)
        })
      setExistingAttachments(demand.attachments || [])
      setChecklist(demand.checklist || [])
      setNewFiles([])
      setSchedEnabled(false)
    }
  }, [open, fetchCollaborators, demand])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)])
  }
  const removeNewFile = (index: number) => setNewFiles((prev) => prev.filter((_, i) => i !== index))
  const removeExistingFile = (index: number) =>
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const attachments: DemandAttachment[] = [...existingAttachments]

    for (const file of newFiles) {
      const sanitizedName = sanitizeFilename(file.name)
      const fileName = `${crypto.randomUUID()}_${sanitizedName}`
      const { data } = await supabase.storage.from('anexos').upload(fileName, file)
      if (data) attachments.push({ name: file.name, url: data.path, type: file.type })
    }

    const dueDateStr = formData.get('dueDate') as string
    const finalDueDate = dueDateStr ? new Date(dueDateStr + 'T12:00:00').toISOString() : null
    const assigneeIdStr = formData.get('assigneeId') as string

    try {
      await editDemand(demand.id, {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        priority: formData.get('priority') as DemandPriority,
        dueDate: finalDueDate,
        assigneeId: assigneeIdStr === 'none' ? null : assigneeIdStr,
        clientId: selectedClient === 'none' ? null : selectedClient,
        attachments,
        checklist,
      })

      if (schedEnabled && user && schedDate) {
        const formattedDate = schedDate.length === 16 ? `${schedDate}:00-03:00` : schedDate
        const { error: agendaError } = await supabase.from('agenda_eventos').insert({
          titulo: schedTitle,
          descricao: schedDesc,
          data_inicio: formattedDate,
          data_fim: formattedDate,
          tipo: schedType as any,
          demanda_id: demand.id,
          usuario_id: user.id,
        })
        if (agendaError) throw agendaError
        toast({ title: 'Ação Agendada', description: 'O lembrete da demanda foi atualizado.' })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultDueDate = demand.dueDate ? format(new Date(demand.dueDate), 'yyyy-MM-dd') : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-[550px] p-0"
        onClick={(e) => e.stopPropagation()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Demanda</DialogTitle>
              <DialogDescription>
                Modifique as informações e agende os próximos passos.
              </DialogDescription>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-foreground">
                  Título *
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={demand.title}
                  required
                  disabled={loading}
                  className="bg-background text-foreground"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-foreground">Cliente</Label>
                <Popover open={clientOpen} onOpenChange={setClientOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clientOpen}
                      className="w-full justify-between bg-background text-foreground border-input"
                      disabled={loading}
                    >
                      {selectedClient === 'none'
                        ? 'Selecione um cliente...'
                        : clientsList.find((c) => c.id === selectedClient)?.nome ||
                          'Selecione um cliente...'}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="nenhum cliente"
                            onSelect={() => {
                              setSelectedClient('none')
                              setClientOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedClient === 'none' ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            Nenhum cliente
                          </CommandItem>
                          {clientsList.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.nome}
                              onSelect={() => {
                                setSelectedClient(client.id)
                                setClientOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedClient === client.id ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {client.nome}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="text-foreground">
                    Prioridade
                  </Label>
                  <Select name="priority" defaultValue={demand.priority} disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground">
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
                  <Label htmlFor="dueDate" className="text-foreground">
                    Vencimento
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={defaultDueDate}
                    className="bg-background text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigneeId" className="text-foreground">
                  Responsável
                </Label>
                <Select
                  name="assigneeId"
                  defaultValue={demand.assigneeId || 'none'}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-background text-foreground">
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
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-foreground">Itens do Checklist</Label>
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
                          placeholder="Passo da tarefa"
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
                <Label htmlFor="description" className="text-foreground">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={demand.description}
                  className="min-h-[80px] bg-background text-foreground"
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
                  <Label className="text-foreground">Anexos</Label>
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
                {(existingAttachments.length > 0 || newFiles.length > 0) && (
                  <div className="space-y-2 mt-1 max-h-32 overflow-y-auto pr-1">
                    {existingAttachments.map((file, i) => {
                      const fileUrl = supabase.storage.from('anexos').getPublicUrl(file.url)
                        .data.publicUrl
                      return (
                        <div
                          key={`ext-${i}`}
                          className="flex items-center justify-between bg-muted/50 border border-border rounded-md p-2 text-sm"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <FileIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
                            )}
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={file.name}
                              className="truncate text-primary hover:underline text-left cursor-pointer"
                            >
                              {file.name}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingFile(i)}
                            className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                    {newFiles.map((file, i) => (
                      <div
                        key={`new-${i}`}
                        className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-md p-2 text-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 shrink-0 text-primary/50" />
                          ) : (
                            <FileIcon className="w-4 h-4 shrink-0 text-primary/50" />
                          )}
                          <span className="truncate text-primary/80">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFile(i)}
                          className="text-primary/50 hover:text-primary shrink-0 p-1"
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
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-full sm:w-auto text-primary-foreground"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
