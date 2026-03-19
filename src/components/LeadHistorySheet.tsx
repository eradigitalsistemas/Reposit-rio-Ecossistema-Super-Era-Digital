import { useState, useEffect } from 'react'
import { Eye, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react'
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
import { Lead } from '@/types/crm'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

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
}

export function LeadHistorySheet({ lead }: LeadHistorySheetProps) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchHistory()
    }
  }, [open, lead.id])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('observacoes, data_criacao')
        .eq('id', lead.id)
        .single()

      if (leadError) throw leadError

      const { data: historyData, error: historyError } = await supabase
        .from('historico_leads')
        .select('*')
        .eq('lead_id', lead.id)

      if (historyError) throw historyError

      const items: HistoryItem[] = (historyData || []).map((item) => ({
        id: item.id,
        type: 'interaction',
        date: item.data_criacao,
        title: 'Interação registrada',
        contact: item.contato_nome,
        method: item.forma_contato,
        details: item.detalhes,
      }))

      items.push({
        id: `creation-${lead.id}`,
        type: 'creation',
        date: leadData.data_criacao,
        title: 'Lead criado',
        details: leadData.observacoes || 'Lead adicionado ao sistema na fase inicial.',
      })

      // Strict chronological order (oldest to newest)
      items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setHistory(items)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'Ligação':
        return <Phone className="w-3 h-3" />
      case 'E-mail':
        return <Mail className="w-3 h-3" />
      case 'Mensagem':
        return <MessageSquare className="w-3 h-3" />
      case 'Presencial':
        return <User className="w-3 h-3" />
      default:
        return <MessageSquare className="w-3 h-3" />
    }
  }

  const formatTimelineDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-primary hover:bg-white/10"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="sr-only">Ver Histórico</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[95vw] sm:max-w-md flex flex-col gap-0 p-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 border-b border-white/10">
          <SheetHeader>
            <SheetTitle>Histórico do Lead</SheetTitle>
            <SheetDescription>Linha do tempo de interações com {lead.name}</SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-sm text-white/40 animate-pulse">Carregando histórico...</span>
            </div>
          ) : (
            <div className="relative border-l border-white/10 ml-3 space-y-6 pb-6">
              {history.map((item) => (
                <div key={item.id} className="relative pl-6">
                  <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]" />

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <h4 className="text-sm font-semibold text-white leading-none mt-0.5">
                        {item.title}
                      </h4>
                      <time className="text-xs text-white/60 whitespace-nowrap flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimelineDate(item.date)}
                      </time>
                    </div>

                    {item.type === 'interaction' && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.contact && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-xs text-white border border-white/10">
                            <User className="w-3 h-3" />
                            {item.contact}
                          </div>
                        )}
                        {item.method && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-xs text-white border border-white/10">
                            {getMethodIcon(item.method)}
                            {item.method}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-white/70 bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-white/10 mt-1 whitespace-pre-wrap">
                      {item.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
