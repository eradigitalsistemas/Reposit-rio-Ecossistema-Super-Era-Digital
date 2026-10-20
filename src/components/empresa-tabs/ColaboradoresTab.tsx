import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Loader2,
  UserPlus,
  Users,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  FileCheck2,
  UserCheck,
  ArrowRight,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatCPF } from '@/lib/utils/cpf'
import { cn } from '@/lib/utils'
import {
  fetchColaboradoresByEmpresaId,
  createColaboradorForEmpresa,
  type ColaboradorSimples,
} from '@/services/empresas'
import { supabase } from '@/lib/supabase/client'
import { ColaboradorDocSections } from '@/components/empresa-tabs/colaborador/ColaboradorDocSections'
import { ColaboradorHealthSections } from '@/components/empresa-tabs/colaborador/ColaboradorHealthSections'
import { ColaboradorDossierButton } from '@/components/empresa-tabs/ColaboradorDossierButton'
import { ImportColaboradoresDialog } from '@/components/empresa-tabs/ImportColaboradoresDialog'
import { RescisaoTab } from '@/components/empresa-tabs/RescisaoTab'
import { getExpiryStatus } from '@/lib/document-status'

interface ColaboradorSummary {
  pessoais: number
  hasS2240: boolean
  hasS2220: boolean
  cats: number
  atestados: number
  atestadoStatus: 'valid' | 'near' | 'expired' | 'none'
  periodicos: number
}

export function ColaboradoresTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [colaboradores, setColaboradores] = useState<ColaboradorSimples[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [saving, setSaving] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [mainTab, setMainTab] = useState<'colaborador' | 'rescisao'>('colaborador')
  const [activeDocCategory, setActiveDocCategory] = useState<
    'todos' | 'pessoais' | 'esocial' | 'atestados' | 'cat' | 'periodicos'
  >('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [summaries, setSummaries] = useState<Record<string, ColaboradorSummary>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchColaboradoresByEmpresaId(empresaId)
      setColaboradores(list)
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id)
      } else if (list.length > 0 && !list.some((c) => c.id === selectedId)) {
        setSelectedId(list[0].id)
      }

      // Carregar resumos de documentos de cada colaborador em lote
      if (list.length > 0) {
        const ids = list.map((c) => c.id)
        const [docsRes, atestadosRes, catsRes, periodicosRes] = await Promise.all([
          supabase
            .from('colaborador_documentos')
            .select('colaborador_id, tipo, url')
            .in('colaborador_id', ids),
          supabase
            .from('colaborador_atestados')
            .select('colaborador_id, data_vencimento')
            .in('colaborador_id', ids),
          supabase.from('colaborador_cat').select('colaborador_id').in('colaborador_id', ids),
          supabase
            .from('colaborador_periodicos')
            .select('colaborador_id')
            .in('colaborador_id', ids),
        ])

        const newMap: Record<string, ColaboradorSummary> = {}
        for (const id of ids) {
          const colabDocs = (docsRes.data || []).filter((d) => d.colaborador_id === id)
          const colabAtestados = (atestadosRes.data || []).filter((a) => a.colaborador_id === id)
          const colabCats = (catsRes.data || []).filter((c) => c.colaborador_id === id)
          const colabPeriodicos = (periodicosRes.data || []).filter((p) => p.colaborador_id === id)

          // Último atestado para status
          let atestadoStatus: 'valid' | 'near' | 'expired' | 'none' = 'none'
          if (colabAtestados.length > 0) {
            const latest = colabAtestados[colabAtestados.length - 1]
            atestadoStatus = latest.data_vencimento
              ? getExpiryStatus(latest.data_vencimento)
              : 'expired'
          }

          newMap[id] = {
            pessoais: colabDocs.filter((d) => d.tipo === 'Pessoal').length,
            hasS2240: colabDocs.some((d) => ['S2240', 's2240'].includes(d.tipo) && d.url),
            hasS2220: colabDocs.some((d) => ['S2220', 's2220'].includes(d.tipo) && d.url),
            cats: colabCats.length,
            atestados: colabAtestados.length,
            atestadoStatus,
            periodicos: colabPeriodicos.length,
          }
        }
        setSummaries(newMap)
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar colaboradores.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [empresaId, selectedId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const created = await createColaboradorForEmpresa(empresaId, { nome: nome.trim(), cpf })
      toast({ title: 'Sucesso', description: 'Colaborador cadastrado com sucesso.' })
      setColaboradores((prev) => [...prev, created])
      setSelectedId(created.id)
      setNome('')
      setCpf('')
      setDialogOpen(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar colaborador.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const filteredColaboradores = useMemo(() => {
    if (!searchQuery.trim()) return colaboradores
    const q = searchQuery.toLowerCase()
    return colaboradores.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.cpf && c.cpf.replace(/\D/g, '').includes(q.replace(/\D/g, ''))),
    )
  }, [colaboradores, searchQuery])

  const selectedColaborador = colaboradores.find((c) => c.id === selectedId)
  const currentSummary = selectedId ? summaries[selectedId] : null

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra superior de navegação principal da aba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'colaborador' | 'rescisao')}>
            <TabsList className="bg-muted/40 border border-border/50">
              <TabsTrigger value="colaborador" className="gap-2 text-xs sm:text-sm">
                <Users className="w-4 h-4" />
                Colaboradores & Documentos
              </TabsTrigger>
              <TabsTrigger value="rescisao" className="gap-2 text-xs sm:text-sm">
                <UserCheck className="w-4 h-4" />
                Rescisão & Desligamento
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-xs font-medium shadow-sm"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4" /> Novo Colaborador
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium border-border/60"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="w-4 h-4" /> Importar CSV
          </Button>
        </div>
      </div>

      {mainTab === 'rescisao' ? (
        <RescisaoTab empresaId={empresaId} />
      ) : colaboradores.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/10 p-12 text-center">
          <CardContent className="space-y-3 pt-6">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <h3 className="text-base font-semibold text-foreground">
              Nenhum colaborador cadastrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Cadastre seu primeiro colaborador ou importe a lista completa via CSV para começar a
              anexar documentos pessoais, recibos SST e acompanhar atestados de saúde.
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" /> Cadastrar Colaborador
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
                <Upload className="w-4 h-4" /> Importar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* PAINEL LATERAL ESQUERDO: LISTA DE COLABORADORES */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-card/60"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{colaboradores.length} colaborador(es)</span>
              <span>{filteredColaboradores.length} visíveis</span>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredColaboradores.map((colab) => {
                const isSelected = colab.id === selectedId
                const summary = summaries[colab.id]

                return (
                  <div
                    key={colab.id}
                    onClick={() => setSelectedId(colab.id)}
                    className={cn(
                      'group relative rounded-xl border p-3.5 cursor-pointer transition-all duration-150',
                      isSelected
                        ? 'bg-card border-primary ring-1 ring-primary shadow-sm'
                        : 'bg-card/50 border-border/60 hover:bg-card hover:border-border',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'text-sm font-semibold truncate',
                              isSelected ? 'text-foreground' : 'text-foreground/90',
                            )}
                          >
                            {colab.nome}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          CPF: {colab.cpf ? formatCPF(colab.cpf) : 'Não informado'}
                        </p>
                      </div>

                      {/* Status visual do atestado em bola verde/vermelho */}
                      {summary && (
                        <div
                          className="shrink-0 flex items-center gap-1.5"
                          title="Status ASO / Atestado"
                        >
                          <span
                            className={cn(
                              'w-2.5 h-2.5 rounded-full ring-2 shadow-sm',
                              summary.atestadoStatus === 'valid'
                                ? 'bg-emerald-500 ring-emerald-500/20'
                                : summary.atestadoStatus === 'near'
                                  ? 'bg-amber-500 ring-amber-500/20'
                                  : summary.atestadoStatus === 'expired'
                                    ? 'bg-red-500 ring-red-500/20'
                                    : 'bg-muted-foreground ring-border',
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Resumo compacto de documentos anexados */}
                    {summary && (
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] py-0 px-1.5 gap-1',
                            summary.pessoais > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-muted/20 text-muted-foreground',
                          )}
                        >
                          <FileText className="w-2.5 h-2.5" />
                          {summary.pessoais} pessoal
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] py-0 px-1.5',
                            summary.hasS2240
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                          )}
                        >
                          S-2240 {summary.hasS2240 ? '✓' : '—'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] py-0 px-1.5',
                            summary.hasS2220
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                          )}
                        >
                          S-2220 {summary.hasS2220 ? '✓' : '—'}
                        </Badge>
                        {summary.atestados > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20"
                          >
                            ASO ({summary.atestados})
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* PAINEL PRINCIPAL DIREITO: DETALHES DO COLABORADOR SELECIONADO */}
          <div className="lg:col-span-8 space-y-5">
            {selectedColaborador ? (
              <>
                {/* Header do Colaborador selecionado */}
                <div className="rounded-xl border border-border/60 bg-card/80 p-4 sm:p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-foreground tracking-tight">
                          {selectedColaborador.nome}
                        </h2>
                        {currentSummary && (
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                              currentSummary.atestadoStatus === 'valid'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : currentSummary.atestadoStatus === 'near'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : currentSummary.atestadoStatus === 'expired'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                    : 'bg-muted/40 text-muted-foreground border-border',
                            )}
                          >
                            <span
                              className={cn(
                                'w-2 h-2 rounded-full',
                                currentSummary.atestadoStatus === 'valid'
                                  ? 'bg-emerald-400'
                                  : currentSummary.atestadoStatus === 'near'
                                    ? 'bg-amber-400'
                                    : currentSummary.atestadoStatus === 'expired'
                                      ? 'bg-red-400'
                                      : 'bg-muted-foreground',
                              )}
                            />
                            {currentSummary.atestadoStatus === 'valid'
                              ? 'ASO Válido'
                              : currentSummary.atestadoStatus === 'near'
                                ? 'ASO Vencendo'
                                : currentSummary.atestadoStatus === 'expired'
                                  ? 'ASO Vencido / Ausente'
                                  : 'Sem ASO'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>
                          CPF:{' '}
                          <span className="font-mono text-foreground/80">
                            {selectedColaborador.cpf
                              ? formatCPF(selectedColaborador.cpf)
                              : 'Não informado'}
                          </span>
                        </span>
                        {selectedColaborador.email &&
                          !selectedColaborador.email.includes('placeholder.com') && (
                            <span>Email: {selectedColaborador.email}</span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ColaboradorDossierButton
                        colaboradorId={selectedId}
                        colaboradorNome={selectedColaborador.nome}
                      />
                    </div>
                  </div>

                  {/* Badges de Navegação Rápida / Filtro por Categoria de Documentos */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/40 overflow-x-auto pb-1 text-xs">
                    <Button
                      size="sm"
                      variant={activeDocCategory === 'todos' ? 'default' : 'ghost'}
                      className="h-7 text-xs px-2.5 rounded-full"
                      onClick={() => setActiveDocCategory('todos')}
                    >
                      Todos os Documentos
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDocCategory === 'pessoais' ? 'default' : 'ghost'}
                      className="h-7 text-xs px-2.5 rounded-full gap-1.5"
                      onClick={() => setActiveDocCategory('pessoais')}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Pessoais
                      {currentSummary?.pessoais ? (
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-background/50">
                          {currentSummary.pessoais}
                        </span>
                      ) : null}
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDocCategory === 'esocial' ? 'default' : 'ghost'}
                      className="h-7 text-xs px-2.5 rounded-full gap-1.5"
                      onClick={() => setActiveDocCategory('esocial')}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      S-2240 / S-2220
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDocCategory === 'atestados' ? 'default' : 'ghost'}
                      className="h-7 text-xs px-2.5 rounded-full gap-1.5"
                      onClick={() => setActiveDocCategory('atestados')}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Atestados / ASO
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDocCategory === 'cat' ? 'default' : 'ghost'}
                      className="h-7 text-xs px-2.5 rounded-full gap-1.5"
                      onClick={() => setActiveDocCategory('cat')}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      CAT
                      {currentSummary?.cats ? (
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-background/50">
                          {currentSummary.cats}
                        </span>
                      ) : null}
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDocCategory === 'periodicos' ? 'default' : 'ghost'}
                      className="h-7 text-xs px-2.5 rounded-full gap-1.5"
                      onClick={() => setActiveDocCategory('periodicos')}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Periódicos
                      {currentSummary?.periodicos ? (
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-background/50">
                          {currentSummary.periodicos}
                        </span>
                      ) : null}
                    </Button>
                  </div>
                </div>

                {/* Conteúdo das Seções com base no filtro selecionado */}
                <div className="space-y-6">
                  {(activeDocCategory === 'todos' ||
                    activeDocCategory === 'pessoais' ||
                    activeDocCategory === 'esocial' ||
                    activeDocCategory === 'cat') && (
                    <ColaboradorDocSections
                      colaboradorId={selectedId}
                      filterSection={activeDocCategory === 'todos' ? 'all' : activeDocCategory}
                    />
                  )}

                  {(activeDocCategory === 'todos' ||
                    activeDocCategory === 'atestados' ||
                    activeDocCategory === 'periodicos') && (
                    <ColaboradorHealthSections
                      colaboradorId={selectedId}
                      colaboradorNome={selectedColaborador.nome}
                      filterSection={activeDocCategory === 'todos' ? 'all' : activeDocCategory}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground rounded-xl border border-dashed border-border/60 p-8">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  Selecione um colaborador ao lado para visualizar e anexar seus documentos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Criação de Colaborador */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Novo Colaborador
            </DialogTitle>
            <DialogDescription>
              Cadastre o colaborador para anexar documentos pessoais, recibos SST e acompanhar ASOs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="colab-nome" className="text-xs font-medium">
                Nome Completo *
              </Label>
              <Input
                id="colab-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                required
                autoFocus
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colab-cpf" className="text-xs font-medium">
                CPF do Colaborador
              </Label>
              <Input
                id="colab-cpf"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving || !nome.trim()} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Cadastrar Colaborador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Importação de Relatório CSV */}
      <ImportColaboradoresDialog
        empresaId={empresaId}
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={load}
      />
    </div>
  )
}
