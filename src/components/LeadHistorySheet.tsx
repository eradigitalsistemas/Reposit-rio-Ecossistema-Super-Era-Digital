import { useState, useEffect } from 'react'
import { Eye, Clock, User, Phone, Mail, MessageSquare, Building2, MapPin } from 'lucide-react'
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
import { Lead } from '@/types/crm'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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
    if (open) fetchHistory()
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
        details: leadData.observacoes || 'Lead adicionado ao sistema.',
      })

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
        {/* Left Panel: Dossier Details */}
        <div className="w-full md:w-[350px] bg-muted/20 border-b md:border-b-0 md:border-r border-border p-6 overflow-y-auto shrink-0 flex flex-col">
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
                  lead.interestStatus === 'Não Interessado' ? 'bg-red-600' : 'bg-green-600',
                )}
              >
                {lead.interestStatus}
              </Badge>
            </div>
          </SheetHeader>
          <div className="space-y-3 flex-1">
            <DetailItem label="Telefone" icon={Phone} value={lead.phone} />
            <DetailItem label="E-mail" icon={Mail} value={lead.email} />
            <DetailItem label="Empresa" icon={Building2} value={lead.company} />
            <DetailItem label="Endereço" icon={MapPin} value={lead.address} />
          </div>
        </div>

        {/* Right Panel: Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="p-6 pb-4 border-b border-border bg-muted/5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Linha do Tempo e Interações
            </h3>
          </div>
          <ScrollArea className="flex-1 p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="text-sm text-muted-foreground animate-pulse">
                  Carregando histórico...
                </span>
              </div>
            ) : (
              <div className="relative border-l border-border ml-3 space-y-8 pb-8">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="relative pl-6 animate-in fade-in slide-in-from-left-2"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                        <h4 className="text-sm font-bold text-foreground leading-none">
                          {item.title}
                        </h4>
                        <time className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 font-medium bg-muted/30 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          {formatTimelineDate(item.date)}
                        </time>
                      </div>
                      {item.type === 'interaction' && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.contact && (
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
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
