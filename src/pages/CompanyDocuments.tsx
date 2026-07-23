import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Building2,
  Upload,
  Loader2,
  FileText,
  Cloud,
  UserPlus,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  fetchAllCompanies,
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
import { NewCompanyDialog } from '@/components/company-documents/NewCompanyDialog'
import { ColaboradorSection } from '@/components/company-documents/ColaboradorSection'
import { InsertClientDialog } from '@/components/company-documents/InsertClientDialog'

export default function CompanyDocuments() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [companies, setCompanies] = useState<CompanyInfo[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [driveSyncing, setDriveSyncing] = useState(false)
  const [showInsertButton, setShowInsertButton] = useState(false)
  const [insertDialogOpen, setInsertDialogOpen] = useState(false)
  const [newCompanyOpen, setNewCompanyOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)

  const company = companies.find((c) => c.id === selectedId) || null

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchAllCompanies()
      setCompanies(list)
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id)
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar empresas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast, selectedId])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

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

  const handleCreateCompany = async (data: {
    empresa: string
    cnpj: string
    cpf_socio: string
    responsavel: string
    telefone: string
    email: string
    senhas_acesso: CredentialEntry[]
  }): Promise<CompanyInfo> => {
    const created = await createCompanyInfo(data)
    setCompanies((prev) => [...prev, created])
    setSelectedId(created.id)
    toast({ title: 'Sucesso', description: 'Empresa criada com sucesso.' })
    return created
  }

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
      await loadCompanies()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
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
      await loadCompanies()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
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
      toast({ title: 'Sucesso', description: 'Dados atualizados.' })
      setShowInsertButton(true)
      setDriveSyncing(true)
      syncToGoogleDrive(company.id)
        .then(() => toast({ title: 'Google Drive', description: 'Sincronização concluída.' }))
        .catch(() =>
          toast({ title: 'Aviso', description: 'Falha na sincronização.', variant: 'destructive' }),
        )
        .finally(() => setDriveSyncing(false))
      await loadCompanies()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
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
            Gerencie informações cadastrais, documentos corporativos e colaboradores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {driveSyncing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cloud className="w-4 h-4 animate-pulse" /> Sincronizando...
            </div>
          )}
          <Button variant="default" className="gap-2" onClick={() => setNewCompanyOpen(true)}>
            <Plus className="w-4 h-4" /> Nova Empresa
          </Button>
        </div>
      </div>

      {companies.length > 1 && (
        <div className="mb-4 relative">
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between gap-2"
            onClick={() => setSelectorOpen((v) => !v)}
          >
            <span className="truncate">{company?.empresa || 'Selecione uma empresa'}</span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </Button>
          {selectorOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 sm:right-auto z-20 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto min-w-[200px]">
              {companies.map((c) => (
                <button
                  key={c.id}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors',
                    c.id === selectedId && 'bg-primary/10 font-medium',
                  )}
                  onClick={() => {
                    setSelectedId(c.id)
                    setSelectorOpen(false)
                  }}
                >
                  {c.empresa}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showInsertButton && company && (
        <Alert className="mb-4 border-primary/30 bg-primary/5">
          <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm">Dados da empresa salvos! Deseja inserir como cliente?</span>
            <Button size="sm" className="gap-2 shrink-0" onClick={() => setInsertDialogOpen(true)}>
              <UserPlus className="w-4 h-4" /> Inserir no Cliente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {company ? (
        <div className="grid lg:grid-cols-2 gap-6 w-full pb-12">
          <CompanyInfoForm company={company} onSave={handleSave} />
          <div className="space-y-6">
            <Card className="bg-card/60 border-border/50 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Anexar Documentos
                </CardTitle>
                <CardDescription>
                  Faça upload de contratos, certidões e outros arquivos.
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
                  documents={company.documentos || []}
                  signedUrls={signedUrls}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <ColaboradorSection empresaDocId={company.id} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">Nenhuma empresa cadastrada</p>
          <p className="text-sm mb-4">Crie sua primeira empresa para começar.</p>
          <Button className="gap-2" onClick={() => setNewCompanyOpen(true)}>
            <Plus className="w-4 h-4" /> Nova Empresa
          </Button>
        </div>
      )}

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        files={pendingFiles}
        onConfirm={handleUploadConfirm}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      <NewCompanyDialog
        open={newCompanyOpen}
        onOpenChange={setNewCompanyOpen}
        onCreate={handleCreateCompany}
      />

      <InsertClientDialog
        open={insertDialogOpen}
        onOpenChange={setInsertDialogOpen}
        company={company}
      />
    </div>
  )
}
