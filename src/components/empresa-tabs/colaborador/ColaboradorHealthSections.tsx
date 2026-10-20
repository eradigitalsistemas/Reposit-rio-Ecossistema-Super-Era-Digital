import { useState, useEffect, useCallback, useRef } from 'react'
import { ClipboardList, Loader2, Trash2, Plus, Eye, CheckCircle2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { SectionCard, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchPeriodicos,
  createPeriodico,
  deletePeriodico,
  type Periodico,
} from '@/services/empresa-colaborador-extra'
import { AtestadoSection } from '@/components/empresa-tabs/colaborador/AtestadoSection'
import { getEmpresaFileUrl } from '@/services/empresa-files'

export function ColaboradorHealthSections({
  colaboradorId,
  colaboradorNome,
  filterSection = 'all',
}: {
  colaboradorId: string
  colaboradorNome: string
  filterSection?: 'all' | 'atestados' | 'periodicos'
}) {
  const { toast } = useToast()
  const [periodicos, setPeriodicos] = useState<Periodico[]>([])
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [periodicoForm, setPeriodicoForm] = useState({
    exames: '',
    periodicidade: '',
    file: null as File | null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!periodicoForm.exames.trim()) {
      toast({ title: 'Aviso', description: 'Informe ao menos a descrição dos exames.' })
      return
    }
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
      setShowForm(false)
      await loadAll()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar exame periódico.',
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleView = async (path: string | null) => {
    if (!path) return
    const url = await getEmpresaFileUrl(path)
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {(filterSection === 'all' || filterSection === 'atestados') && (
        <AtestadoSection colaboradorId={colaboradorId} colaboradorNome={colaboradorNome} />
      )}

      {(filterSection === 'all' || filterSection === 'periodicos') && (
        <SectionCard title="Exames Periódicos e Complementares" icon={ClipboardList}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Acompanhamento de exames periódicos complementares (audiometria, acuidade visual,
                sangue, etc.).
              </p>
              {!showForm && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setShowForm(true)}
                  disabled={busy}
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Exame Periódico
                </Button>
              )}
            </div>

            {showForm && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Novo Exame Periódico</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descrição dos Exames *</Label>
                    <Input
                      value={periodicoForm.exames}
                      onChange={(e) => setPeriodicoForm((p) => ({ ...p, exames: e.target.value }))}
                      placeholder="Ex: Hemograma, Audiometria e ECG"
                      className="h-9"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Periodicidade</Label>
                    <Input
                      value={periodicoForm.periodicidade}
                      onChange={(e) =>
                        setPeriodicoForm((p) => ({ ...p, periodicidade: e.target.value }))
                      }
                      className="h-9"
                      placeholder="Ex: Anual, Semestral, Bienal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setPeriodicoForm((p) => ({ ...p, file: f }))
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'cursor-pointer border border-dashed rounded-lg p-3 text-center transition-all',
                      periodicoForm.file
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                        : 'border-border/60 hover:border-primary/50 hover:bg-muted/10 text-muted-foreground',
                    )}
                  >
                    {periodicoForm.file ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{periodicoForm.file.name}</span>
                        <span className="text-muted-foreground text-[11px]">
                          ({(periodicoForm.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <UploadCloud className="w-4 h-4 text-primary" />
                        <span>Clique para anexar o laudo do exame (PDF/Imagem)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={savePeriodico}
                    disabled={busy || !periodicoForm.exames.trim()}
                    className="gap-1.5"
                  >
                    {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar Exame
                  </Button>
                </div>
              </div>
            )}

            {periodicos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground bg-muted/5">
                <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium">Nenhum exame periódico registrado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registre exames complementares periódicos necessários para o colaborador.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {periodicos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl border border-border/60 bg-card/70 hover:border-border transition-all"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {p.exames || 'Exame Periódico'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Periodicidade: {p.periodicidade || 'Não informada'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.arquivo_url && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs border-border/60"
                            onClick={() => handleView(p.arquivo_url)}
                            title="Visualizar Laudo"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" /> Visualizar
                          </Button>
                          <DownloadButton
                            path={p.arquivo_url}
                            disabled={busy}
                            title="Baixar Laudo"
                          />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() => {
                          deletePeriodico(p.id, p.arquivo_url).then(loadAll)
                        }}
                        title="Excluir Exame"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
