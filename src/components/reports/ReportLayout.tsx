import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReportLayoutProps {
  title: string
  description: string
  filters?: ReactNode
  summaryCards?: ReactNode
  chart?: ReactNode
  table?: ReactNode
  loading?: boolean
  onExport?: () => void
}

export function ReportLayout({
  title,
  description,
  filters,
  summaryCards,
  chart,
  table,
  loading,
  onExport,
}: ReportLayoutProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {onExport && (
            <Button onClick={onExport} variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center border rounded-lg border-dashed">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {summaryCards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryCards}
            </div>
          )}
          {chart && (
            <Card>
              <CardContent className="pt-6">{chart}</CardContent>
            </Card>
          )}
          {table && (
            <Card>
              <CardContent className="p-0 overflow-x-auto">{table}</CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
