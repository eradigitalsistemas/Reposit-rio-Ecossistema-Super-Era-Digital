import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Stethoscope,
  Loader2,
  Trash2,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  User,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { SectionCard, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchAtestados,
  createAtestado,
  deleteAtestado,
  type Atestado,
} from '@/services/empresa-colaborador-extra'
import { getExpiryStatus, getStatusConfig, getDaysUntilExpiry } from '@/lib/document-status'
import { getEmpresaFileUrl } from '@/services/empresa-files'

const EMPTY_FORM = {
  tipo: 'admissional',
  medico: '',
  data: '',
  dataVencimento: '',
}

export function AtestadoSection({
  colaboradorId,
  colaboradorNome,
}: {
  colaboradorId: string
  colaboradorNome?: string
}) {
  const { toast } = useToast()
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAtestados(await fetchAtestados(colaboradorId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar atestados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [colaboradorId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    if (!selectedFile) {
      toast({ title: 'Aviso', description: 'Selecione o arquivo do atestado (ASO).' })
      return
    }
    setBusy(true)
    try {
      await createAtestado(colaboradorId, {
        file: selectedFile,
        dataVencimento: form.dataVencimento,
        tipo: form.tipo,
        medico: form.medico,
        data: form.data,
      })
      toast({ title: 'Sucesso', description: 'Atestado/ASO adicionado com sucesso.' })
      setForm(EMPTY_FORM)
      setSelectedFile(null)
      setShowForm(false)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar atestado.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (a: Atestado) => {
    setBusy(true)
    try {
      await deleteAtestado(a.id, a.aso_url)
      setAtestados((prev) => prev.filter((item) => item.id !== a.id))
      toast({ title: 'Sucesso', description: 'Atestado removido.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover atestado.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleView = async (path: string | null) => {
    if (!path) return
    const url = await getEmpresaFileUrl(path)
    if (url) window.open(url, '_blank')
  }

  const renderStatus = (dv: string | null) => {
    if (!dv) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
          <span>Vencido / Sem data</span>
        </div>
      )
    }
    const status = getExpiryStatus(dv)
    const days = getDaysUntilExpiry(dv)
    const isExpired = status === 'expired'
    const isNear = status === 'near'

    if (isExpired) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
          <span>Vencido {days !== null ? `(${Math.abs(days)}d atrás)` : ''}</span>
        </div>
      )
    }

    if (isNear) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Vence em breve ({days}d)</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
        <span>Atualizado {days !== null ? `(${days}d)` : ''}</span>
      </div>
    )
  }

  const formatTipo = (tipo: string) => {
    const map: Record<string, string> = {
      admissional: 'Admissional',
      periodico: 'Periódico',
      retorno_trabalho: 'Retorno ao Trabalho',
      mudanca_funcao: 'Mudança de Risco/Função',
      demissional: 'Demissional',
    }
    return map[tipo] || tipo || 'ASO'
  }

  return (
    <SectionCard title="Atestados de Saúde Ocupacional (ASO)" icon={Stethoscope}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">
            Controle de Atestados de Saúde Ocupacional com data de vencimento e monitoramento em
            bola verde/vermelho.
          </p>
          {!showForm && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              onClick={() => setShowForm(true)}
              disabled={busy}
            >
              <Plus className="w-3.5 h-3.5" /> Novo Atestado
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : atestados.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
            <Stethoscope className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhum Atestado Cadastrado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Anexe o ASO (Admissional, Periódico ou Demissional) para acompanhar o status de
              validade deste colaborador.
            </p>
            <Button size="sm" className="mt-4 gap-1.5 text-xs" onClick={() => setShowForm(true)}>
              <UploadCloud className="w-3.5 h-3.5" /> Anexar Primeiro ASO
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {atestados.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 flex-wrap p-3.5 rounded-xl border border-border/60 bg-card/70 hover:border-border transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        ASO - {formatTipo(a.tipo)}
                      </span>
                      {renderStatus(a.data_vencimento)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {a.data && (
                        <span>Emissão: {new Date(a.data).toLocaleDateString('pt-BR')}</span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-foreground/80">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        Vencimento:{' '}
                        {a.data_vencimento
                          ? new Date(a.data_vencimento).toLocaleDateString('pt-BR')
                          : 'Não informado'}
                      </span>
                      {a.medico && (
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <User className="w-3 h-3 text-muted-foreground" />
                          Dr(a): {a.medico}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {a.aso_url && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs border-border/60"
                        onClick={() => handleView(a.aso_url)}
                        title="Visualizar ASO"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        Visualizar
                      </Button>
                      <DownloadButton path={a.aso_url} disabled={busy} title="Baixar ASO" />
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    disabled={busy}
                    onClick={() => handleDelete(a)}
                    title="Excluir Atestado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulário de Novo Atestado */}
        {showForm && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Cadastrar Novo Atestado / ASO
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                  setSelectedFile(null)
                }}
              >
                Fechar
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo do ASO</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admissional">Admissional</SelectItem>
                    <SelectItem value="periodico">Periódico</SelectItem>
                    <SelectItem value="retorno_trabalho">Retorno ao Trabalho</SelectItem>
                    <SelectItem value="mudanca_funcao">Mudança de Função</SelectItem>
                    <SelectItem value="demissional">Demissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Data de Emissão</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Data de Vencimento *</Label>
                <Input
                  type="date"
                  value={form.dataVencimento}
                  onChange={(e) => setForm((p) => ({ ...p, dataVencimento: e.target.value }))}
                  className="h-9 border-primary/40 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <Label className="text-xs">Médico Responsável (opcional)</Label>
                <Input
                  value={form.medico}
                  onChange={(e) => setForm((p) => ({ ...p, medico: e.target.value }))}
                  placeholder="Ex: Dr. Carlos Silva - CRM 12345/SP"
                  className="h-9"
                />
              </div>
            </div>

            {/* Upload do Arquivo */}
            <div className="space-y-2">
              <Label className="text-xs">Arquivo do Atestado (PDF ou imagem) *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setSelectedFile(f)
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'cursor-pointer border border-dashed rounded-lg p-3 text-center transition-all',
                  selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                    : 'border-border/60 hover:border-primary/50 hover:bg-muted/10 text-muted-foreground',
                )}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{selectedFile.name}</span>
                    <span className="text-muted-foreground text-[11px]">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <UploadCloud className="w-4 h-4 text-primary" />
                    <span>Clique para selecionar o PDF/imagem do Atestado</span>
                  </div>
                )}
              </div>
            </div>

            {form.dataVencimento && (
              <div className="flex items-center gap-2 text-xs p-2 rounded bg-background/50 border border-border/40">
                <span className="text-muted-foreground">Status resultante:</span>
                {renderStatus(form.dataVencimento)}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                  setSelectedFile(null)
                }}
                disabled={busy}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={busy || !selectedFile}
                className="gap-1.5"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Salvar Atestado
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
