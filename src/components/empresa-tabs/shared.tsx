import { useRef, useState, type ReactNode } from 'react'
import { Upload, Download, Loader2, Eye, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getEmpresaFileUrl } from '@/services/empresa-files'

export function StatusToggle({
  status,
  onChange,
  disabled,
}: {
  status: string
  onChange: (s: string) => void
  disabled?: boolean
}) {
  const done = status === 'Concluído'
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        'gap-1.5 text-xs h-8 font-medium transition-all',
        done
          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
          : 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
      )}
      onClick={() => onChange(done ? 'Pendente' : 'Concluído')}
      title={done ? 'Clique para marcar como Pendente' : 'Clique para marcar como Concluído'}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full ring-2',
          done
            ? 'bg-emerald-400 ring-emerald-500/30 animate-pulse'
            : 'bg-amber-400 ring-amber-500/30',
        )}
      />
      {status}
    </Button>
  )
}

export function FileUploadButton({
  onFile,
  accept = '.pdf,image/*',
  label = 'Enviar',
  disabled,
  variant = 'outline',
  size = 'sm',
}: {
  onFile: (file: File) => void
  accept?: string
  label?: string
  disabled?: boolean
  variant?: 'outline' | 'default' | 'ghost' | 'secondary'
  size?: 'sm' | 'default' | 'icon'
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          if (ref.current) ref.current.value = ''
        }}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn('gap-1.5 h-8 text-xs font-medium', size === 'icon' && 'w-8 p-0')}
        disabled={disabled}
        onClick={() => ref.current?.click()}
      >
        <Upload className="w-3.5 h-3.5" />
        {size !== 'icon' && label}
      </Button>
    </>
  )
}

export function ViewFileButton({
  path,
  disabled,
  title = 'Visualizar documento',
}: {
  path: string
  disabled?: boolean
  title?: string
}) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    try {
      const url = await getEmpresaFileUrl(path)
      if (url) window.open(url, '_blank')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      disabled={disabled || loading}
      onClick={handle}
      title={title}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}

export function DownloadButton({
  path,
  disabled,
  title = 'Baixar / Visualizar arquivo',
}: {
  path: string
  disabled?: boolean
  title?: string
}) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    try {
      const url = await getEmpresaFileUrl(path)
      if (url) window.open(url, '_blank')
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      disabled={disabled || loading}
      onClick={handle}
      title={title}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
    </Button>
  )
}

export function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
