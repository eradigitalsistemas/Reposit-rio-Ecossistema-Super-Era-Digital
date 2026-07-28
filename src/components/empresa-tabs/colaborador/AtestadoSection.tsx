import { useState, useEffect, useCallback } from 'react'
import { Stethoscope, Loader2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { SectionCard, FileUploadButton, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchAtestados,
  createAtestado,
  deleteAtestado,
  type Atestado,
} from '@/services/empresa-colaborador-extra'
import { getExpiryStatus } from '@/lib/document-status'

const EMPTY_FORM = {
  file: null as File | null,
  dataVencimento: '',
}

export function AtestadoSection({
  colaboradorId,
}: {
  colaboradorId: string
  colaboradorNome?: string
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
      toast({ title: 'Aviso', description: 'Selecione o arquivo do atestado.' })
      return
    }
    setBusy(true)
    try {
      await createAtestado(colaboradorId, { file: form.file, dataVencimento: form.dataVencimento })
      toast({ title: 'Sucesso', description: 'Atestado adicionado.' })
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const renderStatus = (dv: string | null) => {
    const isExpired = !dv || getExpiryStatus(dv) === 'expired'
    return (
      <div className="flex items-center gap-1.5">
        <span className={cn('w-3 h-3 rounded-full', isExpired ? 'bg-red-500' : 'bg-emerald-500')} />
        <span
          className={cn('text-xs font-medium', isExpired ? 'text-red-600' : 'text-emerald-600')}
        >
          {isExpired ? 'Vencido' : 'Atualizado'}
        </span>
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
            <span className="font-medium">ASO</span>
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
          </div>
        ))}
        {showForm ? (
          <div className="space-y-3 p-3 rounded border border-border/50 bg-background/30">
            <div className="space-y-1.5">
              <Label className="text-xs">Data de Vencimento</Label>
              <Input
                type="date"
                value={form.dataVencimento}
                onChange={(e) => setForm((p) => ({ ...p, dataVencimento: e.target.value }))}
                className="h-9"
              />
              {form.dataVencimento && renderStatus(form.dataVencimento)}
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
