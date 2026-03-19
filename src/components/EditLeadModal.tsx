import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Lead } from '@/types/crm'
import useLeadStore from '@/stores/useLeadStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface EditLeadModalProps {
  lead: Lead
}

export function EditLeadModal({ lead }: EditLeadModalProps) {
  const [open, setOpen] = useState(false)
  const { updateLead } = useLeadStore()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const formData = new FormData(e.currentTarget)

    updateLead(lead.id, {
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[450px]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>Atualize os dados do lead abaixo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome completo *</Label>
              <Input id="edit-name" name="name" defaultValue={lead.name} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company">Empresa</Label>
              <Input id="edit-company" name="company" defaultValue={lead.company} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input id="edit-email" name="email" type="email" defaultValue={lead.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input id="edit-phone" name="phone" defaultValue={lead.phone} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Textarea id="edit-notes" name="notes" defaultValue={lead.notes} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
