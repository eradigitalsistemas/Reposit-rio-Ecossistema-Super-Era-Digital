import { useRef, useState, type ReactNode } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
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
        'gap-1.5 text-xs h-8',
        done
          ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/5'
          : 'text-amber-600 border-amber-500/30 bg-amber-500/5',
      )}
      onClick={() => onChange(done ? 'Pendente' : 'Concluído')}
    >
      <span className={cn('w-2 h-2 rounded-full', done ? 'bg-emerald-500' : 'bg-amber-500')} />
      {status}
    </Button>
  )
}

export function FileUploadButton({
  onFile,
  accept = '.pdf',
  label = 'Enviar',
  disabled,
}: {
  onFile: (file: File) => void
  accept?: string
  label?: string
  disabled?: boolean
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
        variant="outline"
        size="sm"
        className="gap-1.5 h-8 text-xs"
        disabled={disabled}
        onClick={() => ref.current?.click()}
      >
        <Upload className="w-3.5 h-3.5" />
        {label}
      </Button>
    </>
  )
}

export function DownloadButton({ path, disabled }: { path: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    setLoading(true)
    const url = await getEmpresaFileUrl(path)
    if (url) window.open(url, '_blank')
    setLoading(false)
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      disabled={disabled || loading}
      onClick={handle}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
