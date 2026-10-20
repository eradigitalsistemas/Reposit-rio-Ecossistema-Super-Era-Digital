import React, { useRef, useState } from 'react'
import {
  UploadCloud,
  FileCheck2,
  AlertCircle,
  X,
  FileText,
  Eye,
  Download,
  RefreshCw,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getEmpresaFileUrl } from '@/services/empresa-files'
import { getExpiryStatus, getStatusConfig } from '@/lib/document-status'

export interface DocumentUploadCardProps {
  title: string
  subtitle?: string
  tipo: string
  fileUrl?: string | null
  fileName?: string | null
  validade?: string | null
  status?: string | null
  required?: boolean
  busy?: boolean
  onUpload: (file: File) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onUpdateValidade?: (validade: string) => Promise<void> | void
  onToggleStatus?: (status: string) => Promise<void> | void
  accept?: string
}

export function DocumentUploadCard({
  title,
  subtitle,
  fileUrl,
  fileName,
  validade,
  status,
  required,
  busy,
  onUpload,
  onDelete,
  onUpdateValidade,
  onToggleStatus,
  accept = '.pdf,image/*',
}: DocumentUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [editingValidade, setEditingValidade] = useState(false)
  const [tempValidade, setTempValidade] = useState(validade || '')

  const hasFile = Boolean(fileUrl)
  const expiryStatus = validade ? getExpiryStatus(validade) : null
  const expiryCfg = expiryStatus ? getStatusConfig(expiryStatus) : null
  const isDone = status === 'Concluído'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!busy) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (busy) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await onUpload(file)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleView = async () => {
    if (!fileUrl) return
    setIsOpening(true)
    try {
      const url = await getEmpresaFileUrl(fileUrl)
      if (url) window.open(url, '_blank')
    } finally {
      setIsOpening(false)
    }
  }

  const handleSaveValidade = async () => {
    if (onUpdateValidade) {
      await onUpdateValidade(tempValidade)
    }
    setEditingValidade(false)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-200',
        hasFile
          ? 'bg-card/70 border-border/70 hover:border-border hover:shadow-md'
          : 'bg-muted/10 border-dashed border-border/60 hover:border-primary/50 hover:bg-muted/20',
        isDragging && 'border-primary ring-2 ring-primary/20 bg-primary/5',
        busy && 'opacity-60 pointer-events-none',
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Info lateral esquerda */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              hasFile
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-muted text-muted-foreground border border-border/40',
            )}
          >
            {hasFile ? <FileCheck2 className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground tracking-tight">{title}</span>
              {required && (
                <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  Obrigatório
                </span>
              )}
              {hasFile ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] gap-1 py-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Anexado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] gap-1 py-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Pendente
                </Badge>
              )}

              {/* Status Concluído / Pendente opcional */}
              {onToggleStatus && (
                <button
                  type="button"
                  onClick={() => onToggleStatus(isDone ? 'Pendente' : 'Concluído')}
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all inline-flex items-center gap-1',
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50',
                  )}
                  title="Alterar status de conferência"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isDone ? 'bg-emerald-400' : 'bg-muted-foreground',
                    )}
                  />
                  {status || 'Pendente'}
                </button>
              )}
            </div>

            {subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>}

            {hasFile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5 flex-wrap">
                <span className="font-mono text-[11px] truncate max-w-[220px] text-foreground/80 bg-background/50 px-1.5 py-0.5 rounded border border-border/40">
                  {fileName || fileUrl?.split('/').pop() || 'Arquivo anexado'}
                </span>

                {/* Validade */}
                {validade && expiryCfg && (
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] gap-1 py-0', expiryCfg.badgeClass)}
                  >
                    <Calendar className="w-2.5 h-2.5" />
                    Val.: {new Date(validade).toLocaleDateString('pt-BR')} ({expiryCfg.label})
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ações da direita */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          {hasFile ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-border/60 hover:bg-accent"
                onClick={handleView}
                disabled={busy || isOpening}
                title="Abrir em nova aba"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                Visualizar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-border/60 hover:bg-accent"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                title="Substituir por outro arquivo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Substituir
              </Button>

              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={onDelete}
                  disabled={busy}
                  title="Remover documento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-1.5 text-xs shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Anexar Arquivo
            </Button>
          )}
        </div>
      </div>

      {/* Editor rápido de validade (se fornecido) */}
      {onUpdateValidade && hasFile && (
        <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
          {editingValidade ? (
            <div className="flex items-center gap-2 flex-wrap w-full">
              <span className="text-xs">Data de Validade:</span>
              <input
                type="date"
                value={tempValidade}
                onChange={(e) => setTempValidade(e.target.value)}
                className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-6 text-[11px] px-2"
                onClick={handleSaveValidade}
              >
                Salvar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-[11px] px-2"
                onClick={() => {
                  setTempValidade(validade || '')
                  setEditingValidade(false)
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {validade
                  ? `Validade: ${new Date(validade).toLocaleDateString('pt-BR')}`
                  : 'Sem data de validade informada'}
              </span>
              <button
                type="button"
                onClick={() => setEditingValidade(true)}
                className="text-[11px] text-primary hover:underline ml-auto"
              >
                {validade ? 'Alterar data' : '+ Definir validade'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
