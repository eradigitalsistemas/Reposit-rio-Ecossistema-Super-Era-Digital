import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { SectionCard, FileUploadButton, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchPeriodicos,
  createPeriodico,
  deletePeriodico,
  type Periodico,
} from '@/services/empresa-colaborador-extra'
import { AtestadoSection } from '@/components/empresa-tabs/colaborador/AtestadoSection'

export function ColaboradorHealthSections({
  colaboradorId,
  colaboradorNome,
}: {
  colaboradorId: string
  colaboradorNome: string
}) {
  const { toast } = useToast()
  const [periodicos, setPeriodicos] = useState<Periodico[]>([])
  const [busy, setBusy] = useState(false)
  const [periodicoForm, setPeriodicoForm] = useState({
    exames: '',
    periodicidade: '',
    file: null as File | null,
  })

  const loadAll = useCallback(async () => {
    try {
      setPeriodicos(await fetchPeriodicos(colaboradorId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
    }
  }, [colaboradorId, toast])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const savePeriodico = async () => {
    setBusy(true)
    try {
      await createPeriodico(
        colaboradorId,
        periodicoForm.file,
        periodicoForm.exames,
        periodicoForm.periodicidade,
      )
      toast({ title: 'Sucesso', description: 'Exame periódico adicionado.' })
      setPeriodicoForm({ exames: '', periodicidade: '', file: null })
      await loadAll()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <AtestadoSection colaboradorId={colaboradorId} colaboradorNome={colaboradorNome} />
      <SectionCard title="Periódico" icon={ClipboardList}>
        <div className="space-y-3">
          {periodicos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
            >
              <span className="truncate flex-1 min-w-0">
                Exames: {p.exames || '—'} | Periodicidade: {p.periodicidade || '—'}
              </span>
              {p.arquivo_url && <DownloadButton path={p.arquivo_url} />}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  deletePeriodico(p.id, p.arquivo_url).then(loadAll)
                }}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição dos Exames</Label>
              <Input
                value={periodicoForm.exames}
                onChange={(e) => setPeriodicoForm((p) => ({ ...p, exames: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Periodicidade</Label>
              <Input
                value={periodicoForm.periodicidade}
                onChange={(e) => setPeriodicoForm((p) => ({ ...p, periodicidade: e.target.value }))}
                className="h-9"
                placeholder="Ex: Anual"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileUploadButton
              onFile={(f) => setPeriodicoForm((p) => ({ ...p, file: f }))}
              label={periodicoForm.file ? periodicoForm.file.name : 'Selecionar Arquivo'}
              disabled={busy}
            />
            <Button size="sm" onClick={savePeriodico} disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
