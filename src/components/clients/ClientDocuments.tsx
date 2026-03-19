import { Upload, File as FileIcon, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import useClientStore from '@/stores/useClientStore'
import { Client } from '@/types/client'

export function ClientDocuments({ client }: { client: Client }) {
  const { addDocument } = useClientStore()
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      addDocument(client.id, {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })
      toast({
        title: 'Documento enviado',
        description: `${file.name} foi adicionado com sucesso.`,
      })
    }
    if (e.target) e.target.value = ''
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
          <CardDescription>
            Adicione novos arquivos ao perfil do cliente (PDF, JPG, PNG).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">Clique para selecionar arquivos</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG</p>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos Salvos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-muted-foreground" />
                    {doc.name}
                  </TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} download={doc.name}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {client.documents.length === 0 && (
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
