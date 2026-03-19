import { useState } from 'react'
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
import { Demand, DemandPriority } from '@/types/demand'
import { format } from 'date-fns'

interface EditDemandModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demand: Demand
}

export function EditDemandModal({ open, onOpenChange, demand }: EditDemandModalProps) {
  const { editDemand, collaborators } = useDemandStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const dueDate = formData.get('dueDate') as string
    const assigneeIdStr = formData.get('assigneeId') as string

    await editDemand(demand.id, {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as DemandPriority,
      dueDate: dueDate || null,
      assigneeId: assigneeIdStr === 'none' ? null : assigneeIdStr,
    })

    setLoading(false)
    onOpenChange(false)
  }

  // Pre-format date for the input
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
              <Input id="title" name="title" defaultValue={demand.title} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select name="priority" defaultValue={demand.priority}>
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
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={defaultDueDate}
                  className="h-11 sm:h-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assigneeId">Responsável</Label>
              <Select name="assigneeId" defaultValue={demand.assigneeId || 'none'}>
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
              <Label htmlFor="description">Descrição / Detalhes</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={demand.description}
                className="min-h-[100px]"
              />
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
            <Button type="submit" className="w-full sm:w-auto h-11 sm:h-10" disabled={loading}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
