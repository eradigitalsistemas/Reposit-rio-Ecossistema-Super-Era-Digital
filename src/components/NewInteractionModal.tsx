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
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
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

interface NewInteractionModalProps {
  lead: Lead
}

export function NewInteractionModal({ lead }: NewInteractionModalProps) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<LeadStage>(lead.stage)
  const [contactMethod, setContactMethod] = useState('Mensagem')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { updateLead } = useLeadStore()
  const { user } = useAuthStore()

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

      toast({
        title: 'Interação registrada',
        description: 'O histórico do lead foi atualizado com sucesso.',
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
          className="w-full mt-2 sm:mt-3 h-8 text-xs gap-1.5 font-bold text-black"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Nova Interação
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[500px]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Interação</DialogTitle>
            <DialogDescription>
              Registre um novo contato ou atualização para {lead.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Atualizar Situação/Fase</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as LeadStage)}>
                <SelectTrigger>
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

            <div className="grid gap-2">
              <Label htmlFor="contato_nome">Contato</Label>
              <Input
                id="contato_nome"
                name="contato_nome"
                placeholder="Com quem conversou?"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Forma de Contato</Label>
              <Select value={contactMethod} onValueChange={setContactMethod}>
                <SelectTrigger>
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

            <div className="grid gap-2">
              <Label htmlFor="detalhes">Registro da Conversa</Label>
              <Textarea
                id="detalhes"
                name="detalhes"
                placeholder="Detalhes do que foi discutido..."
                className="min-h-[100px]"
                required
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
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              Salvar Interação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
