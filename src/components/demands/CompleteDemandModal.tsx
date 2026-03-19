import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Paperclip, X, File as FileIcon, Image as ImageIcon } from 'lucide-react'
import { Demand, DemandAttachment } from '@/types/demand'
import useDemandStore from '@/stores/useDemandStore'
import { supabase } from '@/lib/supabase/client'
import { sanitizeFilename } from '@/lib/utils'

interface CompleteDemandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demand: Demand
}

export function CompleteDemandModal({ open, onOpenChange, demand }: CompleteDemandModalProps) {
  const { completeDemand } = useDemandStore()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
  }

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const observations = formData.get('observacoes') as string

    const attachments: DemandAttachment[] = []
    for (const file of files) {
      const sanitizedName = sanitizeFilename(file.name)
      const fileName = `${crypto.randomUUID()}_${sanitizedName}`
      const { data, error } = await supabase.storage.from('demandas_anexos').upload(fileName, file)
      if (error) {
        console.error('Error uploading file:', error)
        continue
      }
      if (data) attachments.push({ name: file.name, url: data.path, type: file.type })
    }

    await completeDemand(demand.id, observations, attachments)
    setLoading(false)
    setFiles([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Concluir Demanda</DialogTitle>
            <DialogDescription>
              Insira as observações finais e anexe documentos de entrega se necessário.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações *</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                required
                disabled={loading}
                className="min-h-[100px]"
                placeholder="Detalhes sobre a conclusão da demanda..."
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Anexos Finais</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-green-500 hover:text-green-400 hover:bg-green-500/10 gap-2 px-2 h-8"
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
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white border-transparent"
            >
              {loading ? 'Salvando...' : 'Salvar e Finalizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
