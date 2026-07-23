import { useState } from 'react'
import { KeyRound, Eye, EyeOff, ShieldCheck, Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CredentialEntry } from '@/services/company-documents'

interface CredentialVaultProps {
  credentials: CredentialEntry[]
  onCredentialsChange: (credentials: CredentialEntry[]) => void
}

const MAX_CREDENTIALS = 6

export function CredentialVault({ credentials, onCredentialsChange }: CredentialVaultProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [nomeOrgao, setNomeOrgao] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({})

  const handleAdd = () => {
    setNomeOrgao('')
    setSenha('')
    setShowPassword(false)
    setEditingIndex(null)
    setIsAdding(true)
  }

  const handleEdit = (index: number) => {
    setNomeOrgao(credentials[index].nome_orgao)
    setSenha(credentials[index].senha)
    setShowPassword(false)
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setNomeOrgao('')
    setSenha('')
    setShowPassword(false)
  }

  const handleSave = () => {
    if (!nomeOrgao.trim() || !senha.trim()) return
    if (editingIndex !== null) {
      const updated = [...credentials]
      updated[editingIndex] = { nome_orgao: nomeOrgao.trim(), senha: senha.trim() }
      onCredentialsChange(updated)
    } else {
      if (credentials.length >= MAX_CREDENTIALS) return
      onCredentialsChange([...credentials, { nome_orgao: nomeOrgao.trim(), senha: senha.trim() }])
    }
    handleCancel()
  }

  const handleDelete = (index: number) => {
    onCredentialsChange(credentials.filter((_, i) => i !== index))
  }

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const atMaxCapacity = credentials.length >= MAX_CREDENTIALS

  return (
    <div className="pt-4 border-t border-border/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Cofre de Senhas</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {credentials.length}/{MAX_CREDENTIALS} senhas
          </span>
        </div>
        {!isAdding && !atMaxCapacity && (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> Nova Senha
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 p-3 rounded-lg border border-border/50 bg-background/30 animate-fade-in">
          <div className="space-y-1.5">
            <Label htmlFor="cred-nome-orgao" className="text-xs text-muted-foreground">
              Nome do Órgão
            </Label>
            <Input
              id="cred-nome-orgao"
              value={nomeOrgao}
              onChange={(e) => setNomeOrgao(e.target.value)}
              placeholder="Ex: Receita Federal"
              className="bg-background/50 border-border/50 h-9"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cred-senha-input" className="text-xs text-muted-foreground">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="cred-senha-input"
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50 border-border/50 h-9 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              disabled={!nomeOrgao.trim() || !senha.trim()}
            >
              <Save className="w-4 h-4" /> Salvar
            </Button>
          </div>
        </div>
      )}

      {credentials.length > 0 && (
        <div className="space-y-2">
          {credentials.map((cred, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center p-2.5 rounded-md border border-border/40 bg-background/20"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Nome do Órgão</p>
                <p className="text-sm font-medium truncate">{cred.nome_orgao}</p>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Senha</p>
                  <p className="text-sm font-mono truncate">
                    {visiblePasswords[index] ? cred.senha : '••••••••'}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility(index)}
                    tabIndex={-1}
                  >
                    {visiblePasswords[index] ? (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-transparent"
                    onClick={() => handleEdit(index)}
                    tabIndex={-1}
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-transparent"
                    onClick={() => handleDelete(index)}
                    tabIndex={-1}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {credentials.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Nenhuma senha cadastrada. Clique em "Nova Senha" para adicionar.
        </p>
      )}

      {atMaxCapacity && !isAdding && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Limite máximo de {MAX_CREDENTIALS} senhas atingido.
        </p>
      )}
    </div>
  )
}
