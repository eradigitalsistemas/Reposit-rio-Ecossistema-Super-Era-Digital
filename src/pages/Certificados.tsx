import { useState, useEffect } from 'react'
import { Plus, Search, FileText, GripHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PARCEIROS = [
  'Novos Protocolos',
  'Alecyo',
  'Diego',
  'Edeilson',
  'Fábio',
  'Júlio',
  'J H M Praca',
  'Nicassia',
  'Rodrigo Autocontas',
  'Rodrigo e Lucena',
  'Ronaldo',
  'Romulo Praca',
  'Orlando - Glauciane',
  'Valdemar - Lyla',
  'Luciana',
  'Útil',
  'Priscila',
]

type Protocolo = {
  id: string
  numero: string
  cliente: string
  tipo: 'PF' | 'PJ'
  parceiro: string
  data_criacao: string
}

export default function Certificados() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProtocolo, setSelectedProtocolo] = useState<Protocolo | null>(null)

  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    tipo: 'PF' as 'PF' | 'PJ',
  })

  const [editFormData, setEditFormData] = useState({
    numero: '',
    cliente: '',
    tipo: 'PF' as 'PF' | 'PJ',
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchProtocolos()
  }, [])

  const fetchProtocolos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('protocolos_certificados' as any)
        .select('*')
        .order('data_criacao', { ascending: false })

      if (error) throw error
      setProtocolos(data || [])
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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
            parceiro: 'Novos Protocolos',
          },
        ])
        .select()
        .single()

      if (error) throw error

      setProtocolos((prev) => [data, ...prev])
      setOpen(false)
      setFormData({ numero: '', cliente: '', tipo: 'PF' })
      toast({ title: 'Protocolo criado com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao criar',
        description: err.message,
        variant: 'destructive',
      })
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
        })
        .eq('id', selectedProtocolo.id)
        .select()
        .single()

      if (error) throw error

      setProtocolos((prev) => prev.map((p) => (p.id === selectedProtocolo.id ? data : p)))
      setEditOpen(false)
      toast({ title: 'Protocolo atualizado com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err.message,
        variant: 'destructive',
      })
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
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const openView = (p: Protocolo) => {
    setSelectedProtocolo(p)
    setViewOpen(true)
  }

  const openEdit = (p: Protocolo) => {
    setSelectedProtocolo(p)
    setEditFormData({ numero: p.numero, cliente: p.cliente, tipo: p.tipo })
    setEditOpen(true)
  }

  const openDelete = (p: Protocolo) => {
    setSelectedProtocolo(p)
    setDeleteOpen(true)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('protocoloId', id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => setDraggedId(id), 0)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, parceiro: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('protocoloId')
    if (!id) return

    setDraggedId(null)

    const protocol = protocolos.find((p) => p.id === id)
    if (!protocol || protocol.parceiro === parceiro) return

    setProtocolos((prev) => prev.map((p) => (p.id === id ? { ...p, parceiro } : p)))

    try {
      const { error } = await supabase
        .from('protocolos_certificados' as any)
        .update({ parceiro })
        .eq('id', id)

      if (error) throw error
    } catch (err: any) {
      toast({
        title: 'Erro ao mover protocolo',
        description: err.message,
        variant: 'destructive',
      })
      fetchProtocolos() // revert on error
    }
  }

  const filteredProtocolos = protocolos.filter((p) => {
    const q = search.toLowerCase()
    return p.numero.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col h-full h-[calc(100vh-4rem)] md:h-screen">
      <div className="p-4 md:p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Protocolos Certificados
          </h1>
          <p className="text-foreground/70 dark:text-muted-foreground text-sm font-medium">
            Gerencie os protocolos de certificados digitais por parceiro
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50 dark:text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              className="pl-9 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo
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
                  <ToggleGroup
                    type="single"
                    value={formData.tipo}
                    onValueChange={(val) => {
                      if (val) setFormData({ ...formData, tipo: val as 'PF' | 'PJ' })
                    }}
                    className="justify-start gap-2"
                  >
                    <ToggleGroupItem
                      value="PF"
                      className="flex-1 border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
                    >
                      Pessoa Física (PF)
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="PJ"
                      className="flex-1 border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
                    >
                      Pessoa Jurídica (PJ)
                    </ToggleGroupItem>
                  </ToggleGroup>
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

      <div className="flex-1 overflow-hidden bg-background sm:bg-muted/10 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-full" type="always">
            <div className="flex p-4 md:p-6 gap-4 min-h-full items-start">
              {PARCEIROS.map((parceiro) => {
                const columnItems = filteredProtocolos.filter((p) => p.parceiro === parceiro)

                return (
                  <div
                    key={parceiro}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, parceiro)}
                    className="flex-shrink-0 w-80 bg-muted/30 dark:bg-muted/20 rounded-xl border border-border flex flex-col max-h-[calc(100vh-10rem)] overflow-hidden shadow-sm"
                  >
                    <div className="p-3 border-b border-border bg-muted/50 dark:bg-muted/30 flex items-center justify-between shrink-0">
                      <h3 className="font-semibold text-sm text-foreground">{parceiro}</h3>
                      <Badge
                        variant="secondary"
                        className="text-xs font-bold bg-background text-foreground shadow-sm border border-border"
                      >
                        {columnItems.length}
                      </Badge>
                    </div>

                    <ScrollArea className="flex-1 p-3">
                      <div className="flex flex-col gap-3 min-h-[50px]">
                        {columnItems.map((p) => (
                          <div
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              'bg-card text-card-foreground border border-border p-3 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all flex flex-col gap-2 group relative',
                              draggedId === p.id && 'opacity-50 scale-95',
                            )}
                          >
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
                                )}
                              >
                                {p.tipo}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-1.5 text-xs bg-secondary/80 dark:bg-muted/50 text-secondary-foreground dark:text-muted-foreground px-2 py-1 rounded-md border border-border/50">
                                <FileText className="w-3.5 h-3.5 opacity-70" />
                                <span className="font-mono font-bold tracking-tight">
                                  {p.numero}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-foreground/70 hover:text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openView(p)
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-foreground/70 hover:text-primary hover:bg-primary/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEdit(p)
                                  }}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openDelete(p)
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                                <GripHorizontal className="w-4 h-4 ml-1 cursor-grab text-muted-foreground/70 hover:text-foreground" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

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
              <ToggleGroup
                type="single"
                value={editFormData.tipo}
                onValueChange={(val) => {
                  if (val) setEditFormData({ ...editFormData, tipo: val as 'PF' | 'PJ' })
                }}
                className="justify-start gap-2"
              >
                <ToggleGroupItem
                  value="PF"
                  className="flex-1 border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
                >
                  Pessoa Física (PF)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="PJ"
                  className="flex-1 border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
                >
                  Pessoa Jurídica (PJ)
                </ToggleGroupItem>
              </ToggleGroup>
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
