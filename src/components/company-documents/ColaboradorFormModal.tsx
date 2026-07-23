import { useState, useEffect } from 'react'
import { Loader2, Upload, X, FileText, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatCPF, isValidCPF } from '@/lib/utils/cpf'
import { useToast } from '@/hooks/use-toast'
import {
  createColaborador,
  updateColaborador,
  uploadColaboradorDocument,
  type ColaboradorEmpresa,
  type ColaboradorDocumento,
} from '@/services/colaboradores-empresa'

interface ColaboradorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaDocId: string
  colaborador: ColaboradorEmpresa | null
  onSuccess: () => void
}

export function ColaboradorFormModal({
  open,
  onOpenChange,
  empresaDocId,
  colaborador,
  onSuccess,
}: ColaboradorFormModalProps) {
  const { toast } = useToast()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [pessoais, setPessoais] = useState<File[]>([])
  const [admissionais, setAdmissionais] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)

  useEffect(() => {
    if (open) {
      setNome(colaborador?.nome || '')
      setCpf(colaborador?.cpf || '')
      setCpfError('')
      setPessoais([])
      setAdmissionais([])
    }
  }, [open, colaborador])

  const handleFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
  ) => {
    const files = e.target.files
    if (!files) return
    setFiles((prev) => [...prev, ...Array.from(files)])
    e.target.value = ''
  }

  const removeFile = (index: number, setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidCPF(cpf)) {
      setCpfError('CPF inválido')
      return
    }
    setCpfError('')
    setSaving(true)
    try {
      let colabId: string
      if (colaborador) {
        await updateColaborador(colaborador.id, { nome, cpf })
        colabId = colaborador.id
      } else {
        const created = await createColaborador({ nome, cpf, empresa_doc_id: empresaDocId })
        colabId = created.id
      }

      const allFiles = [
        ...pessoais.map((f) => ({ f, tipo: 'pessoal' as const })),
        ...admissionais.map((f) => ({ f, tipo: 'admissional' as const })),
      ]
      for (const { f, tipo } of allFiles) {
        setUploadingCount((c) => c + 1)
        try {
          await uploadColaboradorDocument(empresaDocId, colabId, f, tipo)
        } finally {
          setUploadingCount((c) => c - 1)
        }
      }

      toast({
        title: 'Sucesso',
        description: `Colaborador ${colaborador ? 'atualizado' : 'criado'} com sucesso.`,
      })
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao salvar colaborador.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const FileList = ({
    files,
    setFiles,
    label,
  }: {
    files: File[]
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
    label: string
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => document.getElementById(`file-${label}`)?.click()}
      >
        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Clique para adicionar arquivos</p>
        <input
          id={`file-${label}`}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e, setFiles)}
        />
      </div>
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded p-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate flex-1">{f.name}</span>
              <button type="button" onClick={() => removeFile(i, setFiles)}>
                <X className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {colaborador ? 'Editar Colaborador' : 'Adicionar Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {colaborador
              ? 'Edite os dados do colaborador.'
              : 'Cadastre um novo colaborador vinculado à empresa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="colab-nome">Nome do Colaborador *</Label>
            <Input
              id="colab-nome"
              value={nome}
              required
              onChange={(e) => setNome(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="colab-cpf">CPF *</Label>
            <Input
              id="colab-cpf"
              value={cpf}
              required
              maxLength={14}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              className={cn('bg-background/50 border-border/50', cpfError && 'border-destructive')}
            />
            {cpfError && <p className="text-xs text-destructive">{cpfError}</p>}
          </div>
          {!colaborador && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileList files={pessoais} setFiles={setPessoais} label="Documentos Pessoais" />
              <FileList
                files={admissionais}
                setFiles={setAdmissionais}
                label="Documentos Admissionais"
              />
            </div>
          )}
          {colaborador && (
            <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
              Para adicionar documentos, edite o colaborador e use a seção de documentos abaixo na
              listagem.
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {(saving || uploadingCount > 0) && <Loader2 className="w-4 h-4 animate-spin" />}
              {colaborador ? 'Salvar Alterações' : 'Adicionar Colaborador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type { ColaboradorDocumento }
