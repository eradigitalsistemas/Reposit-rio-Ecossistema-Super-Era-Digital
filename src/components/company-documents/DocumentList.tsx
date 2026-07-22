import { useState, useMemo } from 'react'
import { File as FileIcon, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CompanyDocument } from '@/services/company-documents'
import {
  getExpiryStatus,
  getStatusConfig,
  getDaysUntilExpiry,
  type ExpiryStatus,
} from '@/lib/document-status'

interface DocumentListProps {
  documents: CompanyDocument[]
  signedUrls: Record<string, string>
  onDelete: (doc: CompanyDocument) => void
}

export function DocumentList({ documents, signedUrls, onDelete }: DocumentListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredDocs = useMemo(() => {
    if (statusFilter === 'all') return documents
    return documents.filter((doc) => getExpiryStatus(doc.expiryDate) === statusFilter)
  }, [documents, statusFilter])

  return (
    <div className="space-y-4">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-[200px] h-8">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="valid">🟢 Válido</SelectItem>
          <SelectItem value="near">🟡 Vencendo</SelectItem>
          <SelectItem value="expired">🔴 Vencido</SelectItem>
          <SelectItem value="none">⚪ Sem validade</SelectItem>
        </SelectContent>
      </Select>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Arquivo</TableHead>
            <TableHead className="hidden sm:table-cell">Categoria</TableHead>
            <TableHead className="hidden md:table-cell">Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocs.map((doc) => {
            const status = getExpiryStatus(doc.expiryDate)
            const config = getStatusConfig(status)
            const days = getDaysUntilExpiry(doc.expiryDate)
            return (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-xs">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {doc.category || '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('pt-BR') : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`gap-1.5 ${config.badgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                    {config.label}
                    {days !== null && status !== 'none' && (
                      <span className="text-xs opacity-70">
                        ({days > 0 ? `${days}d` : 'vencido'})
                      </span>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild title="Download / Visualizar">
                      <a
                        href={signedUrls[doc.id] || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.name}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(doc)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {filteredDocs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                Nenhum documento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
