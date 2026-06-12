import { useState, useEffect } from 'react'
import {
  Eye,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  MapPin,
  FileText,
  Plus,
  Send,
  UserCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lead } from '@/types/crm'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'

interface LeadHistorySheetProps {
  lead: Lead
}

interface HistoryItem {
  id: string
  type: 'creation' | 'interaction'
  date: string
  title: string
  contact?: string
  method?: string
  details?: string
  authorName?: string
}

export function LeadHistorySheet({ lead }: LeadHistorySheetProps) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [observacoes, setObservacoes] = useState(lead.notes || '')
  const { user } = useAuthStore()

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newContatoNome, setNewContatoNome] = useState('')
  const [newFormaContato, setNewFormaContato] = useState('Mensagem')
  const [newDetalhes, setNewDetalhes] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (open) {
      setFetchError(null)
      setShowForm(false)
      fetchHistory()
    }
  }, [open, lead.id])

  const fetchHistory = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('observacoes, created_at')
        .eq('id', lead.id)
        .single()

      if (leadError) throw new Error('Não foi possível carregar os dados do lead.')

      if (leadData?.observacoes) {
        setObservacoes(leadData.observacoes)
      }

      const { data: usersData } = await supabase.from('usuarios').select('id, nome')
      const usersMap = new Map(usersData?.map((u) => [u.id, u.nome]))

      const { data: historyData, error: historyError } = await supabase
        .from('historico_leads')
        .select('id, data_criacao, contato_nome, forma_contato, detalhes, usuario_id')
        .eq('lead_id', lead.id)
        .order('data_criacao', { ascending: true })

      if (historyError) throw new Error('Não foi possível carregar as interações.')

      const items: HistoryItem[] = (historyData || []).map((item) => ({
        id: item.id,
        type: 'interaction',
        date: item.data_criacao || new Date().toISOString(),
        title:
          item.forma_contato === 'Automático' ? 'Atualização do Sistema' : 'Interação registrada',
        contact: item.contato_nome,
        method: item.forma_contato,
        details: item.detalhes,
        authorName: item.usuario_id ? usersMap.get(item.usuario_id) : undefined,
      }))

      items.push({
        id: `creation-${lead.id}`,
        type: 'creation',
        date: leadData.created_at || new Date().toISOString(),
        title: 'Lead criado',
        details: leadData.observacoes || 'Lead adicionado ao sistema.',
        authorName: 'Sistema',
      })

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setHistory(items)
    } catch (error: any) {
      setFetchError(error.message || 'Erro inesperado ao carregar o histórico.')
      toast({
        title: 'Erro no histórico',
        description: error.message || 'Falha ao buscar as interações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' })
      return
    }

    if (!newDetalhes.trim()) {
      toast({
        title: 'Erro',
        description: 'Os detalhes da interação são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('historico_leads').insert({
        lead_id: lead.id,
        usuario_id: user.id,
        contato_nome: newContatoNome,
        forma_contato: newFormaContato,
        detalhes: newDetalhes,
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Interação registrada com sucesso.' })
      setNewContatoNome('')
      setNewDetalhes('')
      setShowForm(false)
      fetchHistory()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao registrar a interação.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'ligação':
        return <Phone className="w-3 h-3" />
      case 'e-mail':
      case 'email':
        return <Mail className="w-3 h-3" />
      case 'mensagem':
      case 'whatsapp':
        return <MessageSquare className="w-3 h-3" />
      case 'presencial':
        return <User className="w-3 h-3" />
      case 'automático':
        return <Clock className="w-3 h-3" />
      default:
        return <MessageSquare className="w-3 h-3" />
    }
  }

  const formatTimelineDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const DetailItem = ({ label, icon: Icon, value }: any) => (
    <div className="flex gap-3 items-start p-3 bg-background border border-border rounded-lg shadow-sm">
      <div className="bg-primary/10 p-2 rounded-md shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex flex-col min-w-0">
        <Label className="text-xs text-muted-foreground font-medium">{label}</Label>
        <p className="text-sm text-foreground break-words mt-0.5 whitespace-pre-wrap">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver Dossiê</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[95vw] sm:max-w-2xl md:max-w-4xl flex flex-col md:flex-row gap-0 p-0 overflow-hidden"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-[350px] bg-muted/10 border-b md:border-b-0 md:border-r border-border p-6 overflow-y-auto shrink-0 flex flex-col">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="text-2xl font-bold text-foreground tracking-tight leading-tight">
              {lead.name}
            </SheetTitle>
            <SheetDescription>Dossiê Completo do Lead</SheetDescription>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-background">
                {lead.stage.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge
                variant="default"
                className={cn(
                  lead.interestStatus === 'Não Interessado'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white',
                )}
              >
                {lead.interestStatus}
              </Badge>
            </div>
          </SheetHeader>
          <div className="space-y-4 flex-1">
            {observacoes && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <Label className="text-xs text-primary font-bold flex items-center gap-1.5 mb-2">
                  <FileText className="w-4 h-4" /> Observações (Lembretes)
                </Label>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {observacoes}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <DetailItem label="Telefone" icon={Phone} value={lead.phone} />
              <DetailItem label="E-mail" icon={Mail} value={lead.email} />
              <DetailItem label="Empresa" icon={Building2} value={lead.company} />
              <DetailItem label="Endereço" icon={MapPin} value={lead.address} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="p-6 pb-4 border-b border-border bg-muted/5 flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Histórico de Interações
            </h3>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? 'outline' : 'default'}
              className="h-8 gap-1"
            >
              {showForm ? (
                'Cancelar'
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </>
              )}
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {showForm && (
                <form
                  onSubmit={handleAddInteraction}
                  className="bg-muted/30 p-4 rounded-xl border border-border space-y-4 mb-6 animate-in slide-in-from-top-2"
                >
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Nova Interação
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Contato (com quem falou)</Label>
                      <Input
                        value={newContatoNome}
                        onChange={(e) => setNewContatoNome(e.target.value)}
                        placeholder="Ex: João Silva"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Canal</Label>
                      <Select value={newFormaContato} onValueChange={setNewFormaContato}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mensagem">Mensagem</SelectItem>
                          <SelectItem value="Ligação">Ligação</SelectItem>
                          <SelectItem value="E-mail">E-mail</SelectItem>
                          <SelectItem value="Presencial">Presencial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Detalhes da Interação *</Label>
                    <Textarea
                      required
                      value={newDetalhes}
                      onChange={(e) => setNewDetalhes(e.target.value)}
                      placeholder="Descreva o que foi conversado..."
                      className="min-h-[80px] text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="sm" className="gap-2">
                      <Send className="w-3.5 h-3.5" />
                      {isSubmitting ? 'Salvando...' : 'Salvar Interação'}
                    </Button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <span className="text-sm text-muted-foreground animate-pulse">
                    Carregando histórico...
                  </span>
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full mb-3">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Erro de Carregamento
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">{fetchError}</p>
                  <Button variant="outline" className="mt-4" onClick={fetchHistory}>
                    Tentar Novamente
                  </Button>
                </div>
              ) : history.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <span className="text-sm text-muted-foreground">
                    Nenhuma interação registrada.
                  </span>
                </div>
              ) : (
                <div className="relative border-l border-border ml-3 space-y-8 pb-8">
                  {history.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="relative pl-6 animate-in fade-in slide-in-from-left-2"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground leading-none">
                              {item.title}
                            </h4>
                            {item.authorName && (
                              <span className="text-xs flex items-center gap-1 text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                <UserCircle className="w-3 h-3" />
                                {item.authorName}
                              </span>
                            )}
                          </div>
                          <time className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 font-medium bg-muted/30 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {formatTimelineDate(item.date)}
                          </time>
                        </div>
                        {item.type === 'interaction' && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.contact && item.contact !== 'Sistema' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 text-xs text-foreground font-medium border border-primary/10">
                                <User className="w-3.5 h-3.5 text-primary" />
                                {item.contact}
                              </div>
                            )}
                            {item.method && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 text-xs text-foreground font-medium border border-primary/10">
                                <span className="text-primary">{getMethodIcon(item.method)}</span>
                                {item.method}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border mt-2 whitespace-pre-wrap leading-relaxed shadow-sm">
                          {item.details}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
