import { useEffect, useState } from 'react'
import { FileText, Calendar, Plus, Download, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const documentTypes = [
  'RG',
  'CPF',
  'Comprovante de Residência',
  'Carteira de Trabalho',
  'ASO (Exame Admissional)',
  'Contrato de Trabalho',
  'Certificado',
  'Outros',
]

export default function EmployeeDocumentsTab({ employeeId }: { employeeId: string }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  const [docType, setDocType] = useState('RG')
  const [expiration, setExpiration] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const { toast } = useToast()

  const fetchDocuments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('upload_date', { ascending: false })

    if (data) setDocuments(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDocuments()
  }, [employeeId])

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'Erro', description: 'Selecione um arquivo', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${employeeId}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('documents').insert({
        employee_id: employeeId,
        document_type: docType,
        file_path: fileName,
        expiration_date: expiration || null,
        status: 'Válido',
      })

      if (dbError) throw dbError

      toast({ title: 'Sucesso', description: 'Documento anexado com sucesso' })
      setUploadOpen(false)
      setFile(null)
      setDocType('RG')
      setExpiration('')
      fetchDocuments()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, filePath: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return

    try {
      await supabase.storage.from('employee-documents').remove([filePath])
      await supabase.from('documents').delete().eq('id', docId)
      fetchDocuments()
      toast({ title: 'Sucesso', description: 'Documento excluído' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(filePath, 60)

      if (error) throw error

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Erro ao baixar arquivo', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documentos Anexados</h3>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Anexar Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Documento</label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Vencimento (Opcional)</label>
                <Input
                  type="date"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Arquivo</label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Salvar Documento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md p-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-6 text-muted-foreground animate-pulse">
            Carregando documentos...
          </div>
        ) : documents.length === 0 ? (
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
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {doc.expiration_date && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Vence:{' '}
                    {new Date(doc.expiration_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                )}
                <Badge
                  variant={doc.status === 'Válido' ? 'default' : 'destructive'}
                  className="font-normal text-xs mr-2"
                >
                  {doc.status}
                </Badge>

                <div className="flex items-center gap-1 border-l pl-3 border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDownload(doc.file_path)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(doc.id, doc.file_path)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
