import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Loader2, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Lead } from '@/types/crm'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import useLeadStore from '@/stores/useLeadStore'
import { cn } from '@/lib/utils'

interface WhatsAppChatSheetProps {
  lead: Lead
}

export function WhatsAppChatSheet({ lead }: WhatsAppChatSheetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { user } = useAuthStore()
  const { updateLead } = useLeadStore()

  const [contactId, setContactId] = useState<string | null>(null)

  useEffect(() => {
    if (open && lead.phone) {
      fetchMessages()
    }
  }, [open, lead.phone])

  useEffect(() => {
    if (!contactId || !open) return

    const channel = supabase
      .channel(`whatsapp-lead-${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `contact_id=eq.${contactId}`,
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
  }, [contactId, open])

  const fetchMessages = async () => {
    if (!lead.phone) return
    setLoading(true)
    try {
      const canonicalPhone = lead.phone.replace(/\D/g, '')
      let targetContactId = null
      let targetJid = null

      // Find contact by phone
      let { data: contactList } = await supabase
        .from('whatsapp_contacts')
        .select('id, remote_jid')
        .like('remote_jid', `${canonicalPhone}%`)
        .limit(1)

      if (contactList && contactList.length > 0) {
        targetContactId = contactList[0].id
        targetJid = contactList[0].remote_jid
      } else {
        const { data: contactByPhone } = await supabase
          .from('whatsapp_contacts')
          .select('id, remote_jid')
          .eq('phone_number', canonicalPhone)
          .limit(1)

        if (contactByPhone && contactByPhone.length > 0) {
          targetContactId = contactByPhone[0].id
          targetJid = contactByPhone[0].remote_jid
        }
      }

      if (targetContactId && targetJid) {
        setContactId(targetContactId)

        // Sincronizar o histórico com a nova rota refatorada
        await supabase.functions
          .invoke('uazapi-sync-history', {
            body: {
              instanceName: 'comercial_era',
              chatid: targetJid,
            },
          })
          .catch(console.error)

        const { data, error } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('contact_id', targetContactId)
          .order('timestamp', { ascending: true })

        if (!error) {
          setMessages(data || [])
        }
      } else {
        setMessages([])
        setContactId(null)
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user || !lead.phone) return

    setSending(true)
    const currentMsg = message
    setMessage('')

    try {
      let chatId = `${lead.phone.replace(/\D/g, '')}@s.whatsapp.net`
      if (contactId) {
        const { data } = await supabase
          .from('whatsapp_contacts')
          .select('remote_jid')
          .eq('id', contactId)
          .single()
        if (data?.remote_jid) chatId = data.remote_jid
      }

      const { data, error } = await supabase.functions.invoke('uazapi-send-message', {
        body: {
          instanceName: 'comercial_era',
          contactId: contactId,
          number: chatId,
          text: currentMsg,
        },
      })

      if (error) throw error

      if (!contactId) {
        setTimeout(fetchMessages, 2000)
      }

      toast({
        title: 'Mensagem Enviada!',
        description: `Mensagem enviada com sucesso para o WhatsApp do Lead.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro de Envio',
        description: 'Falha ao enviar mensagem para o WhatsApp do Lead.',
        variant: 'destructive',
      })
      setMessage(currentMsg)
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-900/20"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="sr-only">WhatsApp</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[95vw] sm:max-w-md flex flex-col gap-0 p-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <SheetHeader className="p-4 border-b border-border bg-green-600">
          <SheetTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp - {lead.name}
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
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg mx-4 border border-border shadow-sm">
                <Bot className="h-10 w-10 mx-auto mb-3 text-green-600/50" />
                <p className="font-medium text-foreground">Nenhuma mensagem ainda.</p>
                <p className="text-xs mt-1">
                  Envie a primeira mensagem. A inteligência artificial qualificará o lead
                  automaticamente com base na interação.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOutgoing = msg.from_me
                  const text = msg.text || ''
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
                            ? 'bg-green-600 text-white rounded-tr-sm'
                            : 'bg-background border border-border text-foreground rounded-tl-sm',
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{text}</p>
                        <span
                          className={cn(
                            'text-[10px] block mt-1.5 font-medium',
                            isOutgoing ? 'text-green-100' : 'text-muted-foreground',
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

          <div className="p-4 bg-background border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lead.phone ? 'Digite sua mensagem...' : 'Lead sem número registrado'}
                className="flex-1 rounded-2xl bg-muted focus-visible:ring-green-600"
                disabled={sending || !lead.phone}
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full h-10 w-10 shrink-0 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95"
                disabled={sending || !message.trim() || !lead.phone}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
