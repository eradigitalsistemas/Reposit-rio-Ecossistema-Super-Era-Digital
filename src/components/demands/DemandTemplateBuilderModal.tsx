import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, Eye, ChevronLeft, Repeat } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import useDemandStore from '@/stores/useDemandStore'
import { toast } from '@/hooks/use-toast'
import { DemandPriority } from '@/types/demand'

type Mode = 'list' | 'create' | 'edit' | 'view'

const DEPARTMENTS = [
  'Geral',
  'Comercial',
  'Departamento Pessoal',
  'Fiscal',
  'Suporte de Sistema',
  'Certificados Digitais',
  'Marketing',
  'Contabilidade',
  'Outros',
]

export function DemandTemplateBuilderModal() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('list')
  const [loading, setLoading] = useState(false)

  const [currentId, setCurrentId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<DemandPriority>('Pode Ficar para Amanhã')
  const [checklistId, setChecklistId] = useState<string>('none')
  const [responsavelId, setResponsavelId] = useState<string>('none')
  const [departamento, setDepartamento] = useState<string>('Geral')
  const [activeTab, setActiveTab] = useState<string>('Todos')

  const {
    demandTemplates,
    checklistTemplates,
    collaborators,
    addDemandTemplate,
    editDemandTemplate,
    deleteDemandTemplate,
    fetchDemandTemplates,
    fetchChecklistTemplates,
    fetchCollaborators,
  } = useDemandStore()

  useEffect(() => {
    if (open) {
      fetchChecklistTemplates()
      fetchCollaborators()
      fetchDemandTemplates()
      setMode('list')
    }
  }, [open, fetchChecklistTemplates, fetchCollaborators, fetchDemandTemplates])

  const resetForm = () => {
    setTitulo('')
    setDescricao('')
    setPrioridade('Pode Ficar para Amanhã')
    setChecklistId('none')
    setResponsavelId('none')
    setDepartamento(activeTab === 'Todos' ? 'Geral' : activeTab)
    setCurrentId(null)
  }

  const handleCreateNew = () => {
    resetForm()
    setMode('create')
  }

  const handleEdit = (template: any) => {
    setCurrentId(template.id)
    setTitulo(template.titulo)
    setDescricao(template.descricao || '')
    setPrioridade(template.prioridade || 'Pode Ficar para Amanhã')
    setChecklistId(template.checklist_id || 'none')
    setResponsavelId(template.responsavel_id || 'none')
    setDepartamento(template.departamento || 'Geral')
    setMode('edit')
  }

  const handleView = (template: any) => {
    setCurrentId(template.id)
    setTitulo(template.titulo)
    setDescricao(template.descricao || '')
    setPrioridade(template.prioridade || 'Pode Ficar para Amanhã')
    setChecklistId(template.checklist_id || 'none')
    setResponsavelId(template.responsavel_id || 'none')
    setDepartamento(template.departamento || 'Geral')
    setMode('view')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta demanda recorrente?')) return
    setLoading(true)
    await deleteDemandTemplate(id)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!titulo.trim()) {
      toast({
        title: 'Aviso',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    const payload = {
      nome: titulo, // Título como nome para manter compatibilidade com DB
      titulo,
      descricao: descricao || null,
      prioridade,
      checklist_id: checklistId === 'none' ? null : checklistId,
      responsavel_id: responsavelId === 'none' ? null : responsavelId,
      departamento: departamento || 'Geral',
      tipo_demanda: 'Geral' as any, // Default
    }

    if (mode === 'create') {
      await addDemandTemplate(payload)
    } else if (mode === 'edit' && currentId) {
      await editDemandTemplate(currentId, payload)
    }

    setLoading(false)
    setMode('list')
  }

  const filteredTemplates = useMemo(() => {
    if (activeTab === 'Todos') return demandTemplates
    return demandTemplates.filter((t) => (t.departamento || 'Geral') === activeTab)
  }, [demandTemplates, activeTab])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-11 sm:h-10 bg-white border-gray-400 text-black hover:bg-gray-50 dark:bg-card dark:border-border dark:text-white dark:hover:bg-accent shadow-sm w-full sm:w-auto"
        >
          <Repeat className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="sm:inline font-bold">Demandas Recorrentes</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[600px] max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            {mode !== 'list' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode('list')}
                className="h-8 w-8 -ml-2 shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle className="text-black dark:text-white">
              {mode === 'list' && 'Demandas Recorrentes'}
              {mode === 'create' && 'Nova Demanda Recorrente'}
              {mode === 'edit' && 'Editar Demanda Recorrente'}
              {mode === 'view' && 'Visualizar Demanda Recorrente'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === 'list' && 'Gerencie modelos de demandas organizados por departamento.'}
            {mode === 'create' && 'Crie um modelo de demanda reutilizável.'}
            {mode === 'edit' && 'Altere os campos do seu modelo de demanda.'}
            {mode === 'view' && 'Detalhes do modelo.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1 min-h-[300px]">
          {mode === 'list' && (
            <div className="space-y-4">
              <Button
                onClick={handleCreateNew}
                className="w-full gap-2 border-dashed border-gray-400 bg-transparent text-foreground hover:bg-muted"
                variant="outline"
              >
                <Plus className="w-4 h-4" /> Novo Modelo
              </Button>

              <Tabs
                defaultValue="Todos"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full mt-4"
              >
                <ScrollArea className="w-full pb-2">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
                    <TabsTrigger value="Todos">Todos</TabsTrigger>
                    {DEPARTMENTS.map((dep) => (
                      <TabsTrigger key={dep} value={dep}>
                        {dep}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <div className="space-y-2 mt-4">
                  {filteredTemplates.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      Nenhum modelo cadastrado nesta categoria.
                    </p>
                  ) : (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-card shadow-sm gap-2"
                      >
                        <div className="flex flex-col overflow-hidden pr-2">
                          <span className="font-medium text-sm text-black dark:text-white truncate">
                            {template.titulo}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            Pasta: {template.departamento || 'Geral'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            onClick={() => handleView(template)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                            onClick={() => handleEdit(template)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => handleDelete(template.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Tabs>
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo" className="text-black dark:text-white font-medium">
                  Título da Demanda *
                </Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título padrão que será preenchido"
                  className="bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white h-11 sm:h-10"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-foreground font-medium">Pasta / Departamento</Label>
                  <Select value={departamento} onValueChange={setDepartamento} disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-foreground font-medium">Responsável Padrão</Label>
                  <Select value={responsavelId} onValueChange={setResponsavelId} disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não Atribuído</SelectItem>
                      {collaborators.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prioridade" className="text-foreground font-medium">
                    Urgência
                  </Label>
                  <Select
                    value={prioridade}
                    onValueChange={(val) => setPrioridade(val as DemandPriority)}
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pode Ficar para Amanhã">Ficar para Amanhã</SelectItem>
                      <SelectItem value="Durante o Dia">Durante o Dia</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-foreground font-medium">Checklist Padrão</Label>
                  <Select value={checklistId} onValueChange={setChecklistId} disabled={loading}>
                    <SelectTrigger className="bg-background text-foreground border-input">
                      <SelectValue placeholder="Sem checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem checklist</SelectItem>
                      {checklistTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descricao" className="text-foreground font-medium">
                  Descrição Padrão
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="min-h-[80px] bg-background text-foreground border-input"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {mode === 'view' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Título da Demanda
                </Label>
                <div className="font-medium text-base text-black dark:text-white">{titulo}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Pasta / Departamento
                  </Label>
                  <div className="text-sm text-black dark:text-white">
                    {departamento || 'Geral'}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Responsável
                  </Label>
                  <div className="text-sm text-black dark:text-white">
                    {responsavelId !== 'none'
                      ? collaborators.find((c) => c.id === responsavelId)?.nome || 'Não encontrado'
                      : 'Não Atribuído'}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Urgência
                  </Label>
                  <div className="text-sm text-black dark:text-white">{prioridade}</div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                    Checklist Associado
                  </Label>
                  <div className="text-sm text-black dark:text-white">
                    {checklistId !== 'none'
                      ? checklistTemplates.find((t) => t.id === checklistId)?.nome ||
                        'Não encontrado'
                      : 'Nenhum'}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Descrição
                </Label>
                <div className="text-sm text-black dark:text-white whitespace-pre-wrap">
                  {descricao || 'Sem descrição'}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 mt-4">
          {mode === 'list' && (
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto h-11 sm:h-10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Fechar
            </Button>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <>
              <Button
                variant="ghost"
                onClick={() => setMode('list')}
                disabled={loading}
                className="w-full sm:w-auto h-11 sm:h-10 mb-2 sm:mb-0 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto h-11 sm:h-10 text-white font-bold bg-black dark:bg-primary hover:bg-black/90 dark:hover:bg-primary/90"
              >
                {loading ? 'Salvando...' : 'Salvar Modelo'}
              </Button>
            </>
          )}

          {mode === 'view' && (
            <Button
              variant="default"
              onClick={() => setMode('list')}
              className="w-full sm:w-auto h-11 sm:h-10 text-white font-bold bg-black dark:bg-primary hover:bg-black/90 dark:hover:bg-primary/90"
            >
              Voltar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
