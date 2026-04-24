import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Send,
  Loader2,
  Bot,
  Search,
  ArrowLeft,
  Phone,
  QrCode,
  Signal,
  RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Lead = {
  id: string
  nome: string
  telefone: string | null
  status_interesse: string
  empresa?: string | null
}

export default function WhatsApp() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [whatsappConfig, setWhatsappConfig] = useState<any>({})
  const [whatsappStatus, setWhatsappStatus] = useState<string>('checking')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    supabase
      .from('configuracoes')
      .select('chave, valor')
      .in('chave', ['whatsapp_provider', 'uazapi_url', 'uazapi_token', 'uazapi_instance'])
      .then(({ data }) => {
        if (data) {
          const config = data.reduce((acc: any, curr) => ({ ...acc, [curr.chave]: curr.valor }), {})
          if (!config.whatsapp_provider) config.whatsapp_provider = 'uazapi'
          setWhatsappConfig(config)
          checkConnectionStatus(config)
        }
      })
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
    fetchLeads()
  }, [])

  const checkConnectionStatus = async (config: any) => {
    setWhatsappStatus('checking')
    try {
      const { data, error } = await supabase.functions.invoke('uazapi-get-qr', {
        body: { instanceName: 'kanban_vendas' },
      })
      if (error) throw error
      if (data?.state) {
        setWhatsappStatus(data.state)
        if (data.state === 'open') setQrCode(null)
        if (data.base64) setQrCode(data.base64)
      } else {
        setWhatsappStatus('offline')
      }
    } catch (e) {
      setWhatsappStatus('offline')
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setQrCode(null)
    try {
      const { data, error } = await supabase.functions.invoke('uazapi-get-qr', {
        body: { instanceName: 'kanban_vendas' },
      })
      if (error) throw error
      if (data?.base64) {
        setQrCode(data.base64)
        setWhatsappStatus('qrCode')
      } else if (data?.state) {
        setWhatsappStatus(data.state)
      } else {
        toast({ title: 'Erro', description: 'Não foi possível conectar.', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao solicitar conexão.', variant: 'destructive' })
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchLeads = async () => {
    setLoadingLeads(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, nome, telefone, status_interesse, empresa')
        .not('telefone', 'is', null)
        .order('data_criacao', { ascending: false })

      if (error) throw error
      setLeads(data || [])
      setFilteredLeads(data || [])
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro', description: 'Falha ao carregar leads', variant: 'destructive' })
    } finally {
      setLoadingLeads(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      setFilteredLeads(
        leads.filter(
          (l) =>
            l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.telefone && l.telefone.includes(searchTerm)),
        ),
      )
    } else {
      setFilteredLeads(leads)
    }
  }, [searchTerm, leads])

  useEffect(() => {
    if (!selectedLead) return

    fetchMessages(selectedLead.id)

    const channel = supabase
      .channel(`whatsapp-page-${selectedLead.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'historico_leads',
          filter: `lead_id=eq.${selectedLead.id}`,
        },
        (payload) => {
          if (payload.new.forma_contato === 'WhatsApp') {
            setMessages((prev) => {
              const exists = prev.find((m) => m.id === payload.new.id)
              if (exists) return prev
              return [...prev, payload.new]
            })
            setTimeout(() => {
              scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedLead])

  const fetchMessages = async (leadId: string) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase.functions.invoke('uazapi-sync-messages', {
        body: { lead_id: leadId },
      })

      if (error) throw error
      setMessages(data?.messages || [])
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !currentUser || !selectedLead) return

    setSending(true)
    const currentMsg = messageText
    setMessageText('')

    try {
      const { data, error } = await supabase.functions.invoke('uazapi-send-message', {
        body: {
          lead_id: selectedLead.id,
          phone: selectedLead.telefone,
          message: currentMsg,
          user_id: currentUser.id,
          instanceName: 'kanban_vendas',
        },
      })

      if (error) throw error

      if (data?.status) {
        // Atualiza a UI do lead em tempo real com a nota da IA
        const updatedLeads = leads.map((l) =>
          l.id === selectedLead.id ? { ...l, status_interesse: data.status } : l,
        )
        setLeads(updatedLeads)
        if (selectedLead.id === selectedLead.id) {
          setSelectedLead({ ...selectedLead, status_interesse: data.status })
        }

        toast({
          title: 'Mensagem Enviada!',
          description: `Qualificação: Score ${data.score}/100. Status: ${data.status}`,
        })
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro de Envio',
        description: 'Falha ao enviar mensagem para o WhatsApp do Lead.',
        variant: 'destructive',
      })
      setMessageText(currentMsg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] w-full bg-background flex overflow-hidden border-t border-border">
      {/* Sidebar - Lista de Leads */}
      <div
        className={cn(
          'w-full sm:w-[350px] md:w-[400px] flex-shrink-0 border-r border-border flex flex-col bg-card/50',
          selectedLead ? 'hidden sm:flex' : 'flex',
        )}
      >
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              WhatsApp Inbox
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border uppercase tracking-wider',
                  whatsappStatus === 'open'
                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                    : whatsappStatus === 'checking'
                      ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                )}
              >
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full animate-pulse',
                    whatsappStatus === 'open'
                      ? 'bg-green-500'
                      : whatsappStatus === 'checking'
                        ? 'bg-amber-500'
                        : 'bg-red-500',
                  )}
                />
                {whatsappStatus === 'open'
                  ? 'Conectado'
                  : whatsappStatus === 'checking'
                    ? 'Verificando...'
                    : 'Desconectado'}
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loadingLeads ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    'flex items-start gap-3 p-4 text-left transition-colors border-b border-border/50 hover:bg-accent',
                    selectedLead?.id === lead.id && 'bg-accent/80',
                  )}
                >
                  <Avatar className="h-12 w-12 border border-background shrink-0">
                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                      {lead.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate pr-2">{lead.nome}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1.5 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0" /> {lead.telefone}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal h-5 bg-background"
                    >
                      {lead.status_interesse}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          'flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a]',
          !selectedLead ? 'hidden sm:flex' : 'flex',
        )}
      >
        {selectedLead ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 flex items-center gap-3 bg-card border-b border-border shadow-sm z-10">
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden -ml-2 shrink-0"
                onClick={() => setSelectedLead(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 border border-border shrink-0">
                <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                  {selectedLead.nome.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">{selectedLead.nome}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {selectedLead.telefone}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="bg-background hidden sm:flex">
                  {selectedLead.status_interesse}
                </Badge>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
              {/* WhatsApp background pattern overlay */}
              <div
                className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'url("https://img.usecurling.com/p/500/500?q=pattern&color=gray&shape=outline")',
                  backgroundSize: '300px',
                }}
              />

              <ScrollArea className="h-full px-4 py-6">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 relative z-10">
                    <div className="bg-card/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border max-w-sm">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-green-600/60" />
                      <h3 className="font-medium mb-2">Inicie a conversa</h3>
                      <p className="text-sm text-muted-foreground">
                        Envie a primeira mensagem para este lead. Nossa IA qualificará o lead
                        automaticamente com base nas interações.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 relative z-10 max-w-3xl mx-auto pb-4">
                    {messages.map((msg, idx) => {
                      const isOutgoing =
                        msg.detalhes.startsWith('Você:') || msg.contato_nome === 'WhatsApp'
                      let text = msg.detalhes
                      if (text.startsWith('Você: ')) text = text.substring(6)
                      else if (text.startsWith('Lead respondeu: ')) text = text.substring(16)

                      // Check if previous message was from the same sender to group bubbles
                      const prevMsg = idx > 0 ? messages[idx - 1] : null
                      const prevIsOutgoing = prevMsg
                        ? prevMsg.detalhes.startsWith('Você:') ||
                          prevMsg.contato_nome === 'WhatsApp'
                        : null
                      const isFirstInGroup = prevIsOutgoing !== isOutgoing

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex w-full animate-in fade-in slide-in-from-bottom-1',
                            isOutgoing ? 'justify-end' : 'justify-start',
                            !isFirstInGroup && 'mt-1',
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] sm:max-w-[75%] px-4 py-2.5 shadow-sm text-[15px] leading-relaxed relative',
                              isOutgoing
                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-xl'
                                : 'bg-card text-card-foreground border border-border/50 rounded-xl',
                              isFirstInGroup && isOutgoing && 'rounded-tr-none',
                              isFirstInGroup && !isOutgoing && 'rounded-tl-none',
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{text}</p>
                            <div
                              className={cn(
                                'flex justify-end items-center gap-1 mt-1.5 -mb-1',
                                isOutgoing
                                  ? 'text-[#00000073] dark:text-[#ffffff99]'
                                  : 'text-muted-foreground',
                              )}
                            >
                              <span className="text-[10px] leading-none font-medium">
                                {new Date(msg.data_criacao).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={scrollRef} className="h-1" />
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border z-10">
              <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite uma mensagem"
                  className="flex-1 rounded-full bg-background min-h-[44px]"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-11 w-11 shrink-0 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-transform active:scale-95"
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-1" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground p-8 text-center">
            {qrCode ? (
              <div className="flex flex-col items-center bg-card p-8 rounded-2xl shadow-sm border border-border animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-medium text-foreground mb-2">Leia o QR Code</h3>
                <p className="text-sm mb-6 max-w-sm">
                  Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e aponte a câmera para
                  o QR Code abaixo.
                </p>
                <div className="bg-white p-4 rounded-xl mb-6 shadow-sm border border-zinc-100">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                </div>
                <Button
                  onClick={() => checkConnectionStatus(whatsappConfig)}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Atualizar Status
                </Button>
              </div>
            ) : whatsappStatus !== 'open' && whatsappStatus !== 'checking' ? (
              <div className="flex flex-col items-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 flex items-center justify-center mb-6 shadow-inner">
                  <Signal className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-light text-foreground mb-3">WhatsApp Desconectado</h2>
                <p className="mb-8 text-sm">
                  Sua instância do WhatsApp não está conectada ou o status é desconhecido. Conecte
                  agora para habilitar o envio e recebimento de mensagens.
                </p>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 h-12 px-8 rounded-full text-base shadow-lg shadow-green-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <QrCode className="h-5 w-5" />
                  )}
                  Conectar WhatsApp
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-card shadow-sm flex items-center justify-center mb-6 border border-border relative">
                  <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                  <MessageCircle className="h-12 w-12 text-green-500/50" />
                </div>
                <h2 className="text-2xl font-light text-foreground mb-3">WhatsApp Inbox</h2>
                <p className="max-w-md text-sm">
                  Selecione uma conversa ao lado para visualizar o histórico ou enviar uma nova
                  mensagem. As mensagens são processadas pela IA para qualificar os leads
                  automaticamente.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
