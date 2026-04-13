import { useEffect, useState } from 'react'
import { FileText, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

export default function EmployeeDocumentsTab({ employeeId }: { employeeId: string }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('upload_date', { ascending: false })
      .then(({ data }) => {
        if (data) setDocuments(data)
        setLoading(false)
      })
  }, [employeeId])

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando documentos...
      </div>
    )
  }

  return (
    <div className="border rounded-md p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto mt-4">
      {documents.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          Nenhum documento anexado a este colaborador.
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded bg-muted/20 gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm leading-none mb-1">{doc.document_type}</p>
                <p className="text-xs text-muted-foreground">
                  Anexado em: {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {doc.expiration_date && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Vence:{' '}
                  {new Date(doc.expiration_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              )}
              <Badge
                variant={doc.status === 'Válido' ? 'default' : 'destructive'}
                className="font-normal text-xs"
              >
                {doc.status}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
