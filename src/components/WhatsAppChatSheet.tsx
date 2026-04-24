import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Loader2, Bot, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Lead } from '@/types/crm'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface WhatsAppChatSheetProps {
  lead: Lead
}

export function WhatsAppChatSheet({ lead }: WhatsAppChatSheetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [chatId, setChatId] = useState<string | null>(null)

  useEffect(() => {
    if (open && lead.phone) {
      fetchChatAndMessages()
    }
  }, [open, lead.phone])

  useEffect(() => {
    if (!chatId || !open) return

    const channel = supabase
      .channel(`whatsapp-sheet-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, open])

  const fetchChatAndMessages = async () => {
    if (!lead.phone) return
    setLoading(true)
    try {
      const canonicalPhone = lead.phone.replace(/\D/g, '')

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .like('phone', `%${canonicalPhone}%`)
        .maybeSingle()

      if (chat) {
        setChatId(chat.id)

        // Use standard DB fetch to easily support realtime subscription
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('timestamp', { ascending: true })

        if (!error) {
          setMessages(data || [])
        }
      } else {
        setMessages([])
        setChatId(null)
      }

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-500 dark:hover:bg-blue-900/20"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="sr-only">WhatsApp Mirror</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[95vw] sm:max-w-md flex flex-col gap-0 p-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <SheetHeader className="p-4 border-b border-border bg-blue-600">
          <SheetTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Mirror - {lead.name}
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30 border-0"
            >
              {lead.phone || 'Sem número'}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30 border-0"
            >
              Qualificação: {lead.interestStatus || 'N/A'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col bg-muted/30">
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg mx-4 border border-border shadow-sm">
                <Bot className="h-10 w-10 mx-auto mb-3 text-blue-600/50" />
                <p className="font-medium text-foreground">Nenhuma mensagem espelhada ainda.</p>
                <p className="text-xs mt-1">
                  O histórico aparecerá aqui quando as mensagens forem sincronizadas pelo webhook.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOutgoing = msg.direction === 'outbound'
                  const text = msg.content || ''
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex w-full animate-in fade-in slide-in-from-bottom-2',
                        isOutgoing ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed',
                          isOutgoing
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-background border border-border text-foreground rounded-tl-sm',
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{text}</p>
                        <span
                          className={cn(
                            'text-[10px] block mt-1.5 font-medium',
                            isOutgoing ? 'text-blue-100' : 'text-muted-foreground',
                          )}
                        >
                          {new Date(msg.timestamp || msg.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} className="h-1" />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 bg-background border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)] flex items-center justify-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Modo Espelhamento: Apenas visualização.
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
