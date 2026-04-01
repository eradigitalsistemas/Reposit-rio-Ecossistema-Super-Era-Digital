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
import useDemandStore from '@/stores/useDemandStore'
import { DemandPriority, DemandStatus, DemandAttachment } from '@/types/demand'
import { supabase } from '@/lib/supabase/client'
import { sanitizeFilename } from '@/lib/utils'

export function AddDemandModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    }
  }, [open, fetchCollaborators, fetchChecklistTemplates])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
  }
  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const assigneeIdStr = formData.get('assigneeId') as string

    const attachments: DemandAttachment[] = []
    for (const file of files) {
      const sanitizedName = sanitizeFilename(file.name)
      const fileName = `${crypto.randomUUID()}_${sanitizedName}`
      const { data, error } = await supabase.storage.from('anexos').upload(fileName, file)
      if (error) {
        continue
      }
      if (data) attachments.push({ name: file.name, url: data.path, type: file.type })
    }

    let checklist: import('@/types/demand').ChecklistItem[] = []
    if (selectedTemplate !== 'none') {
      const template = checklistTemplates.find((t) => t.id === selectedTemplate)
      if (template) {
        checklist = template.itens.map((text) => ({
          id: crypto.randomUUID(),
          text,
          completed: false,
        }))
      }
    }

    await addDemand({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as DemandPriority,
      status: formData.get('status') as DemandStatus,
      dueDate: formData.get('dueDate') as string,
      assigneeId: assigneeIdStr === 'none' ? null : assigneeIdStr,
      attachments,
      checklist,
    })

    setLoading(false)
    setFiles([])
    setSelectedTemplate('none')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 w-full sm:w-auto h-11 sm:h-10 text-black">
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="sm:inline font-bold">Nova Demanda</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Criar Nova Demanda</DialogTitle>
            <DialogDescription>
              Adicione uma nova tarefa e atribua a um colaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-black dark:text-white font-medium">
                Título *
              </Label>
              <Input
                id="title"
                name="title"
                required
                disabled={loading}
                className="bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white h-11 sm:h-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-black dark:text-white font-medium">
                  Urgência
                </Label>
                <Select name="priority" defaultValue="Pode Ficar para Amanhã" disabled={loading}>
                  <SelectTrigger className="h-11 sm:h-10 bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white">
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
                <Label htmlFor="status" className="text-black dark:text-white font-medium">
                  Status Inicial
                </Label>
                <Select name="status" defaultValue="Pendente" disabled={loading}>
                  <SelectTrigger className="h-11 sm:h-10 bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white">
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
                <Label htmlFor="assigneeId" className="text-black dark:text-white font-medium">
                  Responsável
                </Label>
                <Select name="assigneeId" defaultValue="none" disabled={loading}>
                  <SelectTrigger className="h-11 sm:h-10 bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white">
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
                <Label htmlFor="dueDate" className="text-black dark:text-white font-medium">
                  Vencimento
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className="h-11 sm:h-10 bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="templateId" className="text-black dark:text-white font-medium">
                Importar Checklist
              </Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={loading}
              >
                <SelectTrigger className="h-11 sm:h-10 bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white">
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
              <Label htmlFor="description" className="text-black dark:text-white font-medium">
                Descrição / Detalhes
              </Label>
              <Textarea
                id="description"
                name="description"
                className="min-h-[80px] bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-black dark:text-white font-medium">Anexos</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2 px-2 h-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Paperclip className="w-4 h-4" />
                  Adicionar Arquivos
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
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-md p-2 text-sm"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 shrink-0 text-white/50" />
                        ) : (
                          <FileIcon className="w-4 h-4 shrink-0 text-white/50" />
                        )}
                        <span className="truncate text-white/80">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-white/50 hover:text-white shrink-0 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto mb-2 sm:mb-0 h-11 sm:h-10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto h-11 sm:h-10 text-white font-bold bg-black dark:bg-primary"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Demanda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
