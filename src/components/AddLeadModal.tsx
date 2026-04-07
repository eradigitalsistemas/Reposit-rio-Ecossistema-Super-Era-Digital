import { useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import useLeadStore from '@/stores/useLeadStore'
import { InterestStatus } from '@/types/crm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AddLeadModal() {
  const [open, setOpen] = useState(false)
  const [interestStatus, setInterestStatus] = useState<InterestStatus>('Interessado')
  const { addLead } = useLeadStore()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    addLead({
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
      stage: 'novo_lead',
      interestStatus,
    })

    setOpen(false)
    setInterestStatus('Interessado')
    toast({
      title: 'Lead criado',
      description: 'O novo lead foi adicionado ao Era Digital Vendas com sucesso.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 shrink-0 h-10 sm:h-10 w-10 sm:w-auto p-0 sm:px-4 sm:py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Novo Lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[450px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Adicionar Novo Lead
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Preencha os dados abaixo para cadastrar um novo lead.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-slate-900 dark:text-slate-100">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-900 dark:text-slate-100">
                Nome completo *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: João da Silva"
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
              <Label htmlFor="company" className="text-slate-900 dark:text-slate-100">
                Empresa
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="Ex: Acme Corp"
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-900 dark:text-slate-100">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="joao@exemplo.com"
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-slate-900 dark:text-slate-100">
                Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(00) 00000-0000"
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-slate-900 dark:text-slate-100">
                Observações
              </Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Detalhes adicionais..."
                className="text-slate-900 dark:text-slate-100 bg-transparent border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              Salvar Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
