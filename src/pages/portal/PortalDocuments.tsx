import { useState } from 'react'
import { Upload, FileText, Download, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import useAuthStore from '@/stores/useAuthStore'
import useClientStore from '@/stores/useClientStore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function PortalDocuments() {
  const { clientId } = useAuthStore()
  const { clients, addDocument } = useClientStore()
  const { toast } = useToast()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const client = clients.find((c) => c.id === clientId)
  const documents = client?.documents || []

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !clientId) return

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 25
      })
    }, 300)

    setTimeout(() => {
      setIsUploading(false)
      addDocument(clientId, {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })
      toast({
        title: 'Documento enviado com sucesso!',
        description: `O arquivo ${file.name} já está disponível na plataforma.`,
      })
    }, 1500)

    if (e.target) e.target.value = ''
  }

  const getFileIcon = (type: string) => {
    return <FileText className="w-6 h-6 text-blue-500" />
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Meus Documentos</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Gerencie arquivos, propostas e contratos relacionados à sua conta.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 order-1">
          <Card className="shadow-sm border-dashed border-2">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Enviar Arquivo</CardTitle>
              <CardDescription>Formatos aceitos: PDF, JPG, PNG.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              {!isUploading ? (
                <div
                  className="w-full aspect-video sm:aspect-square max-h-48 rounded-xl bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors text-center p-4"
                  onClick={() => document.getElementById('portal-upload')?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Clique para fazer upload</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Selecione um documento do seu dispositivo
                  </p>
                  <input
                    id="portal-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video sm:aspect-square max-h-48 rounded-xl bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
                  {uploadProgress < 100 ? (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-4 animate-bounce" />
                      <p className="text-sm font-medium mb-2">Enviando arquivo...</p>
                      <Progress value={uploadProgress} className="w-full h-2" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
                      <p className="text-sm font-medium text-emerald-600">Concluído!</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 order-2">
          {/* Desktop View */}
          <Card className="shadow-sm h-full hidden md:flex flex-col">
            <CardHeader className="bg-muted/30 border-b pb-4 shrink-0">
              <CardTitle className="text-lg">Arquivos Salvos</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-md shrink-0">
                            {getFileIcon(doc.type)}
                          </div>
                          <span
                            className="truncate max-w-[200px] lg:max-w-xs block"
                            title={doc.name}
                          >
                            {doc.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(doc.createdAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-primary hover:text-primary"
                        >
                          <a href={doc.url} download={doc.name}>
                            <Download className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline-block">Baixar</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        Nenhum documento disponível no momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden pb-6">
            <h2 className="text-lg font-semibold mb-2">Arquivos Salvos</h2>
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex flex-col overflow-hidden w-full">
                      <span className="font-semibold text-base truncate block" title={doc.name}>
                        {doc.name}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Adicionado em {format(new Date(doc.createdAt), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full text-primary hover:text-primary mt-2"
                  >
                    <a href={doc.url} download={doc.name}>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Arquivo
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {documents.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border rounded-lg bg-card">
                Nenhum documento disponível.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
