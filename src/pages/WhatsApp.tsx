import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Loader2,
  Bot,
  Search,
  ArrowLeft,
  Phone,
  Info,
  Activity,
  RefreshCw,
  ListTodo,
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
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
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user)
    })
  }, [])

  const fetchChats = async () => {
    setLoadingChats(true)
    try {
      const [chatsRes, contactsRes] = await Promise.all([
        supabase.from('chats').select('*').order('updated_at', { ascending: false }),
        supabase.from('contacts').select('*'),
      ])

      if (chatsRes.error) throw chatsRes.error

      const contactsMap = new Map((contactsRes.data || []).map((c) => [c.phone, c]))

      const formattedChats = (chatsRes.data || []).map((chat) => ({
        ...chat,
        contact: contactsMap.get(chat.phone) as ContactInfo | undefined,
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
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .in('entity_type', ['uazapi_sync_messages', 'webhook_receive'])
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
        .channel('whatsapp-chats-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => {
          fetchChats()
        })
        .subscribe()

      const logsChannel = supabase
        .channel('whatsapp-logs-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sync_logs' },
          (payload) => {
            const newLog = payload.new as SyncLog
            if (['uazapi_sync_messages', 'webhook_receive'].includes(newLog.entity_type)) {
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
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setMessages(data || [])
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

    const msgChannel = supabase
      .channel(`whatsapp-messages-${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new as Message]
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
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m)),
          )
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
                                  {log.status === 'success' ? <Check className="w-3 h-3" /> : null}
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
                        Aguardando o recebimento de mensagens para este contato.
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
                                <span className="ml-0.5">
                                  {msg.status === 'pending' && (
                                    <Clock className="h-3 w-3 opacity-70" />
                                  )}
                                  {msg.status === 'sent' && (
                                    <Check className="h-3 w-3 opacity-70" />
                                  )}
                                  {msg.status === 'read' && (
                                    <CheckCheck className="h-3 w-3 text-blue-500 dark:text-blue-400" />
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

            {/* Mirror Banner */}
            <div className="p-3 bg-muted/80 border-t border-border z-10 flex items-center justify-center text-sm text-muted-foreground shadow-inner backdrop-blur-sm">
              <Info className="h-4 w-4 mr-2 shrink-0 text-blue-500" />
              <span>
                <strong>Modo Espelhamento:</strong> Apenas leitura. As mensagens são sincronizadas
                automaticamente via Webhook.
              </span>
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
              <h2 className="text-2xl font-light text-foreground mb-3">WhatsApp Mirror</h2>
              <p className="max-w-md text-sm">
                Selecione uma conversa na lateral para visualizar o histórico de mensagens
                sincronizadas pelo sistema UAZAPI.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
