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
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { InterestStatus } from '@/types/crm'
import { ScheduleActionFields } from './ScheduleActionFields'
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

export function AddLeadModal() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [interestStatus, setInterestStatus] = useState<InterestStatus>('Interessado')

  const [schedEnabled, setSchedEnabled] = useState(false)
  const [schedType, setSchedType] = useState('Lembrete')
  const [schedDate, setSchedDate] = useState('')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDesc, setSchedDesc] = useState('')

  const { addLead } = useLeadStore()
  const { user } = useAuthStore()

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)

      const newLead = await addLead({
        name: formData.get('name') as string,
        company: formData.get('company') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        notes: formData.get('notes') as string,
        stage: 'novo_lead',
        interestStatus,
      })

      if (newLead && schedEnabled && user && schedDate) {
        const formattedDate = schedDate.length === 16 ? `${schedDate}:00-03:00` : schedDate
        const { error: agendaError } = await supabase.from('agenda_eventos').insert({
          titulo: schedTitle,
          descricao: schedDesc,
          data_inicio: formattedDate,
          data_fim: formattedDate,
          tipo: schedType,
          lead_id: newLead.id,
          usuario_id: user.id,
        })
        if (agendaError) throw agendaError
        toast({
          title: 'Lead e Ação Salvos',
          description: 'Lembrete adicionado à sua agenda com sucesso.',
        })
      }

      setOpen(false)
      setInterestStatus('Interessado')
      setSchedEnabled(false)
      setSchedDate('')
      setSchedTitle('')
      setSchedDesc('')
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar registro.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
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
        className="w-[95vw] sm:max-w-[500px] p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Adicionar Novo Lead</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo lead.
              </DialogDescription>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground">
                  Nome completo *
                </Label>
                <Input id="name" name="name" required className="bg-background text-foreground" />
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
                <Label htmlFor="company" className="text-foreground">
                  Empresa
                </Label>
                <Input id="company" name="company" className="bg-background text-foreground" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Telefone
                  </Label>
                  <Input id="phone" name="phone" className="bg-background text-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-foreground">
                  Endereço Completo
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  className="min-h-[60px] bg-background text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-foreground">
                  Observações
                </Label>
                <Textarea id="notes" name="notes" className="bg-background text-foreground" />
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
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Lead'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
