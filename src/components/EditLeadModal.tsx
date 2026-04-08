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
import { useAgendaStore } from '@/stores/useAgendaStore'
import useAuthStore from '@/stores/useAuthStore'
import { ScheduleActionFields } from './ScheduleActionFields'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EditLeadModalProps {
  lead: Lead
}

export function EditLeadModal({ lead }: EditLeadModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [interestStatus, setInterestStatus] = useState<InterestStatus>(
    lead.interestStatus || 'Interessado',
  )

  const [schedEnabled, setSchedEnabled] = useState(false)
  const [schedType, setSchedType] = useState('Lembrete')
  const [schedDate, setSchedDate] = useState('')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDesc, setSchedDesc] = useState('')

  const { updateLead } = useLeadStore()
  const { user } = useAuthStore()
  const salvarEvento = useAgendaStore((state) => state.salvarEvento)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setInterestStatus(lead.interestStatus || 'Interessado')
      setSchedEnabled(false)
    }
  }, [open, lead])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    await updateLead(lead.id, {
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
      interestStatus,
    })

    if (schedEnabled && user) {
      await salvarEvento(
        {
          titulo: schedTitle,
          descricao: schedDesc,
          data_inicio: schedDate,
          data_fim: schedDate,
          tipo: schedType as any,
          lead_id: lead.id,
        },
        user.id,
      )
      toast({
        title: 'Ação Agendada',
        description: 'Lembrete adicionado à sua agenda com sucesso.',
      })
    }

    setIsSubmitting(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-500 dark:text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[500px] p-0"
        onPointerDown={(e) => e.stopPropagation()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Editar Lead</DialogTitle>
              <DialogDescription>Atualize os dados e planeje os próximos passos.</DialogDescription>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-foreground">
                  Nome completo *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={lead.name}
                  required
                  className="bg-background text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-foreground">Status de Interesse *</Label>
                <Select
                  value={interestStatus}
                  onValueChange={(v: InterestStatus) => setInterestStatus(v)}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interessado">Interessado</SelectItem>
                    <SelectItem value="Não Interessado">Não Interessado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-company" className="text-foreground">
                  Empresa
                </Label>
                <Input
                  id="edit-company"
                  name="company"
                  defaultValue={lead.company}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={lead.email}
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone" className="text-foreground">
                    Telefone
                  </Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    defaultValue={lead.phone}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address" className="text-foreground">
                  Endereço Completo
                </Label>
                <Textarea
                  id="edit-address"
                  name="address"
                  defaultValue={lead.address}
                  className="min-h-[60px] bg-background text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes" className="text-foreground">
                  Observações
                </Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={lead.notes}
                  className="bg-background text-foreground"
                />
              </div>

              <ScheduleActionFields
                enabled={schedEnabled}
                setEnabled={setSchedEnabled}
                type={schedType}
                setType={setSchedType}
                date={schedDate}
                setDate={setSchedDate}
                title={schedTitle}
                setTitle={setSchedTitle}
                desc={schedDesc}
                setDesc={setSchedDesc}
              />
            </div>
          </ScrollArea>
          <div className="p-6 pt-4 border-t border-border">
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
