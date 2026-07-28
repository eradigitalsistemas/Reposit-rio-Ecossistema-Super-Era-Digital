import { useState, useEffect, useCallback, useMemo } from 'react'
import { Loader2, FileBarChart, Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { fetchComplianceDocs, type ComplianceDoc } from '@/services/empresa-compliance'
import {
  getComplianceStatus,
  getDaysFromExpiry,
  getComplianceStatusConfig,
} from '@/lib/compliance-status'
import { generateCompliancePrintHTML, printComplianceReport } from '@/lib/compliance-print'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const CATEGORIAS = ['Certidões', 'Documentos SST', 'Atestados', 'Constituição'] as const

const TAB_MAP: Record<string, string> = {
  Certidões: 'certidoes',
  'Documentos SST': 'sst',
  Atestados: 'colaboradores',
  Constituição: 'constituicao',
}

interface Props {
  empresaId: string
  empresaNome: string
  empresaCnpj: string | null
  onNavigateTab: (tab: string) => void
}

export function ComplianceReportTab({ empresaId, empresaNome, empresaCnpj, onNavigateTab }: Props) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<ComplianceDoc[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth())
  const [ano, setAno] = useState(now.getFullYear())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDocs(await fetchComplianceDocs(empresaId))
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar documentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    load()
  }, [load])

  const referenceDate = useMemo(() => new Date(ano, mes, 1), [ano, mes])

  const anos = useMemo(() => {
    const y = new Date().getFullYear()
    return [y - 2, y - 1, y, y + 1, y + 2]
  }, [])

  const handlePrint = () => {
    const html = generateCompliancePrintHTML(empresaNome, empresaCnpj || '', mes, ano, docs)
    printComplianceReport(html)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Relatório de Compliance</h3>
            <p className="text-xs text-muted-foreground">
              {empresaNome}
              {empresaCnpj && ` • CNPJ: ${empresaCnpj}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={handlePrint}>
            <Download className="w-4 h-4" /> Baixar PDF
          </Button>
        </div>
      </div>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 opacity-20" />
            Nenhum documento com vencimento neste período.
          </CardContent>
        </Card>
      ) : (
        CATEGORIAS.map((cat) => {
          const catDocs = docs.filter((d) => d.categoria === cat)
          if (catDocs.length === 0) return null
          return (
            <div key={cat} className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">{cat}</h4>
              <div className="space-y-1.5">
                {catDocs.map((doc) => {
                  const status = getComplianceStatus(doc.dataValidade, referenceDate)
                  const cfg = getComplianceStatusConfig(status)
                  const days = getDaysFromExpiry(doc.dataValidade, referenceDate)
                  const daysLabel =
                    days === null
                      ? 'Sem data'
                      : days >= 0
                        ? `${days} dias restantes`
                        : `Vencido há ${Math.abs(days)} dias`
                  return (
                    <div
                      key={`${doc.categoria}-${doc.id}`}
                      className="flex items-center gap-3 p-2.5 rounded border border-border/40 bg-background/20"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <button
                        onClick={() => onNavigateTab(TAB_MAP[cat])}
                        className="text-sm font-medium truncate flex-1 min-w-0 text-left hover:underline"
                      >
                        {doc.tipo}
                        {doc.colaboradorNome && (
                          <span className="text-muted-foreground"> ({doc.colaboradorNome})</span>
                        )}
                      </button>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {doc.dataValidade
                          ? new Date(doc.dataValidade).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                        {daysLabel}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0"
                        style={{
                          color: cfg.color,
                          backgroundColor: cfg.bgColor,
                          borderColor: cfg.color + '30',
                        }}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
