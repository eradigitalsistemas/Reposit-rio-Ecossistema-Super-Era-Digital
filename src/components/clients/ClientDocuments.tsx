import { useState, useEffect } from 'react'
import { Upload, File as FileIcon, Download, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useClientStore from '@/stores/useClientStore'
import { Client, ClientDocument } from '@/types/client'
import { supabase } from '@/lib/supabase/client'

export function ClientDocuments({ client }: { client: Client }) {
  const { addDocument, deleteDocument } = useClientStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadUrls = async () => {
      const urls: Record<string, string> = {}
      for (const doc of client.documents || []) {
        if (doc.path) {
          // Attempt to get url from the new bucket
          let { data } = await supabase.storage
            .from('documentos-clientes')
            .createSignedUrl(doc.path, 3600)

          // Fallback to legacy bucket if needed
          if (!data?.signedUrl) {
            const legacyRes = await supabase.storage
              .from('documentos_clientes')
              .createSignedUrl(doc.path, 3600)
            data = legacyRes.data
          }

          if (data?.signedUrl) urls[doc.id] = data.signedUrl
        } else if (doc.url) {
          urls[doc.id] = doc.url
        }
      }
      setSignedUrls(urls)
    }
    loadUrls()
  }, [client.documents])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadProgress(0)
      await addDocument(client.id, file, (p) => setUploadProgress(p))
      setIsUploading(false)
      setUploadProgress(0)
    }
    if (e.target) e.target.value = ''
  }

  const handleDelete = async (doc: ClientDocument) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      await deleteDocument(client.id, doc.id, doc.path)
    }
  }

  return (
    <div className="grid gap-6 h-full pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
          <CardDescription>
            Adicione novos arquivos ao perfil do cliente (Contratos, Identificação, etc).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${
              isUploading
                ? 'opacity-50 cursor-not-allowed bg-muted/20'
                : 'cursor-pointer hover:bg-muted/50'
            }`}
            onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground mb-4" />
            )}
            <p className="text-sm font-medium">
              {isUploading ? 'Enviando arquivo...' : 'Clique para selecionar arquivos'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas PDF, JPG ou PNG (Máximo 5MB)
            </p>

            {isUploading && (
              <div className="w-full max-w-xs mt-4">
                <div className="flex justify-between text-xs mb-1 font-medium text-muted-foreground">
                  <span>Progresso</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Arquivos Salvos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(client.documents || []).map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{doc.name}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(doc.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Download">
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
                        onClick={() => handleDelete(doc)}
                        title="Excluir Arquivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!client.documents || client.documents.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    Nenhum documento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
