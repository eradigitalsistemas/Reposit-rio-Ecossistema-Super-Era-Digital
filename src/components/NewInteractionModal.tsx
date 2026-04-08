import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
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
import { Lead, KANBAN_STAGES, LeadStage } from '@/types/crm'
import useLeadStore from '@/stores/useLeadStore'
import { useAgendaStore } from '@/stores/useAgendaStore'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
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
import useAuthStore from '@/stores/useAuthStore'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NewInteractionModalProps {
  lead: Lead
}

export function NewInteractionModal({ lead }: NewInteractionModalProps) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<LeadStage>(lead.stage)
  const [contactMethod, setContactMethod] = useState('Mensagem')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [schedEnabled, setSchedEnabled] = useState(false)
  const [schedType, setSchedType] = useState('Lembrete')
  const [schedDate, setSchedDate] = useState('')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedDesc, setSchedDesc] = useState('')

  const { updateLead } = useLeadStore()
  const { user } = useAuthStore()
  const salvarEvento = useAgendaStore((state) => state.salvarEvento)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) return
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const contatoNome = formData.get('contato_nome') as string
    const detalhes = formData.get('detalhes') as string

    let finalDetalhes = detalhes
    if (stage !== lead.stage) {
      const oldStageTitle = KANBAN_STAGES.find((s) => s.id === lead.stage)?.title || lead.stage
      const newStageTitle = KANBAN_STAGES.find((s) => s.id === stage)?.title || stage
      finalDetalhes += `\n\n[Mudança de Fase: ${oldStageTitle} ➔ ${newStageTitle}]`
    }

    try {
      const { error: insertError } = await supabase.from('historico_leads').insert({
        lead_id: lead.id,
        usuario_id: user.id,
        contato_nome: contatoNome,
        forma_contato: contactMethod,
        detalhes: finalDetalhes,
      })

      if (insertError) throw insertError

      if (stage !== lead.stage) {
        await updateLead(lead.id, { stage })
      }

      if (schedEnabled) {
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
      }

      toast({
        title: 'Interação registrada',
        description: 'O histórico e a agenda do lead foram atualizados com sucesso.',
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a interação.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="w-full mt-2 sm:mt-3 h-8 text-xs gap-1.5 font-bold text-primary-foreground"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Nova Interação
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[500px] p-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Interação</DialogTitle>
              <DialogDescription>
                Registre um novo contato e planeje o follow-up para {lead.name}.
              </DialogDescription>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-foreground">Atualizar Situação/Fase</Label>
                <Select value={stage} onValueChange={(v) => setStage(v as LeadStage)}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Selecione a fase" />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contato_nome" className="text-foreground">
                    Contato
                  </Label>
                  <Input
                    id="contato_nome"
                    name="contato_nome"
                    placeholder="Com quem conversou?"
                    required
                    className="bg-background text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-foreground">Canal</Label>
                  <Select value={contactMethod} onValueChange={setContactMethod}>
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensagem">Mensagem</SelectItem>
                      <SelectItem value="Ligação">Ligação</SelectItem>
                      <SelectItem value="E-mail">E-mail</SelectItem>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detalhes" className="text-foreground">
                  Registro da Conversa
                </Label>
                <Textarea
                  id="detalhes"
                  name="detalhes"
                  placeholder="Detalhes do que foi discutido..."
                  className="min-h-[100px] bg-background text-foreground"
                  required
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
                Salvar Interação
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
