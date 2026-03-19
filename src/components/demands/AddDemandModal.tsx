import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
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
import { DemandPriority, DemandStatus } from '@/types/demand'

export function AddDemandModal() {
  const [open, setOpen] = useState(false)
  const { addDemand, collaborators, fetchCollaborators } = useDemandStore()

  // Pre-fetch collaborators to ensure we have the latest list when opening the modal
  useEffect(() => {
    if (open) {
      fetchCollaborators()
    }
  }, [open, fetchCollaborators])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const assigneeIdStr = formData.get('assigneeId') as string

    addDemand({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as DemandPriority,
      status: formData.get('status') as DemandStatus,
      dueDate: formData.get('dueDate') as string,
      assigneeId: assigneeIdStr === 'none' ? null : assigneeIdStr,
    })

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
      <DialogContent className="w-[95vw] sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Demanda</DialogTitle>
            <DialogDescription>
              Adicione uma nova tarefa e atribua a um colaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select name="priority" defaultValue="Pode Ficar para Amanhã">
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
                <Label htmlFor="status">Status Inicial</Label>
                <Select name="status" defaultValue="Pendente">
                  <SelectTrigger className="h-11 sm:h-10">
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
                <Label htmlFor="assigneeId">Atribuir para</Label>
                <Select name="assigneeId" defaultValue="none">
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
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input id="dueDate" name="dueDate" type="date" className="h-11 sm:h-10" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição / Detalhes</Label>
              <Textarea id="description" name="description" className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto mb-2 sm:mb-0 h-11 sm:h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto h-11 sm:h-10 text-black font-bold"
            >
              Criar Demanda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
