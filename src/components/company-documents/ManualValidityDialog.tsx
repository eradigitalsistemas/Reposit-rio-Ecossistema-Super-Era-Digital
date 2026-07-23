import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ManualValidityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  onSave: (date: string) => void
  onSkip?: () => void
}

export function ManualValidityDialog({
  open,
  onOpenChange,
  fileName,
  onSave,
  onSkip,
}: ManualValidityDialogProps) {
  const [date, setDate] = useState('')

  useEffect(() => {
    if (!open) setDate('')
  }, [open])

  const handleSave = () => {
    if (date) onSave(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Data de Validade
          </DialogTitle>
          <DialogDescription>
            Não foi possível detectar automaticamente a data de validade do documento &ldquo;
            {fileName}&rdquo;. Por favor, informe a data manualmente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="manual-validity-date">Data de Validade</Label>
          <Input
            id="manual-validity-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onSkip?.()
              onOpenChange(false)
            }}
          >
            Pular
          </Button>
          <Button onClick={handleSave} disabled={!date}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
