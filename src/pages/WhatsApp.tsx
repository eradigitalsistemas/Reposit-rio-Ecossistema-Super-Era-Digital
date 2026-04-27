import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Loader2,
  Bot,
  Search,
  ArrowLeft,
  Phone,
  Activity,
  RefreshCw,
  ListTodo,
  Check,
  CheckCheck,
  Clock,
  Send,
  Paperclip,
  AlertCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type ContactInfo = {
  name: string | null
  is_online: boolean | null
  last_seen: string | null
}

type Chat = {
  id: string
  phone: string
  instance_id: string
  updated_at: string
  contact?: ContactInfo
}

type Message = {
  id: string
  chat_id: string
  content: string
  direction: string
  status: string
  timestamp: string
}

type SyncLog = {
  id: string
  entity_type: string
  status: string
  error_message: string | null
  created_at: string
}

export default function WhatsApp() {
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])

  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [instanceStatus, setInstanceStatus] = useState<string>('disconnected')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user)
    })
  }, [])

  const fetchChats = async () => {
    setLoadingChats(true)
    try {
      const { data: contactsRes, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) throw error

      const formattedChats = (contactsRes || []).map((contact) => ({
        id: contact.id,
        phone: contact.remote_jid.split('@')[0],
        instance_id: contact.instance_id || '',
        updated_at: contact.last_message_at || contact.created_at || new Date().toISOString(),
        contact: {
          name: contact.push_name || contact.verified_name || null,
          is_online: contact.is_online,
          last_seen: contact.last_seen,
        },
      }))

      setChats(formattedChats)
      setFilteredChats(formattedChats)
    } catch (error: any) {
      console.error('Failed to fetch chats:', error)
      toast({ title: 'Erro', description: 'Falha ao carregar conversas', variant: 'destructive' })
    } finally {
      setLoadingChats(false)
    }
  }

  const fetchSyncLogs = async () => {
    try {
      const { data } = await supabase
        .from('sync_logs')
        .select('*')
        .in('entity_type', ['uazapi_sync_messages', 'webhook_receive', 'whatsapp_events'])
        .order('created_at', { ascending: false })
        .limit(30)
      if (data) setSyncLogs(data)
    } catch (error) {
      console.error('Failed to fetch sync logs:', error)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchChats()
      fetchSyncLogs()

      const chatChannel = supabase
        .channel('whatsapp-contacts-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'whatsapp_contacts' },
          () => {
            fetchChats()
          },
        )
        .subscribe()

      const logsChannel = supabase
        .channel('whatsapp-logs-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sync_logs' },
          (payload) => {
            const newLog = payload.new as SyncLog
            if (
              ['uazapi_sync_messages', 'webhook_receive', 'whatsapp_events'].includes(
                newLog.entity_type,
              )
            ) {
              setSyncLogs((prev) => [newLog, ...prev].slice(0, 30))
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(chatChannel)
        supabase.removeChannel(logsChannel)
      }
    }
  }, [currentUser])

  useEffect(() => {
    if (searchTerm) {
      setFilteredChats(
        chats.filter(
          (c) =>
            (c.contact?.name && c.contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            c.phone.includes(searchTerm),
        ),
      )
    } else {
      setFilteredChats(chats)
    }
  }, [searchTerm, chats])

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('contact_id', chatId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      const formattedMessages = (data || []).map((m: any) => ({
        id: m.id,
        chat_id: m.contact_id || '',
        content: m.text || '',
        direction: m.from_me ? 'outbound' : 'inbound',
        status: m.status || 'read',
        timestamp: m.timestamp || new Date().toISOString(),
      }))

      setMessages(formattedMessages)
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (!selectedChat) return

    fetchMessages(selectedChat.id)

    const fetchInstance = async () => {
      const { data } = await supabase
        .from('whatsapp_instances')
        .select('status')
        .eq('instance_id', selectedChat.instance_id)
        .single()
      if (data) {
        setInstanceStatus(data.status || 'disconnected')
      }
    }
    fetchInstance()

    const msgChannel = supabase
      .channel(`whatsapp-messages-${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `contact_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const m = payload.new as any
          const msg: Message = {
            id: m.id,
            chat_id: m.contact_id || '',
            content: m.text || '',
            direction: m.from_me ? 'outbound' : 'inbound',
            status: m.status || 'read',
            timestamp: m.timestamp || new Date().toISOString(),
          }

          setMessages((prev) => {
            const exists = prev.find((x) => x.id === msg.id)
            if (exists) return prev
            return [...prev, msg]
          })
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `contact_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const m = payload.new as any
          const msg: Message = {
            id: m.id,
            chat_id: m.contact_id || '',
            content: m.text || '',
            direction: m.from_me ? 'outbound' : 'inbound',
            status: m.status || 'read',
            timestamp: m.timestamp || new Date().toISOString(),
          }
          setMessages((prev) => prev.map((x) => (x.id === msg.id ? msg : x)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(msgChannel)
    }
  }, [selectedChat])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('uazapi-sync-messages', {
        body: { action: 'sync_all' },
      })
      if (error) throw error
      toast({ title: 'Sincronização Iniciada', description: 'Buscando histórico na UAZAPI...' })
      setTimeout(fetchChats, 2000)
    } catch (err: any) {
      toast({ title: 'Erro na Sincronização', description: err.message, variant: 'destructive' })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDebugSend = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
          instance_id: 'da5f1f9f-7d94-4b41-b1e5-b09e3148f983',
          phone: '558699577548',
          message: 'Teste enviado pelo botão de debug',
        },
      })

      console.log('data:', data)
      console.log('error:', error)

      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      } else if (data?.success) {
        toast({ title: 'Enviado!', description: `ID: ${data.uazapi_message_id}` })
      } else {
        toast({
          title: 'Falha',
          description: data?.error || 'desconhecido',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erro inesperado', description: err.message, variant: 'destructive' })
    }
  }

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || !selectedChat) return
    if (instanceStatus !== 'connected') {
      toast({ title: 'Instância desconectada', variant: 'destructive' })
      return
    }
    if (text.length > 4096) {
      toast({ title: 'Mensagem muito longa (máximo 4096 caracteres)', variant: 'destructive' })
      return
    }

    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setSending(true)

    try {
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
          instance_id: selectedChat.instance_id,
          phone: selectedChat.phone,
          message: text,
        },
      })

      if (error) throw error
      if (!data?.success) throw new Error(data?.error || 'Falha ao enviar')

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err: any) {
      toast({ title: `Falha ao enviar: ${err.message}`, variant: 'destructive' })
      setInputValue(text)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] w-full bg-background flex overflow-hidden border-t border-border">
      {/* Sidebar - Lista de Chats */}
      <div
        className={cn(
          'w-full sm:w-[350px] md:w-[400px] flex-shrink-0 border-r border-border flex flex-col bg-card/50',
          selectedChat ? 'hidden sm:flex' : 'flex',
        )}
      >
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              WhatsApp Mirror
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugSend}
                className="h-8 text-xs bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/40"
              >
                Testar Envio WhatsApp
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 bg-green-50/50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/40"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Webhook Status</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[90vw] sm:max-w-md flex flex-col gap-0 p-0">
                  <SheetHeader className="p-6 border-b border-border bg-card/50">
                    <SheetTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Status da Integração
                    </SheetTitle>
                    <SheetDescription>
                      Acompanhe o recebimento de mensagens e force a sincronização com a UAZAPI.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6 bg-muted/20">
                    {/* Sincronização */}
                    <div className="p-5 border border-border rounded-xl bg-card shadow-sm space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <RefreshCw className="w-24 h-24" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2 text-foreground">
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                          Sincronização Manual
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 relative z-10">
                          Dispare uma busca manual para puxar as mensagens e chats mais recentes da
                          instância conectada.
                        </p>
                      </div>
                      <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full gap-2 relative z-10 shadow-sm"
                      >
                        {isSyncing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                      </Button>
                    </div>

                    {/* Logs de Webhook */}
                    <div className="flex-1 flex flex-col min-h-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold flex items-center gap-2 text-sm">
                          <ListTodo className="h-4 w-4 text-muted-foreground" />
                          Últimos Eventos (Real-time)
                        </h3>
                      </div>
                      <ScrollArea className="flex-1 p-2">
                        {syncLogs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                            <Activity className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Nenhum evento registrado ainda.</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {syncLogs.map((log, i) => (
                              <div
                                key={`${log.id}-${i}`}
                                className="text-xs p-3 rounded-lg hover:bg-muted/50 transition-colors flex flex-col gap-1.5 border border-transparent hover:border-border"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">
                                    {log.entity_type === 'webhook_receive'
                                      ? 'Recebimento de Webhook'
                                      : 'Sincronização Manual'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {new Date(log.created_at).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'uppercase text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1',
                                      log.status === 'success'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                    )}
                                  >
                                    {log.status === 'success' ? (
                                      <Check className="w-3 h-3" />
                                    ) : null}
                                    {log.status}
                                  </span>
                                  {log.entity_type === 'webhook_receive' &&
                                    log.status === 'success' && (
                                      <span className="text-muted-foreground text-[10px] truncate max-w-[200px]">
                                        ID: {log.entity_id}
                                      </span>
                                    )}
                                </div>
                                {log.error_message && (
                                  <p className="text-red-500 mt-1 font-mono bg-red-50 dark:bg-red-950/20 p-2 rounded text-[10px]">
                                    {log.error_message}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
          {loadingChats ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    'flex items-start gap-3 p-4 text-left transition-colors border-b border-border/50 hover:bg-accent',
                    selectedChat?.id === chat.id && 'bg-accent/80',
                  )}
                >
                  <Avatar className="h-12 w-12 border border-background shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                      {(chat.contact?.name || chat.phone).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate pr-2">
                        {chat.contact?.name || chat.phone}
                      </h3>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(chat.updated_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1.5 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0" /> {chat.phone}
                    </p>
                    {chat.contact?.is_online && (
                      <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online
                      </span>
                    )}
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
          !selectedChat ? 'hidden sm:flex' : 'flex',
        )}
      >
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="h-16 px-4 flex items-center gap-3 bg-card border-b border-border shadow-sm z-10">
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden -ml-2 shrink-0"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 border border-border shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                  {(selectedChat.contact?.name || selectedChat.phone).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">
                  {selectedChat.contact?.name || selectedChat.phone}
                </span>
                <span className="text-xs text-muted-foreground truncate">{selectedChat.phone}</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
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
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 relative z-10">
                    <div className="bg-card/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border max-w-sm">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600/60" />
                      <h3 className="font-medium mb-2">Sem mensagens</h3>
                      <p className="text-sm text-muted-foreground">
                        Nenhuma mensagem encontrada neste histórico. Envie a primeira mensagem
                        abaixo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 relative z-10 max-w-3xl mx-auto pb-4">
                    {messages.map((msg, idx) => {
                      const isOutgoing = msg.direction === 'outbound'
                      const text = msg.content

                      const prevMsg = idx > 0 ? messages[idx - 1] : null
                      const prevIsOutgoing = prevMsg ? prevMsg.direction === 'outbound' : null
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
                              'max-w-[85%] sm:max-w-[75%] px-4 py-2.5 shadow-sm text-[15px] leading-relaxed relative flex flex-col',
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
                                'flex justify-end items-center gap-1 mt-1 -mb-0.5',
                                isOutgoing
                                  ? 'text-[#00000073] dark:text-[#ffffff99]'
                                  : 'text-muted-foreground',
                              )}
                            >
                              <span className="text-[10px] leading-none font-medium pt-1">
                                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOutgoing && (
                                <span className="ml-0.5 flex items-center">
                                  {msg.status === 'pending' && (
                                    <Clock className="h-3 w-3 text-[#999999]" />
                                  )}
                                  {msg.status === 'sent' && (
                                    <Check className="h-3 w-3 text-[#999999]" />
                                  )}
                                  {msg.status === 'delivered' && (
                                    <CheckCheck className="h-3 w-3 text-[#999999]" />
                                  )}
                                  {msg.status === 'read' && (
                                    <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                                  )}
                                  {msg.status === 'failed' && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertCircle className="h-3 w-3 text-red-500 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Falha ao enviar. Toque para tentar novamente.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </span>
                              )}
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

            {/* Message Input Area */}
            <div className="p-3 bg-[#f0f2f5] dark:bg-[#1f2c34] flex items-end gap-2 z-10 border-t border-border">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-10 w-10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
                disabled
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma mensagem"
                className="flex-1 bg-white dark:bg-[#2a3942] border border-transparent rounded-lg px-3 py-2.5 text-[15px] focus:outline-none focus:ring-0 resize-none min-h-[40px] max-h-[120px] overflow-y-auto shadow-sm"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || sending || instanceStatus !== 'connected'}
                className="shrink-0 h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white p-0 flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 ml-1" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://img.usecurling.com/p/800/800?q=pattern&shape=outline&color=gray')]" />
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center relative z-10">
              <div className="h-32 w-32 rounded-full bg-card shadow-sm flex items-center justify-center mb-6 border border-border relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
                <MessageCircle className="h-12 w-12 text-blue-500/50" />
              </div>
              <h2 className="text-2xl font-light text-foreground mb-3">WhatsApp CRM</h2>
              <p className="max-w-md text-sm">
                Selecione uma conversa na lateral para visualizar o histórico de mensagens e
                interagir com o contato.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
