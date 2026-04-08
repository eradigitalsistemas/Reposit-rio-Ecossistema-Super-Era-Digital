import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface ScheduleActionProps {
  enabled: boolean
  setEnabled: (val: boolean) => void
  type: string
  setType: (val: string) => void
  date: string
  setDate: (val: string) => void
  title: string
  setTitle: (val: string) => void
  desc: string
  setDesc: (val: string) => void
}

export function ScheduleActionFields({
  enabled,
  setEnabled,
  type,
  setType,
  date,
  setDate,
  title,
  setTitle,
  desc,
  setDesc,
}: ScheduleActionProps) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <Label
          className="font-semibold text-foreground cursor-pointer text-sm"
          onClick={() => setEnabled(!enabled)}
        >
          Agendar Lembrete / Ação na Agenda?
        </Label>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled && (
        <div className="grid gap-3 pt-4 border-t border-border mt-2 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-foreground">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lembrete">Lembrete</SelectItem>
                  <SelectItem value="Tarefa">Tarefa</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Data e Hora *</Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required={enabled}
                className="bg-background border-input text-foreground"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-foreground">Título da Ação *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Retornar contato"
              required={enabled}
              className="bg-background border-input text-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-foreground">Detalhes (opcional)</Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="min-h-[60px] bg-background border-input text-foreground"
              placeholder="Notas para o agendamento..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
