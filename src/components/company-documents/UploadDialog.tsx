import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DocumentCategory } from '@/services/company-documents'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: File[]
  onConfirm: (category: DocumentCategory, expiryDate: string | null) => void
  uploading: boolean
  uploadProgress: number
}

export function UploadDialog({
  open,
  onOpenChange,
  files,
  onConfirm,
  uploading,
  uploadProgress,
}: UploadDialogProps) {
  const [category, setCategory] = useState<DocumentCategory>('Constituição')
  const [expiryDate, setExpiryDate] = useState('')

  const handleConfirm = () => {
    onConfirm(category, category === 'Certidões e Afins' && expiryDate ? expiryDate : null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !uploading && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Classificar Documento(s)</DialogTitle>
          <DialogDescription>
            {files.length} arquivo(s) selecionado(s). Escolha a categoria antes do upload.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Constituição">Constituição</SelectItem>
                <SelectItem value="Certidões e Afins">Certidões e Afins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {category === 'Certidões e Afins' && (
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Data de Vencimento</Label>
              <Input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado para certidões e alvarás com prazo de validade.
              </p>
            </div>
          )}
          <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Arquivos:</p>
            <ul className="space-y-0.5">
              {files.map((f, i) => (
                <li key={i} className="truncate">
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
          {uploading && (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Enviando...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={uploading} className="gap-2">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Confirmar Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
