import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { EventoAgenda, useAgendaStore } from '@/stores/useAgendaStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Trash2 } from 'lucide-react'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  eventoToEdit: EventoAgenda | null
  onSuccess: () => void
}

export function EventDialog({
  open,
  onOpenChange,
  selectedDate,
  eventoToEdit,
  onSuccess,
}: EventDialogProps) {
  const { salvarEvento, deletarEvento } = useAgendaStore()
  const { user, role } = useAuthStore()
  const { toast } = useToast()
  const isAdmin = role === 'Admin' || role === 'Patrão'

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<EventoAgenda>>({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'Evento',
    privado: false,
  })

  useEffect(() => {
    if (eventoToEdit) {
      setFormData({
        id: eventoToEdit.id,
        titulo: eventoToEdit.titulo,
        descricao: eventoToEdit.descricao,
        data_inicio: eventoToEdit.data_inicio.slice(0, 16),
        data_fim: eventoToEdit.data_fim.slice(0, 16),
        tipo: eventoToEdit.tipo,
        privado: eventoToEdit.privado,
      })
    } else if (selectedDate) {
      const initDate = new Date(selectedDate)
      initDate.setHours(9, 0, 0, 0)
      const dInicio = new Date(initDate.getTime() - initDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      const dFim = new Date(initDate.getTime() - initDate.getTimezoneOffset() * 60000 + 3600000)
        .toISOString()
        .slice(0, 16)

      setFormData({
        titulo: '',
        descricao: '',
        data_inicio: dInicio,
        data_fim: dFim,
        tipo: 'Evento',
        privado: false,
      })
    }
  }, [eventoToEdit, selectedDate, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const payload = {
      ...formData,
      data_inicio: new Date(formData.data_inicio as string).toISOString(),
      data_fim: new Date(formData.data_fim as string).toISOString(),
    }

    const { error } = await salvarEvento(payload, user.id)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar evento', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Evento salvo com sucesso.' })
    onSuccess()
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!eventoToEdit?.id) return
    if (!confirm('Deseja realmente excluir este evento?')) return

    setLoading(true)
    const { error } = await deletarEvento(eventoToEdit.id)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Evento excluído.' })
    onSuccess()
    onOpenChange(false)
  }

  const isReadOnly =
    eventoToEdit?.isDemanda || (eventoToEdit && eventoToEdit.usuario_id !== user?.id && !isAdmin)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {eventoToEdit
              ? isReadOnly
                ? 'Detalhes do Compromisso'
                : 'Editar Compromisso'
              : 'Novo Compromisso'}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? 'Este é um evento em formato de visualização.'
              : 'Preencha os detalhes para agendar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Título do Evento</Label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              disabled={isReadOnly}
              placeholder="Ex: Reunião de Alinhamento"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data/Hora Início</Label>
              <Input
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label>Data/Hora Fim</Label>
              <Input
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                required
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tipo de Compromisso</Label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Evento">Evento</SelectItem>
                <SelectItem value="Tarefa">Tarefa</SelectItem>
                <SelectItem value="Lembrete">Lembrete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Descrição / Notas</Label>
            <Textarea
              value={formData.descricao || ''}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              disabled={isReadOnly}
              placeholder="Adicione detalhes adicionais aqui..."
            />
          </div>

          {!isReadOnly && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="privado"
                checked={formData.privado}
                onCheckedChange={(c) => setFormData({ ...formData, privado: c === true })}
              />
              <Label htmlFor="privado" className="font-normal cursor-pointer">
                Evento Privado (Visível apenas para mim)
              </Label>
            </div>
          )}

          <DialogFooter className="pt-4 border-t flex justify-between sm:justify-between items-center w-full">
            {eventoToEdit && !isReadOnly && !eventoToEdit.isDemanda ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isReadOnly ? 'Fechar' : 'Cancelar'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {eventoToEdit ? 'Atualizar' : 'Registrar'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
