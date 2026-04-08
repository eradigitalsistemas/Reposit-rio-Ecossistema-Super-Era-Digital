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
import { Loader2, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  eventoToEdit: EventoAgenda | null
  onSuccess: () => void
}

const toGMT3String = (isoString: string) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  // Lê o horário como se o usuário estivesse fisicamente no fuso GMT-3
  const gmt3Date = new Date(d.getTime() - 3 * 60 * 60 * 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${gmt3Date.getUTCFullYear()}-${pad(gmt3Date.getUTCMonth() + 1)}-${pad(gmt3Date.getUTCDate())}T${pad(gmt3Date.getUTCHours())}:${pad(gmt3Date.getUTCMinutes())}`
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [formData, setFormData] = useState<Partial<EventoAgenda>>({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'Evento',
    privado: false,
    cliente_id: 'none',
    criado_por: '',
  })

  useEffect(() => {
    supabase
      .from('clientes_externos')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => {
        if (data) setClientes(data)
      })
  }, [])

  useEffect(() => {
    if (open) {
      if (eventoToEdit) {
        setIsEditMode(false)
        setFormData({
          id: eventoToEdit.id,
          titulo: eventoToEdit.titulo,
          descricao: eventoToEdit.descricao,
          data_inicio: toGMT3String(eventoToEdit.data_inicio),
          tipo: eventoToEdit.tipo,
          privado: eventoToEdit.privado,
          cliente_id: eventoToEdit.cliente_id || 'none',
          criado_por: eventoToEdit.criado_por || '',
        })
      } else if (selectedDate) {
        setIsEditMode(true)
        const initDate = new Date(selectedDate)
        initDate.setHours(9, 0, 0, 0)

        const pad = (n: number) => n.toString().padStart(2, '0')
        const formatLocal = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

        setFormData({
          titulo: '',
          descricao: '',
          data_inicio: formatLocal(initDate),
          tipo: 'Evento',
          privado: false,
          cliente_id: 'none',
          criado_por: '',
        })
      }
    }
  }, [eventoToEdit, selectedDate, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    // Força o offset GMT-3 ao salvar para garantir que a intenção original
    // do usuário seja registrada corretamente no banco sem adicionar horas
    const formatToSave = (localDatetime: string | undefined) => {
      if (!localDatetime) return new Date().toISOString()
      if (localDatetime.length === 16) return `${localDatetime}:00-03:00`
      return localDatetime
    }

    const payload = {
      ...formData,
      data_inicio: formatToSave(formData.data_inicio as string),
      data_fim: formatToSave(formData.data_inicio as string),
      cliente_id: formData.cliente_id === 'none' ? null : formData.cliente_id,
      criado_por: formData.criado_por || user.user_metadata?.full_name || user.email || 'Usuário',
    }

    try {
      const { error } = await salvarEvento(payload, user.id)

      if (error) {
        throw error
      }

      toast({ title: 'Sucesso', description: 'Evento salvo com sucesso.' })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error)
      toast({
        title: 'Erro ao salvar evento',
        description: error.message || 'Falha na comunicação com o banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
    eventoToEdit?.isDemanda ||
    (eventoToEdit && !isEditMode) ||
    (eventoToEdit && eventoToEdit.usuario_id !== user?.id && !isAdmin)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-1">
              <DialogTitle>
                {eventoToEdit
                  ? isEditMode
                    ? 'Editar Compromisso'
                    : 'Detalhes do Compromisso'
                  : 'Novo Compromisso'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Preencha os detalhes para agendar.'
                  : 'Este é um evento em formato de visualização.'}
              </DialogDescription>
            </div>
            {eventoToEdit &&
              !eventoToEdit.isDemanda &&
              (isAdmin || eventoToEdit.usuario_id === user?.id) &&
              !isEditMode && (
                <div className="flex items-center gap-1 pr-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditMode(true)}
                    className="h-8 w-8 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="h-8 w-8 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {eventoToEdit && eventoToEdit.criado_por && (
            <div className="text-sm text-gray-700 bg-white border border-gray-200 p-3 rounded-md shadow-sm flex items-center gap-2">
              <span className="font-semibold text-black">Feito por:</span> {eventoToEdit.criado_por}
            </div>
          )}

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

          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100 font-bold">Data e Hora</Label>
            <Input
              type="datetime-local"
              value={formData.data_inicio || ''}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              required
              disabled={isReadOnly}
              className="bg-white text-black border-gray-300 dark:bg-zinc-950 dark:text-white dark:border-zinc-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-gray-900 dark:text-gray-100 font-bold">
                Tipo de Compromisso
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-white text-black border-gray-300 dark:bg-zinc-950 dark:text-white dark:border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-300 dark:bg-zinc-950 dark:text-white dark:border-zinc-800">
                  <SelectItem value="Evento" className="text-black dark:text-white">
                    Evento
                  </SelectItem>
                  <SelectItem value="Tarefa" className="text-black dark:text-white">
                    Tarefa
                  </SelectItem>
                  <SelectItem value="Lembrete" className="text-black dark:text-white">
                    Lembrete
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-900 dark:text-gray-100 font-bold">Vincular Cliente</Label>
              <Select
                value={formData.cliente_id || 'none'}
                onValueChange={(v) => setFormData({ ...formData, cliente_id: v })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-white text-black border-gray-300 dark:bg-zinc-950 dark:text-white dark:border-zinc-800">
                  <SelectValue placeholder="Nenhum cliente" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-gray-300 dark:bg-zinc-950 dark:text-white dark:border-zinc-800">
                  <SelectItem value="none" className="text-black dark:text-white">
                    Nenhum cliente
                  </SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-black dark:text-white">
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <DialogFooter className="pt-4 border-t flex justify-end items-center w-full">
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
