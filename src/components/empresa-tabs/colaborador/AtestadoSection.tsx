import { useState, useEffect, useCallback } from 'react'
import { Stethoscope, Loader2, Trash2, BellRing, Mail, Phone, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { SectionCard, FileUploadButton, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchAtestados,
  createAtestado,
  deleteAtestado,
  createAtestadoNotification,
  type Atestado,
} from '@/services/empresa-colaborador-extra'
import { getExpiryStatus, getStatusConfig, getDaysUntilExpiry } from '@/lib/document-status'

const EMPTY_FORM = {
  tipo: 'Admissional',
  file: null as File | null,
  dataExame: '',
  medico: '',
  dataVencimento: '',
  emailEmpresa: '',
  whatsappEmpresa: '',
  emailFuncionario: '',
  whatsappFuncionario: '',
}

export function AtestadoSection({
  colaboradorId,
  colaboradorNome,
}: {
  colaboradorId: string
  colaboradorNome: string
}) {
  const { toast } = useToast()
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    try {
      setAtestados(await fetchAtestados(colaboradorId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar atestados.', variant: 'destructive' })
    }
  }, [colaboradorId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    if (!form.file) {
      toast({ title: 'Aviso', description: 'Selecione o arquivo ASO.' })
      return
    }
    setBusy(true)
    try {
      await createAtestado(colaboradorId, form)
      toast({ title: 'Sucesso', description: 'Atestado adicionado.' })
      if (form.dataVencimento) {
        const days = getDaysUntilExpiry(form.dataVencimento)
        if (days !== null && days <= 30 && days > 0)
          toast({
            title: 'Atenção',
            description: `O Atestado Ocupacional do colaborador (${colaboradorNome}) vencerá em ${days} dias`,
          })
      }
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleNotify = async (atestado: Atestado, dias: number) => {
    try {
      await createAtestadoNotification(colaboradorNome, atestado.id, dias)
      toast({ title: 'Sucesso', description: `Notificação de ${dias} dias registrada.` })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar notificação.', variant: 'destructive' })
    }
  }

  const renderStatus = (dv: string | null) => {
    if (!dv) return null
    const status = getExpiryStatus(dv)
    const cfg = getStatusConfig(status)
    const labels: Record<string, string> = {
      valid: 'Válido',
      near: 'Vence em breve',
      expired: 'Vencido',
      none: '—',
    }
    return (
      <div className="flex items-center gap-1.5">
        <span className={cn('w-3 h-3 rounded-full', cfg.dotClass)} />
        <span className={cn('text-xs font-medium', cfg.textClass)}>{labels[status]}</span>
      </div>
    )
  }

  return (
    <SectionCard title="Atestado" icon={Stethoscope}>
      <div className="space-y-3">
        {atestados.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
          >
            <span className="font-medium">{a.tipo || 'Admissional'}</span>
            <span className="text-muted-foreground">
              Exame: {a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '—'}
            </span>
            <span className="text-muted-foreground">
              Venc.:{' '}
              {a.data_vencimento ? new Date(a.data_vencimento).toLocaleDateString('pt-BR') : '—'}
            </span>
            {renderStatus(a.data_vencimento)}
            {a.aso_url && <DownloadButton path={a.aso_url} />}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-auto"
              onClick={() => deleteAtestado(a.id, a.aso_url).then(load)}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
            {a.data_vencimento && (
              <div className="w-full flex items-center gap-2 mt-1 pt-1 border-t border-border/30">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleNotify(a, 30)}
                >
                  <BellRing className="w-3 h-3" /> Enviar agora
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleNotify(a, 15)}
                >
                  Relembrar em 15 dias
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleNotify(a, 5)}
                >
                  Relembrar em 5 dias
                </Button>
              </div>
            )}
          </div>
        ))}
        {showForm ? (
          <div className="space-y-3 p-3 rounded border border-border/50 bg-background/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admissional">Admissional</SelectItem>
                    <SelectItem value="Periódico">Periódico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data do Exame</Label>
                <Input
                  type="date"
                  value={form.dataExame}
                  onChange={(e) => setForm((p) => ({ ...p, dataExame: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Médico</Label>
                <Input
                  value={form.medico}
                  onChange={(e) => setForm((p) => ({ ...p, medico: e.target.value }))}
                  className="h-9"
                  placeholder="Nome do médico"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Vencimento</Label>
                <Input
                  type="date"
                  value={form.dataVencimento}
                  onChange={(e) => setForm((p) => ({ ...p, dataVencimento: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>
            {form.dataVencimento && (
              <div className="flex items-center gap-2">{renderStatus(form.dataVencimento)}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email da Empresa
                </Label>
                <Input
                  type="email"
                  value={form.emailEmpresa}
                  onChange={(e) => setForm((p) => ({ ...p, emailEmpresa: e.target.value }))}
                  className="h-9"
                  placeholder="empresa@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> WhatsApp da Empresa
                </Label>
                <Input
                  value={form.whatsappEmpresa}
                  onChange={(e) => setForm((p) => ({ ...p, whatsappEmpresa: e.target.value }))}
                  className="h-9"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email do Funcionário
                </Label>
                <Input
                  type="email"
                  value={form.emailFuncionario}
                  onChange={(e) => setForm((p) => ({ ...p, emailFuncionario: e.target.value }))}
                  className="h-9"
                  placeholder="func@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> WhatsApp do Funcionário
                </Label>
                <Input
                  value={form.whatsappFuncionario}
                  onChange={(e) => setForm((p) => ({ ...p, whatsappFuncionario: e.target.value }))}
                  className="h-9"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileUploadButton
                onFile={(f) => setForm((p) => ({ ...p, file: f }))}
                label={form.file ? form.file.name : 'Selecionar ASO'}
                disabled={busy}
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={busy || !form.file}
                className="gap-1.5"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Adicionar Atestado
          </Button>
        )}
      </div>
    </SectionCard>
  )
}
