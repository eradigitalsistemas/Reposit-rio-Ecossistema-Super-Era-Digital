import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Building2,
  Upload,
  File as FileIcon,
  Download,
  Trash2,
  Loader2,
  Save,
  FileText,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { formatCNPJ, isValidCNPJ } from '@/lib/utils/cnpj'
import { formatCPF, isValidCPF } from '@/lib/utils/cpf'
import {
  fetchCompanyInfo,
  createCompanyInfo,
  updateCompanyInfo,
  uploadCompanyDocument,
  deleteCompanyDocument,
  getDocumentSignedUrl,
  type CompanyInfo,
  type CompanyDocument,
  type CredentialEntry,
} from '@/services/company-documents'

const EMPTY_CREDENTIALS: CredentialEntry[] = Array.from({ length: 6 }, () => ({
  identificacao: '',
  senha: '',
}))

export default function CompanyDocuments() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    empresa: '',
    cnpj: '',
    cpf_socio: '',
    responsavel: '',
    telefone: '',
    email: '',
  })
  const [cnpjError, setCnpjError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [credentials, setCredentials] = useState<CredentialEntry[]>([...EMPTY_CREDENTIALS])
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({})

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const loadCompany = useCallback(async () => {
    setLoading(true)
    try {
      let info = await fetchCompanyInfo()
      if (!info) {
        info = await createCompanyInfo({ empresa: 'Minha Empresa' })
      }
      setCompany(info)
      setFormData({
        empresa: info.empresa,
        cnpj: info.cnpj,
        cpf_socio: info.cpf_socio,
        responsavel: info.responsavel,
        telefone: info.telefone,
        email: info.email,
      })
      setCredentials(info.senhas_acesso.length === 6 ? info.senhas_acesso : [...EMPTY_CREDENTIALS])
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.cnpj && !isValidCNPJ(formData.cnpj)) {
      setCnpjError('CNPJ inválido')
      return
    }
    setCnpjError('')
    if (formData.cpf_socio && !isValidCPF(formData.cpf_socio)) {
      setCpfError('CPF inválido')
      return
    }
    setCpfError('')
    if (!company) return
    setSaving(true)
    try {
      await updateCompanyInfo(company.id, {
        ...formData,
        senhas_acesso: credentials,
      })
      toast({ title: 'Sucesso', description: 'Dados da empresa atualizados.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar dados.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleCredentialChange = (
    index: number,
    field: 'identificacao' | 'senha',
    value: string,
  ) => {
    setCredentials((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !company) return

    setUploading(true)
    setUploadProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadCompanyDocument(company.id, files[i], (pct) => setUploadProgress(pct))
      }
      toast({ title: 'Sucesso', description: `${files.length} arquivo(s) enviado(s).` })
      await loadCompany()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload do arquivo.', variant: 'destructive' })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
          <h1 className="text-2xl sm:text-2xl font-bold tracking-tight drop-shadow-sm text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Documentos da Empresa
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie as informações cadastrais e documentos corporativos.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full pb-12">
        <Card className="bg-card/60 border-border/50 shadow-sm hardware-accelerated backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>Atualize os dados de identificação da empresa.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Nome da Empresa</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => setFormData((p) => ({ ...p, empresa: e.target.value }))}
                  required
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, cnpj: formatCNPJ(e.target.value) }))
                    }
                    placeholder="00.000.000/0000-00"
                    className={cn(
                      'bg-background/50 border-border/50',
                      cnpjError && 'border-destructive',
                    )}
                  />
                  {cnpjError && <p className="text-xs text-destructive">{cnpjError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf_socio">CPF do Sócio Administrador</Label>
                  <Input
                    id="cpf_socio"
                    value={formData.cpf_socio}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, cpf_socio: formatCPF(e.target.value) }))
                    }
                    placeholder="000.000.000-00"
                    className={cn(
                      'bg-background/50 border-border/50',
                      cpfError && 'border-destructive',
                    )}
                  />
                  {cpfError && <p className="text-xs text-destructive">{cpfError}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData((p) => ({ ...p, responsavel: e.target.value }))}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">Cofre de Senhas</h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />6 campos disponíveis
                  </span>
                </div>
                <div className="space-y-3">
                  {credentials.map((cred, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`cred-id-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Identificação {index + 1}
                        </Label>
                        <Input
                          id={`cred-id-${index}`}
                          value={cred.identificacao}
                          onChange={(e) =>
                            handleCredentialChange(index, 'identificacao', e.target.value)
                          }
                          placeholder="Ex: Receita Federal"
                          className="bg-background/50 border-border/50 h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`cred-senha-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Senha {index + 1}
                        </Label>
                        <div className="relative">
                          <Input
                            id={`cred-senha-${index}`}
                            type={visiblePasswords[index] ? 'text' : 'password'}
                            value={cred.senha}
                            onChange={(e) => handleCredentialChange(index, 'senha', e.target.value)}
                            placeholder="••••••••"
                            className="bg-background/50 border-border/50 h-9 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility(index)}
                            tabIndex={-1}
                          >
                            {visiblePasswords[index] ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/60 border-border/50 shadow-sm hardware-accelerated backdrop-blur-sm">
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
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground mb-4" />
                )}
                <p className="text-sm font-medium">
                  {uploading ? 'Enviando arquivo(s)...' : 'Clique para selecionar arquivos'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG e demais formatos
                </p>
                {uploading && (
                  <div className="w-full max-w-xs mt-4">
                    <div className="flex justify-between text-xs mb-1 font-medium text-muted-foreground">
                      <span>Progresso</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/50 shadow-sm hardware-accelerated backdrop-blur-sm flex-1">
            <CardHeader>
              <CardTitle>Documentos Salvos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead className="hidden sm:table-cell">Data de Envio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(company?.documentos || []).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px] sm:max-w-xs">{doc.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(doc.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="Download / Visualizar">
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
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!company?.documentos || company.documentos.length === 0) && (
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
      </div>
    </div>
  )
}
