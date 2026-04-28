import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Paperclip, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWhatsappMessages } from '@/hooks/use-whatsapp-messages'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { MessageBubble } from './message-bubble'
import { WhatsAppContact } from '@/types/whatsapp'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Hoje'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString()
}

export function MessagesPanel({
  contact,
  onBack,
}: {
  contact: WhatsAppContact | null
  onBack: () => void
}) {
  const { messages } = useWhatsappMessages(contact?.id || null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [messages])

  if (!contact) {
    return (
      <div className="flex-1 hidden sm:flex flex-col items-center justify-center bg-muted/10 relative">
        <div className="text-center z-10 p-6 rounded-xl bg-background/80 backdrop-blur shadow-sm border">
          <h2 className="text-xl font-medium mb-2">WhatsApp Web</h2>
          <p className="text-muted-foreground text-sm">
            Selecione uma conversa para começar a interagir
          </p>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setSending(true)
    try {
      const { error } = await supabase.functions.invoke('send-message', {
        body: {
          instance_id: contact.instance_id || 'da5f1f9f-7d94-4b41-b1e5-b09e3148f983',
          phone: contact.phone_number,
          message: input.trim(),
        },
      })
      if (error) throw error
      setInput('')
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col relative w-full h-full">
      <div className="h-16 px-4 flex items-center gap-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-border shadow-sm z-10 shrink-0">
        <Button variant="ghost" size="icon" className="sm:hidden -ml-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.profile_pic_url || ''} />
          <AvatarFallback>{contact.push_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{contact.push_name || contact.phone_number}</span>
          <span className="text-xs text-muted-foreground">{contact.phone_number}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="absolute inset-0 opacity-40 dark:opacity-5 pointer-events-none bg-[url('https://img.usecurling.com/p/500/500?q=pattern&shape=outline&color=gray')] bg-[length:300px]" />
        <ScrollArea className="h-full px-4 py-4 sm:px-8">
          <div className="flex flex-col gap-1 pb-4 max-w-4xl mx-auto z-10 relative">
            {messages.map((msg, i) => {
              const currentDay = new Date(msg.timestamp!).toLocaleDateString()
              const prevDay =
                i > 0 ? new Date(messages[i - 1].timestamp!).toLocaleDateString() : null
              const showDateSeparator = currentDay !== prevDay

              const isConsecutive =
                !showDateSeparator &&
                i > 0 &&
                messages[i - 1].from_me === msg.from_me &&
                new Date(msg.timestamp!).getTime() -
                  new Date(messages[i - 1].timestamp!).getTime() <
                  60000

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <span className="bg-background/80 backdrop-blur shadow-sm text-xs px-3 py-1 rounded-lg text-muted-foreground uppercase">
                        {formatDate(msg.timestamp!)}
                      </span>
                    </div>
                  )}
                  <MessageBubble message={msg} isConsecutive={isConsecutive} />
                </div>
              )
            })}
            <div ref={scrollRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-end gap-2 z-10 shrink-0">
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" disabled>
          <Paperclip className="h-5 w-5" />
        </Button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Digite uma mensagem"
          className="flex-1 bg-white dark:bg-[#2a3942] border-0 rounded-lg px-4 py-2.5 text-[15px] focus:ring-0 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="shrink-0 h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white p-0"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
