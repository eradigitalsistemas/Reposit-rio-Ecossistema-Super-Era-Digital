import { useState, useRef } from 'react'
import { Loader2, Upload, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { formatCPF } from '@/lib/utils/cpf'
import { parseColaboradoresCSV, type ParsedCsvRow } from '@/lib/csv-parser'
import { checkDuplicateCpfs, batchCreateColaboradores } from '@/services/empresas'

interface Props {
  empresaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

interface PreviewRow extends ParsedCsvRow {
  selected: boolean
  isDuplicate: boolean
}

const FALSE_VALUES = ['false', '0', 'nao', 'não', 'inativo']

export function ImportColaboradoresDialog({ empresaId, open, onOpenChange, onImported }: Props) {
  const { toast } = useToast()
  const [rows, setRows] = useState<PreviewRow[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5 MB.',
        variant: 'destructive',
      })
      return
    }
    setParsing(true)
    setRows([])
    try {
      const text = await file.text()
      const parsed = parseColaboradoresCSV(text)
      if (parsed.length === 0) {
        toast({
          title: 'CSV vazio ou inválido',
          description: 'Verifique se o arquivo possui cabeçalho e dados.',
          variant: 'destructive',
        })
        return
      }
      const cpfs = parsed.map((r) => r.cpf.replace(/\D/g, '')).filter(Boolean)
      const duplicates = await checkDuplicateCpfs(empresaId, cpfs)
      const preview: PreviewRow[] = parsed.map((r) => {
        const cleanCpf = r.cpf.replace(/\D/g, '')
        const isDuplicate = duplicates.has(cleanCpf)
        return { ...r, isDuplicate, selected: !isDuplicate && !!r.nome.trim() }
      })
      setRows(preview)
    } catch {
      toast({ title: 'Erro ao processar CSV', variant: 'destructive' })
    } finally {
      setParsing(false)
    }
  }

  const toggleRow = (idx: number) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)))
  }

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected)
    if (selected.length === 0) return
    setImporting(true)
    try {
      const payload = selected.map((r) => ({
        nome: r.nome.trim(),
        cpf: r.cpf.replace(/\D/g, '') || null,
        email: r.email.trim() || `${crypto.randomUUID()}@placeholder.com`,
        especialidades: r.especialidades
          ? r.especialidades
              .split(';')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        ativo: r.ativo.trim() === '' || !FALSE_VALUES.includes(r.ativo.toLowerCase().trim()),
      }))
      const { success, errors } = await batchCreateColaboradores(empresaId, payload)
      const dupCount = rows.filter((r) => r.isDuplicate).length
      toast({
        title: 'Importação concluída',
        description: `${success} colaboradores importados, ${dupCount} duplicados ignorados${errors > 0 ? `, ${errors} erros` : ''}.`,
      })
      onOpenChange(false)
      setRows([])
      onImported()
    } catch {
      toast({ title: 'Erro na importação', variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const selectedCount = rows.filter((r) => r.selected).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Importar Colaboradores
          </DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV com as colunas: nome, cpf, email, especialidades, ativo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={parsing || importing}
            className="w-full gap-2"
          >
            {parsing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}{' '}
            Selecionar arquivo CSV
          </Button>
          {rows.length > 0 && (
            <>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {rows.length} linhas encontradas, {selectedCount} selecionadas
                </span>
                <span className="text-xs">Máx. 5 MB · Formato CSV</span>
              </div>
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={i} className={cn(r.isDuplicate && 'bg-red-500/5')}>
                        <TableCell>
                          <Checkbox checked={r.selected} onCheckedChange={() => toggleRow(i)} />
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {r.nome || <span className="text-destructive">Sem nome</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCPF(r.cpf) || r.cpf || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {r.email || '-'}
                        </TableCell>
                        <TableCell>
                          {r.isDuplicate ? (
                            <span className="flex items-center gap-1 text-xs text-red-500">
                              <AlertTriangle className="w-3 h-3" />
                              Duplicado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-emerald-500">
                              <CheckCircle2 className="w-3 h-3" />
                              OK
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false)
              setRows([])
            }}
            disabled={importing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || selectedCount === 0}
            className="gap-2"
          >
            {importing && <Loader2 className="w-4 h-4 animate-spin" />} Importar Selecionados (
            {selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
