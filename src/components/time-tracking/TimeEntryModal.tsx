import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  if (!isOpen || !type) return null

  const getLabel = (t: string) => {
    switch (t) {
      case 'entrada':
        return 'Entrada'
      case 'intervalo_saida':
        return 'Saída para Intervalo'
      case 'intervalo_entrada':
        return 'Retorno do Intervalo'
      case 'saida':
        return 'Saída'
      default:
        return ''
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

  const timeString = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentTime)
  const dateString = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md border shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Confirmar {getLabel(type)}?</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-secondary/50 rounded-xl">
            <span className="text-5xl font-mono font-bold tracking-tighter text-primary">
              {timeString}
            </span>
            <span className="text-sm text-muted-foreground mt-2 capitalize">{dateString}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas (opcional)</label>
            <textarea
              className="w-full min-h-[100px] p-3 text-sm rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Adicione uma observação sobre este registro..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="min-w-[120px] rounded-xl"
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
