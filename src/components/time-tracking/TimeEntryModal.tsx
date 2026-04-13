import { useState, useEffect } from 'react'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'

interface TimeEntryModalProps {
  isOpen: boolean
  type: 'entrada' | 'intervalo_saida' | 'intervalo_entrada' | 'saida' | null
  onConfirm: (notes: string) => Promise<void>
  onCancel: () => void
}

export function TimeEntryModal({ isOpen, type, onConfirm, onCancel }: TimeEntryModalProps) {
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (isOpen) {
      setNotes('')
      setCurrentTime(new Date())
      const timer = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen])

  const getTitle = () => {
    switch (type) {
      case 'entrada':
        return 'Confirmar Entrada'
      case 'intervalo_saida':
        return 'Confirmar Saída para Intervalo'
      case 'intervalo_entrada':
        return 'Confirmar Retorno do Intervalo'
      case 'saida':
        return 'Confirmar Saída'
      default:
        return 'Confirmar'
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{getTitle()}</DialogTitle>
          <DialogDescription>Confirme os detalhes do seu registro de ponto.</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-xl">
            <span className="text-5xl font-mono font-bold tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </span>
            <span className="text-muted-foreground mt-2 capitalize">
              {format(currentTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <Textarea
              placeholder="Adicione uma observação sobre este registro..."
              className="resize-none h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirmar Registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
