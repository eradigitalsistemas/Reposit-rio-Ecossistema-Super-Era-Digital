import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  UserPlus,
  ArrowLeft,
  Folder,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Protocolo = {
  id: string
  numero: string
  cliente: string
  tipo: 'PF' | 'PJ' | 'SafeID - 4 meses' | 'SafeID - 3 anos'
  parceiro: string
  data_criacao: string
}

type Parceiro = {
  id: string
  nome: string
}

export default function Certificados() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [newParceiroOpen, setNewParceiroOpen] = useState(false)
  const [newParceiroName, setNewParceiroName] = useState('')

  const [editParceiroOpen, setEditParceiroOpen] = useState(false)
  const [deleteParceiroOpen, setDeleteParceiroOpen] = useState(false)
  const [selectedParceiroObj, setSelectedParceiroObj] = useState<Parceiro | null>(null)
  const [editParceiroName, setEditParceiroName] = useState('')

  const [dateFilter, setDateFilter] = useState<
    'todos' | 'hoje' | 'semana' | 'mes' | 'personalizado'
  >('todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProtocolo, setSelectedProtocolo] = useState<Protocolo | null>(null)

  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    tipo: 'PF' as 'PF' | 'PJ' | 'SafeID - 4 meses' | 'SafeID - 3 anos',
    parceiro: 'Novos Protocolos',
  })

  const [editFormData, setEditFormData] = useState({
    numero: '',
    cliente: '',
    tipo: 'PF' as 'PF' | 'PJ' | 'SafeID - 4 meses' | 'SafeID - 3 anos',
    parceiro: '',
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchParceiros()
  }, [])

  useEffect(() => {
    fetchProtocolos()
  }, [dateFilter, dateFrom, dateTo])

  const fetchParceiros = async () => {
    const { data, error } = await supabase
      .from('parceiros_certificados' as any)
      .select('*')
      .order('nome')
    if (!error && data) {
      setParceiros(data)
    }
  }

  const fetchProtocolos = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('protocolos_certificados' as any)
        .select('*')
        .order('data_criacao', { ascending: false })

      if (dateFilter === 'hoje') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('data_criacao', today.toISOString())
      } else if (dateFilter === 'semana') {
        const today = new Date()
        const first = today.getDate() - today.getDay()
        const firstDay = new Date(today.setDate(first))
        firstDay.setHours(0, 0, 0, 0)
        query = query.gte('data_criacao', firstDay.toISOString())
      } else if (dateFilter === 'mes') {
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        query = query.gte('data_criacao', firstDay.toISOString())
      } else if (dateFilter === 'personalizado') {
        if (dateFrom) {
          const from = new Date(`${dateFrom}T00:00:00`)
          query = query.gte('data_criacao', from.toISOString())
        }
        if (dateTo) {
          const to = new Date(`${dateTo}T23:59:59.999`)
          query = query.lte('data_criacao', to.toISOString())
        }
      }

      const { data, error } = await query
      if (error) throw error
      setProtocolos(data || [])
    } catch (err: any) {
      toast({ title: 'Erro ao carregar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddParceiro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newParceiroName.trim()) return
    try {
      const { data, error } = await supabase
        .from('parceiros_certificados' as any)
        .insert({ nome: newParceiroName.trim() })
        .select()
        .single()
      if (error) throw error
      setParceiros((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNewParceiroName('')
      setNewParceiroOpen(false)
      toast({ title: 'Parceiro adicionado com sucesso' })
    } catch (err: any) {
      toast({
        title: 'Erro ao adicionar parceiro',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleEditParceiro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedParceiroObj || !editParceiroName.trim()) return

    const oldName = selectedParceiroObj.nome
    const newName = editParceiroName.trim()

    if (oldName === newName) {
      setEditParceiroOpen(false)
      return
    }

    try {
      const exists = parceiros.some(
        (p) => p.nome.toLowerCase() === newName.toLowerCase() && p.id !== selectedParceiroObj.id,
      )
      if (exists) {
        toast({ title: 'Já existe um parceiro com este nome', variant: 'destructive' })
        return
      }

      const { error: parceiroError } = await supabase
        .from('parceiros_certificados' as any)
        .update({ nome: newName })
        .eq('id', selectedParceiroObj.id)

      if (parceiroError) throw parceiroError

      const { error: protocolosError } = await supabase
        .from('protocolos_certificados' as any)
        .update({ parceiro: newName })
        .eq('parceiro', oldName)

      if (protocolosError) throw protocolosError

      setParceiros((prev) =>
        prev
          .map((p) => (p.id === selectedParceiroObj.id ? { ...p, nome: newName } : p))
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      )
      setProtocolos((prev) =>
        prev.map((p) => (p.parceiro === oldName ? { ...p, parceiro: newName } : p)),
      )

      if (selectedPartner === oldName) {
        setSelectedPartner(newName)
      }

      setEditParceiroOpen(false)
      toast({ title: 'Parceiro atualizado com sucesso' })
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar parceiro',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteParceiro = async () => {
    if (!selectedParceiroObj) return

    const oldName = selectedParceiroObj.nome

    try {
      const { error: parceiroError } = await supabase
        .from('parceiros_certificados' as any)
        .delete()
        .eq('id', selectedParceiroObj.id)

      if (parceiroError) throw parceiroError

      const { error: protocolosError } = await supabase
        .from('protocolos_certificados' as any)
        .update({ parceiro: 'Novos Protocolos' })
        .eq('parceiro', oldName)

      if (protocolosError) throw protocolosError

      setParceiros((prev) => prev.filter((p) => p.id !== selectedParceiroObj.id))
      setProtocolos((prev) =>
        prev.map((p) => (p.parceiro === oldName ? { ...p, parceiro: 'Novos Protocolos' } : p)),
      )

      if (selectedPartner === oldName) {
        setSelectedPartner(null)
      }

      setDeleteParceiroOpen(false)
      toast({ title: 'Parceiro excluído com sucesso' })
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir parceiro',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.numero || !formData.cliente || !formData.tipo) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    try {
      const { data, error } = await supabase
        .from('protocolos_certificados' as any)
        .insert([
          {
            numero: formData.numero,
            cliente: formData.cliente,
            tipo: formData.tipo,
            parceiro: formData.parceiro || 'Novos Protocolos',
          },
        ])
        .select()
        .single()

      if (error) throw error

      setProtocolos((prev) => [data, ...prev])
      setOpen(false)
      setFormData({ numero: '', cliente: '', tipo: 'PF', parceiro: 'Novos Protocolos' })
      toast({ title: 'Protocolo criado com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao criar', description: err.message, variant: 'destructive' })
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProtocolo) return

    try {
      const { data, error } = await supabase
        .from('protocolos_certificados' as any)
        .update({
          numero: editFormData.numero,
          cliente: editFormData.cliente,
          tipo: editFormData.tipo,
          parceiro: editFormData.parceiro,
        })
        .eq('id', selectedProtocolo.id)
        .select()
        .single()

      if (error) throw error

      setProtocolos((prev) => prev.map((p) => (p.id === selectedProtocolo.id ? data : p)))
      setEditOpen(false)
      toast({ title: 'Protocolo atualizado com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!selectedProtocolo) return

    try {
      const { error } = await supabase
        .from('protocolos_certificados' as any)
        .delete()
        .eq('id', selectedProtocolo.id)

      if (error) throw error

      setProtocolos((prev) => prev.filter((p) => p.id !== selectedProtocolo.id))
      setDeleteOpen(false)
      toast({ title: 'Protocolo excluído com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const handleMoveProtocolo = async (p: Protocolo, novoParceiro: string) => {
    setProtocolos((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, parceiro: novoParceiro } : item)),
    )
    try {
      const { error } = await supabase
        .from('protocolos_certificados' as any)
        .update({ parceiro: novoParceiro })
        .eq('id', p.id)
      if (error) throw error
    } catch (err: any) {
      toast({ title: 'Erro ao mover', description: err.message, variant: 'destructive' })
      fetchProtocolos() // revert on error
    }
  }

  const openView = (p: Protocolo) => {
    setSelectedProtocolo(p)
    setViewOpen(true)
  }

  const openEdit = (p: Protocolo) => {
    setSelectedProtocolo(p)
    setEditFormData({ numero: p.numero, cliente: p.cliente, tipo: p.tipo, parceiro: p.parceiro })
    setEditOpen(true)
  }

  const openDelete = (p: Protocolo) => {
    setSelectedProtocolo(p)
    setDeleteOpen(true)
  }

  const filteredProtocolos = protocolos.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.numero.toLowerCase().includes(q) ||
      p.cliente.toLowerCase().includes(q) ||
      p.parceiro.toLowerCase().includes(q) ||
      p.tipo.toLowerCase().includes(q)
    )
  })

  const allUniquePartners = Array.from(
    new Set([
      'Novos Protocolos',
      ...parceiros.map((p) => p.nome),
      ...protocolos.map((p) => p.parceiro),
    ]),
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      <div className="p-4 md:p-6 border-b flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-background shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Protocolos Certificados
          </h1>
          <p className="text-foreground/70 dark:text-muted-foreground text-sm font-medium">
            Gerencie os protocolos de certificados digitais por parceiro
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 py-1.5 shadow-sm min-w-[180px]">
            <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              className="h-6 w-full border-0 bg-transparent text-sm font-medium focus:ring-0 cursor-pointer outline-none text-foreground dark:bg-background"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="todos" className="bg-background text-foreground">
                Todos os períodos
              </option>
              <option value="hoje" className="bg-background text-foreground">
                Hoje
              </option>
              <option value="semana" className="bg-background text-foreground">
                Esta Semana
              </option>
              <option value="mes" className="bg-background text-foreground">
                Este Mês
              </option>
              <option value="personalizado" className="bg-background text-foreground">
                Personalizado
              </option>
            </select>
          </div>

          {dateFilter === 'personalizado' && (
            <div className="flex items-center gap-2 bg-background border border-input rounded-md px-2 py-1 shadow-sm">
              <Input
                type="date"
                className="h-7 w-[130px] border-0 px-1 py-0 shadow-none text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-muted-foreground text-sm">até</span>
              <Input
                type="date"
                className="h-7 w-[130px] border-0 px-1 py-0 shadow-none text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          )}

          <div className="relative flex-1 min-w-[200px] xl:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              className="pl-9 h-10 font-medium bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Dialog open={newParceiroOpen} onOpenChange={setNewParceiroOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-10 whitespace-nowrap bg-background">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Parceiro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Parceiro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddParceiro} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nome do Parceiro</Label>
                    <Input
                      required
                      value={newParceiroName}
                      onChange={(e) => setNewParceiroName(e.target.value)}
                      placeholder="Ex: Contabilidade XPTO"
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit">Adicionar Parceiro</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Protocolo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Protocolo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Número do Protocolo</Label>
                    <Input
                      required
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="Ex: 123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Cliente</Label>
                    <Input
                      required
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      placeholder="Ex: Empresa Silva LTDA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    >
                      <option value="PF" className="bg-background text-foreground">
                        Pessoa Física (PF)
                      </option>
                      <option value="PJ" className="bg-background text-foreground">
                        Pessoa Jurídica (PJ)
                      </option>
                      <option value="SafeID - 4 meses" className="bg-background text-foreground">
                        SafeID - 4 meses
                      </option>
                      <option value="SafeID - 3 anos" className="bg-background text-foreground">
                        SafeID - 3 anos
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Parceiro Responsável</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
                      value={formData.parceiro}
                      onChange={(e) => setFormData({ ...formData, parceiro: e.target.value })}
                    >
                      {allUniquePartners.map((parc) => (
                        <option key={parc} value={parc} className="bg-background text-foreground">
                          {parc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" className="w-full sm:w-auto">
                      Criar Protocolo
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background sm:bg-muted/10 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !selectedPartner && !search.trim() ? (
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allUniquePartners.map((parceiroName) => {
                const columnItems = protocolos.filter((p) => p.parceiro === parceiroName)
                const parceiroObj = parceiros.find((p) => p.nome === parceiroName)
                const isDefault = parceiroName === 'Novos Protocolos'

                return (
                  <div
                    key={parceiroName}
                    onClick={() => setSelectedPartner(parceiroName)}
                    className="bg-card text-card-foreground border border-border p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all flex flex-col gap-3 group relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                          <Folder className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2">{parceiroName}</h3>
                      </div>
                      {!isDefault && parceiroObj && (
                        <div
                          className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedParceiroObj(parceiroObj)
                              setEditParceiroName(parceiroObj.nome)
                              setEditParceiroOpen(true)
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedParceiroObj(parceiroObj)
                              setDeleteParceiroOpen(true)
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">Protocolos</span>
                      <Badge variant="secondary" className="font-bold">
                        {columnItems.length}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {selectedPartner ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPartner(null)}
                    className="w-fit"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Folder className="w-6 h-6 text-primary" />
                    {selectedPartner}
                  </h2>
                </>
              ) : (
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary" />
                  Resultados da Busca
                </h2>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProtocolos
                .filter((p) => !selectedPartner || p.parceiro === selectedPartner)
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-card text-card-foreground border border-border p-3 rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col gap-2 group relative"
                  >
                    {!selectedPartner && (
                      <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1 mb-1">
                        <Folder className="w-3 h-3 shrink-0" />
                        <span className="truncate">{p.parceiro}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-sm line-clamp-2 leading-snug text-foreground">
                        {p.cliente}
                      </span>
                      <Badge
                        variant={p.tipo === 'PJ' ? 'default' : 'outline'}
                        className={cn(
                          'text-[10px] shrink-0 px-1.5 py-0 font-bold',
                          p.tipo === 'PF' &&
                            'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-300 dark:border-blue-500/20',
                          p.tipo === 'SafeID - 4 meses' &&
                            'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-300 dark:border-emerald-500/20',
                          p.tipo === 'SafeID - 3 anos' &&
                            'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-500 border-purple-300 dark:border-purple-500/20',
                        )}
                      >
                        {p.tipo}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
                      <div className="flex items-center gap-1.5 text-xs bg-secondary/80 dark:bg-muted/50 text-secondary-foreground dark:text-muted-foreground px-2 py-1 rounded-md border border-border/50 max-w-full overflow-hidden">
                        <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                        <span className="font-mono font-bold tracking-tight truncate">
                          {p.numero}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-auto bg-card rounded-md">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-foreground/70 hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            openView(p)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-foreground/70 hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(p)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDelete(p)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border/50">
                      <Label className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 block">
                        Mover para
                      </Label>
                      <select
                        className="w-full h-8 rounded-md border border-input bg-background/50 px-2 py-0 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
                        value={p.parceiro}
                        onChange={(e) => handleMoveProtocolo(p, e.target.value)}
                      >
                        {allUniquePartners.map((parc) => (
                          <option key={parc} value={parc} className="bg-background text-foreground">
                            {parc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              {filteredProtocolos.filter((p) => !selectedPartner || p.parceiro === selectedPartner)
                .length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  Nenhum resultado encontrado.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={editParceiroOpen} onOpenChange={setEditParceiroOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditParceiro} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome do Parceiro</Label>
              <Input
                required
                value={editParceiroName}
                onChange={(e) => setEditParceiroName(e.target.value)}
                placeholder="Ex: Contabilidade XPTO"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditParceiroOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteParceiroOpen} onOpenChange={setDeleteParceiroOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Parceiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 text-foreground">
            <p>
              Tem certeza que deseja excluir o parceiro{' '}
              <strong className="text-primary">{selectedParceiroObj?.nome}</strong>?
            </p>
            <p className="text-sm text-muted-foreground font-medium bg-muted/50 p-2 rounded-md border border-border">
              Todos os protocolos associados a este parceiro serão movidos para "Novos Protocolos".
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteParceiroOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteParceiro}>
              Sim, excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Protocolo</DialogTitle>
          </DialogHeader>
          {selectedProtocolo && (
            <div className="space-y-4 pt-4">
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <Label className="text-muted-foreground text-xs font-semibold uppercase">
                  Número do Protocolo
                </Label>
                <div className="font-bold text-foreground mt-0.5">{selectedProtocolo.numero}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <Label className="text-muted-foreground text-xs font-semibold uppercase">
                  Cliente
                </Label>
                <div className="font-bold text-foreground mt-0.5">{selectedProtocolo.cliente}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <Label className="text-muted-foreground text-xs font-semibold uppercase">
                  Tipo
                </Label>
                <div className="font-bold text-foreground mt-0.5">{selectedProtocolo.tipo}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <Label className="text-muted-foreground text-xs font-semibold uppercase">
                  Parceiro Responsável
                </Label>
                <div className="font-bold text-foreground mt-0.5">{selectedProtocolo.parceiro}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md border border-border">
                <Label className="text-muted-foreground text-xs font-semibold uppercase">
                  Data de Criação
                </Label>
                <div className="font-bold text-foreground mt-0.5">
                  {new Date(selectedProtocolo.data_criacao).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Protocolo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Número do Protocolo</Label>
              <Input
                required
                value={editFormData.numero}
                onChange={(e) => setEditFormData({ ...editFormData, numero: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <Input
                required
                value={editFormData.cliente}
                onChange={(e) => setEditFormData({ ...editFormData, cliente: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
                value={editFormData.tipo}
                onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value as any })}
              >
                <option value="PF" className="bg-background text-foreground">
                  Pessoa Física (PF)
                </option>
                <option value="PJ" className="bg-background text-foreground">
                  Pessoa Jurídica (PJ)
                </option>
                <option value="SafeID - 4 meses" className="bg-background text-foreground">
                  SafeID - 4 meses
                </option>
                <option value="SafeID - 3 anos" className="bg-background text-foreground">
                  SafeID - 3 anos
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Parceiro Responsável</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer text-foreground"
                value={editFormData.parceiro}
                onChange={(e) => setEditFormData({ ...editFormData, parceiro: e.target.value })}
              >
                {allUniquePartners.map((parc) => (
                  <option key={parc} value={parc} className="bg-background text-foreground">
                    {parc}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Protocolo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 text-foreground">
            <p>
              Tem certeza que deseja excluir o protocolo{' '}
              <strong className="text-primary">{selectedProtocolo?.numero}</strong> do cliente{' '}
              <strong className="text-primary">{selectedProtocolo?.cliente}</strong>?
            </p>
            <p className="text-sm text-muted-foreground font-medium bg-muted/50 p-2 rounded-md border border-border">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Sim, excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
