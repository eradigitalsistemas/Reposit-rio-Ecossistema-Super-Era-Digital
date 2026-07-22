import { useState, useEffect, useCallback, useRef } from 'react'
import { Building2, Upload, Loader2, FileText, Cloud } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  fetchCompanyInfo,
  createCompanyInfo,
  updateCompanyInfo,
  uploadCompanyDocument,
  deleteCompanyDocument,
  getDocumentSignedUrl,
  syncToGoogleDrive,
  type CompanyInfo,
  type CompanyDocument,
  type DocumentCategory,
  type CredentialEntry,
} from '@/services/company-documents'
import { CompanyInfoForm } from '@/components/company-documents/CompanyInfoForm'
import { UploadDialog } from '@/components/company-documents/UploadDialog'
import { DocumentList } from '@/components/company-documents/DocumentList'

export default function CompanyDocuments() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [driveSyncing, setDriveSyncing] = useState(false)

  const loadCompany = useCallback(async () => {
    setLoading(true)
    try {
      let info = await fetchCompanyInfo()
      if (!info) {
        info = await createCompanyInfo({ empresa: 'Minha Empresa' })
      }
      setCompany(info)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados da empresa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadCompany()
  }, [loadCompany])

  useEffect(() => {
    const loadUrls = async () => {
      if (!company?.documentos) return
      const urls: Record<string, string> = {}
      for (const doc of company.documentos) {
        if (doc.path) {
          const url = await getDocumentSignedUrl(doc.path)
          if (url) urls[doc.id] = url
        }
      }
      setSignedUrls(urls)
    }
    loadUrls()
  }, [company?.documentos])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setPendingFiles(Array.from(files))
    setUploadDialogOpen(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadConfirm = async (category: DocumentCategory, expiryDate: string | null) => {
    if (!company || pendingFiles.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const pctBase = (i / pendingFiles.length) * 100
        await uploadCompanyDocument(
          company.id,
          pendingFiles[i],
          (pct) => {
            setUploadProgress(Math.round(pctBase + pct / pendingFiles.length))
          },
          category,
          expiryDate,
        )
      }
      toast({ title: 'Sucesso', description: `${pendingFiles.length} arquivo(s) enviado(s).` })
      setUploadDialogOpen(false)
      setPendingFiles([])
      await loadCompany()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload do arquivo.', variant: 'destructive' })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (doc: CompanyDocument) => {
    if (!company) return
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    try {
      await deleteCompanyDocument(company.id, doc)
      toast({ title: 'Sucesso', description: 'Documento excluído.' })
      await loadCompany()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir documento.', variant: 'destructive' })
    }
  }

  const handleSave = async (data: {
    empresa: string
    cnpj: string
    cpf_socio: string
    responsavel: string
    telefone: string
    email: string
    senhas_acesso: CredentialEntry[]
  }) => {
    if (!company) return
    try {
      await updateCompanyInfo(company.id, data)
      toast({ title: 'Sucesso', description: 'Dados da empresa atualizados.' })
      setDriveSyncing(true)
      syncToGoogleDrive(company.id)
        .then(() => toast({ title: 'Google Drive', description: 'Sincronização concluída.' }))
        .catch(() =>
          toast({
            title: 'Aviso',
            description: 'Falha na sincronização com Google Drive.',
            variant: 'destructive',
          }),
        )
        .finally(() => setDriveSyncing(false))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar dados.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col flex-1 p-4 sm:p-6 text-foreground relative z-10 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Documentos da Empresa
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie informações cadastrais, documentos corporativos e senhas.
          </p>
        </div>
        {driveSyncing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cloud className="w-4 h-4 animate-pulse" />
            Sincronizando com Google Drive...
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full pb-12">
        <CompanyInfoForm company={company} onSave={handleSave} />

        <div className="space-y-6">
          <Card className="bg-card/60 border-border/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Anexar Documentos
              </CardTitle>
              <CardDescription>
                Faça upload de contratos, certidões e outros arquivos corporativos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer hover:bg-muted/50',
                  uploading && 'opacity-50 cursor-not-allowed bg-muted/20',
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Clique para selecionar arquivos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG e demais formatos
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/50 shadow-sm backdrop-blur-sm flex-1">
            <CardHeader>
              <CardTitle>Documentos Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList
                documents={company?.documentos || []}
                signedUrls={signedUrls}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        files={pendingFiles}
        onConfirm={handleUploadConfirm}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />
    </div>
  )
}
