import { useState, useEffect, useCallback } from 'react'
import { Stethoscope, ClipboardList, AlertTriangle, Loader2, Trash2, Plus } from 'lucide-react'
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
import { SectionCard, FileUploadButton, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchAtestados,
  createAtestado,
  deleteAtestado,
  fetchPeriodicos,
  createPeriodico,
  deletePeriodico,
  fetchCATs,
  createCAT,
  deleteCAT,
  type Atestado,
  type Periodico,
  type CATRecord,
} from '@/services/empresa-colaborador-extra'

export function ColaboradorHealthSections({ colaboradorId }: { colaboradorId: string }) {
  const { toast } = useToast()
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [periodicos, setPeriodicos] = useState<Periodico[]>([])
  const [cats, setCats] = useState<CATRecord[]>([])
  const [busy, setBusy] = useState(false)

  const [atestadoForm, setAtestadoForm] = useState({
    data: '',
    medico: '',
    file: null as File | null,
  })
  const [periodicoForm, setPeriodicoForm] = useState({
    exames: '',
    periodicidade: '',
    file: null as File | null,
  })
  const [catForm, setCatForm] = useState({
    tipo: 'ACIDENTE',
    numero: '',
    file: null as File | null,
  })

  const loadAll = useCallback(async () => {
    try {
      const [a, p, c] = await Promise.all([
        fetchAtestados(colaboradorId),
        fetchPeriodicos(colaboradorId),
        fetchCATs(colaboradorId),
      ])
      setAtestados(a)
      setPeriodicos(p)
      setCats(c)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
    }
  }, [colaboradorId, toast])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const saveAtestado = async () => {
    if (!atestadoForm.file) {
      toast({ title: 'Aviso', description: 'Selecione o arquivo ASO.' })
      return
    }
    setBusy(true)
    try {
      await createAtestado(colaboradorId, atestadoForm.file, atestadoForm.data, atestadoForm.medico)
      toast({ title: 'Sucesso', description: 'Atestado adicionado.' })
      setAtestadoForm({ data: '', medico: '', file: null })
      await loadAll()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

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

  const saveCAT = async () => {
    setBusy(true)
    try {
      await createCAT(colaboradorId, catForm.tipo, catForm.numero, catForm.file)
      toast({ title: 'Sucesso', description: 'CAT adicionado.' })
      setCatForm({ tipo: 'ACIDENTE', numero: '', file: null })
      await loadAll()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Atestado Admissional" icon={Stethoscope}>
        <div className="space-y-3">
          {atestados.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
            >
              <span className="text-muted-foreground">
                Data: {a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '—'}
              </span>
              <span className="text-muted-foreground">Médico: {a.medico || '—'}</span>
              {a.aso_url && <DownloadButton path={a.aso_url} />}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                onClick={() => {
                  deleteAtestado(a.id, a.aso_url).then(loadAll)
                }}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                value={atestadoForm.data}
                onChange={(e) => setAtestadoForm((p) => ({ ...p, data: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Médico</Label>
              <Input
                value={atestadoForm.medico}
                onChange={(e) => setAtestadoForm((p) => ({ ...p, medico: e.target.value }))}
                className="h-9"
                placeholder="Nome do médico"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileUploadButton
              onFile={(f) => setAtestadoForm((p) => ({ ...p, file: f }))}
              label={atestadoForm.file ? atestadoForm.file.name : 'Selecionar ASO'}
              disabled={busy}
            />
            <Button
              size="sm"
              onClick={saveAtestado}
              disabled={busy || !atestadoForm.file}
              className="gap-1.5"
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar
            </Button>
          </div>
        </div>
      </SectionCard>

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

      <SectionCard title="CAT" icon={AlertTriangle}>
        <div className="space-y-3">
          {cats.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
            >
              <span className="text-muted-foreground">Tipo: {c.tipo}</span>
              <span className="text-muted-foreground">Número: {c.numero || '—'}</span>
              {c.arquivo_url && <DownloadButton path={c.arquivo_url} />}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                onClick={() => {
                  deleteCAT(c.id, c.arquivo_url).then(loadAll)
                }}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={catForm.tipo}
                onValueChange={(v) => setCatForm((p) => ({ ...p, tipo: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACIDENTE">Acidente</SelectItem>
                  <SelectItem value="DOENCA">Doença</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Número</Label>
              <Input
                value={catForm.numero}
                onChange={(e) => setCatForm((p) => ({ ...p, numero: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileUploadButton
              onFile={(f) => setCatForm((p) => ({ ...p, file: f }))}
              label={catForm.file ? catForm.file.name : 'Selecionar Arquivo'}
              disabled={busy}
            />
            <Button size="sm" onClick={saveCAT} disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
