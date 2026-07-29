import { useState } from 'react'
import { Building2, Loader2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ComplianceStatus } from '@/lib/compliance-status'
import { useCompanyCompliance } from '@/hooks/use-company-compliance'

const STATUS_CONFIG: Record<
  ComplianceStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  valid: {
    label: 'Regular',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    icon: CheckCircle2,
  },
  near: {
    label: 'Atenção',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    icon: Clock,
  },
  expired: {
    label: 'Vencido',
    color: 'bg-red-500/10 text-red-600 border-red-500/30',
    icon: XCircle,
  },
  none: {
    label: 'Sem dados',
    color: 'bg-muted/10 text-muted-foreground border-border',
    icon: AlertCircle,
  },
}

export function CompanyComplianceDashboard({
  onSelectCompany,
}: {
  onSelectCompany: (id: string) => void
}) {
  const { dashboardData: companies, loading, error, refresh } = useCompanyCompliance()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filtered = companies
    .filter((c) => filter === 'all' || c.status === filter)
    .sort((a, b) => {
      if (sortBy === 'expiry') {
        if (!a.soonestExpiry) return 1
        if (!b.soonestExpiry) return -1
        return new Date(a.soonestExpiry).getTime() - new Date(b.soonestExpiry).getTime()
      }
      return a.nome.localeCompare(b.nome)
    })

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col items-center py-20 text-muted-foreground">
        <AlertCircle className="w-10 h-10 mb-3 text-destructive" />
        <p className="text-sm mb-3">{error}</p>
        <Button variant="outline" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    )

  if (companies.length === 0)
    return (
      <div className="flex flex-col items-center py-20 text-muted-foreground">
        <Building2 className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">Nenhuma empresa cadastrada.</p>
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="valid">🟢 Regular</SelectItem>
            <SelectItem value="near">🟡 Atenção</SelectItem>
            <SelectItem value="expired">🔴 Vencido</SelectItem>
            <SelectItem value="none">⚪ Sem dados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome (A-Z)</SelectItem>
            <SelectItem value="expiry">Vencimento mais próximo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const cfg = STATUS_CONFIG[c.status]
          return (
            <Card
              key={c.id}
              onClick={() => onSelectCompany(c.id)}
              className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 animate-fade-in-up"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">
                      {c.nome || c.empresa || 'Sem nome'}
                    </span>
                  </div>
                  <Badge variant="outline" className={cn('shrink-0 gap-1', cfg.color)}>
                    <cfg.icon className="w-3 h-3" /> {cfg.label}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {c.cnpj && <p>CNPJ: {c.cnpj}</p>}
                  {c.soonestExpiry && (
                    <p>
                      Próximo vencimento: {new Date(c.soonestExpiry).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <span className="text-red-500">{c.expiredDocs} vencidos</span>
                    <span className="text-amber-500">{c.expiringDocs} a vencer</span>
                    <span className="text-muted-foreground">{c.totalDocs} total</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
