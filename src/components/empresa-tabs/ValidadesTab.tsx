import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { getExpiryStatus, getStatusConfig, getDaysUntilExpiry } from '@/lib/document-status'
import { fetchExpiringDocs, type ExpiringDoc } from '@/services/empresa-validades'

export function ValidadesTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<ExpiringDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(30)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDocs(await fetchExpiringDocs(empresaId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar validades.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    load()
  }, [load])

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      if (!d.dataValidade) return false
      const days = getDaysUntilExpiry(d.dataValidade)
      if (days === null) return false
      return days >= 0 && days <= filter
    })
  }, [docs, filter])

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold">Documentos por Vencer</h3>
      </div>
      <div className="flex gap-2">
        {[30, 60, 90].map((d) => (
          <Button
            key={d}
            size="sm"
            variant={filter === d ? 'default' : 'outline'}
            onClick={() => setFilter(d)}
          >
            {d} dias
          </Button>
        ))}
      </div>
      {filteredDocs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhum documento vencendo no período selecionado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const status = getExpiryStatus(doc.dataValidade)
            const cfg = getStatusConfig(status)
            const days = getDaysUntilExpiry(doc.dataValidade)
            return (
              <div
                key={`${doc.tabela}-${doc.id}`}
                className="flex items-center gap-3 p-3 rounded border border-border/40 bg-background/20"
              >
                <span className={cn('w-3 h-3 rounded-full shrink-0', cfg.dotClass)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.tipo}</p>
                  <p className="text-xs text-muted-foreground truncate">{doc.entidade}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {doc.dataValidade
                      ? new Date(doc.dataValidade).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                  <Badge variant="outline" className={cn('text-[10px] mt-0.5', cfg.badgeClass)}>
                    {cfg.label}
                    {days !== null ? ` (${days}d)` : ''}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
