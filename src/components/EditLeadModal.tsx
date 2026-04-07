import { useState, useEffect } from 'react'
import { Edit2 } from 'lucide-react'
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
import { Lead, InterestStatus } from '@/types/crm'
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
  const [interestStatus, setInterestStatus] = useState<InterestStatus>(
    lead.interestStatus || 'Interessado',
  )
  const { updateLead } = useLeadStore()

  useEffect(() => {
    setInterestStatus(lead.interestStatus || 'Interessado')
  }, [lead.interestStatus])

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
      interestStatus,
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-primary hover:bg-white/10"
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
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Editar Lead</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Atualize os dados do lead abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-slate-900 dark:text-slate-100">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-slate-900 dark:text-slate-100">
                Nome completo *
              </Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={lead.name}
                required
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-900 dark:text-slate-100">Status de Interesse *</Label>
              <Select
                value={interestStatus}
                onValueChange={(v: InterestStatus) => setInterestStatus(v)}
              >
                <SelectTrigger className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                  <SelectItem
                    value="Interessado"
                    className="text-slate-900 dark:text-slate-100 focus:bg-slate-100 dark:focus:bg-zinc-800"
                  >
                    Interessado
                  </SelectItem>
                  <SelectItem
                    value="Não Interessado"
                    className="text-slate-900 dark:text-slate-100 focus:bg-slate-100 dark:focus:bg-zinc-800"
                  >
                    Não Interessado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-company" className="text-slate-900 dark:text-slate-100">
                Empresa
              </Label>
              <Input
                id="edit-company"
                name="company"
                defaultValue={lead.company}
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="text-slate-900 dark:text-slate-100">
                E-mail
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={lead.email}
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone" className="text-slate-900 dark:text-slate-100">
                Telefone
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                defaultValue={lead.phone}
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes" className="text-slate-900 dark:text-slate-100">
                Observações
              </Label>
              <Textarea
                id="edit-notes"
                name="notes"
                defaultValue={lead.notes}
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
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
              className="w-full sm:w-auto text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
