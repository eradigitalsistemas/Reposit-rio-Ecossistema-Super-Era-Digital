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
import useDemandStore from '@/stores/useDemandStore'
import { Demand, DemandPriority, DemandAttachment } from '@/types/demand'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Paperclip, X, File as FileIcon, Image as ImageIcon } from 'lucide-react'
import { sanitizeFilename } from '@/lib/utils'

interface EditDemandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demand: Demand
}

export function EditDemandModal({ open, onOpenChange, demand }: EditDemandModalProps) {
  const { editDemand, collaborators, fetchCollaborators } = useDemandStore()
  const [loading, setLoading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<DemandAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      fetchCollaborators()
      setExistingAttachments(demand.attachments || [])
      setNewFiles([])
    }
  }, [open, fetchCollaborators, demand.attachments])

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
      const { data } = await supabase.storage.from('demandas_anexos').upload(fileName, file)
      if (data) attachments.push({ name: file.name, url: data.path, type: file.type })
    }

    const dueDate = formData.get('dueDate') as string
    const assigneeIdStr = formData.get('assigneeId') as string

    await editDemand(demand.id, {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as DemandPriority,
      dueDate: dueDate || null,
      assigneeId: assigneeIdStr === 'none' ? null : assigneeIdStr,
      attachments,
    })

    setLoading(false)
    onOpenChange(false)
  }

  const defaultDueDate = demand.dueDate ? format(new Date(demand.dueDate), 'yyyy-MM-dd') : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Demanda</DialogTitle>
            <DialogDescription>Modifique as informações da demanda abaixo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={demand.title}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select name="priority" defaultValue={demand.priority} disabled={loading}>
                  <SelectTrigger className="h-11 sm:h-10">
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
                <Label htmlFor="dueDate">Vencimento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={defaultDueDate}
                  className="h-11 sm:h-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assigneeId">Responsável</Label>
              <Select
                name="assigneeId"
                defaultValue={demand.assigneeId || 'none'}
                disabled={loading}
              >
                <SelectTrigger className="h-11 sm:h-10">
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
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={demand.description}
                className="min-h-[80px]"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Anexos</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2 px-2 h-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Paperclip className="w-4 h-4" />
                  Adicionar
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
                    const fileUrl = supabase.storage.from('demandas_anexos').getPublicUrl(file.url)
                      .data.publicUrl
                    return (
                      <div
                        key={`ext-${i}`}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-md p-2 text-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 shrink-0 text-white/50" />
                          ) : (
                            <FileIcon className="w-4 h-4 shrink-0 text-white/50" />
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
                          className="text-white/50 hover:text-white shrink-0 p-1"
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
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto mb-2 sm:mb-0 h-11 sm:h-10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto h-11 sm:h-10 text-black"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
