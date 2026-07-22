import { KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CredentialEntry } from '@/services/company-documents'

interface CredentialVaultProps {
  credentials: CredentialEntry[]
  onCredentialChange: (index: number, field: 'identificacao' | 'senha', value: string) => void
  visiblePasswords: Record<number, boolean>
  onTogglePassword: (index: number) => void
}

export function CredentialVault({
  credentials,
  onCredentialChange,
  visiblePasswords,
  onTogglePassword,
}: CredentialVaultProps) {
  return (
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
              <Label htmlFor={`cred-id-${index}`} className="text-xs text-muted-foreground">
                Identificação {index + 1}
              </Label>
              <Input
                id={`cred-id-${index}`}
                value={cred.identificacao}
                onChange={(e) => onCredentialChange(index, 'identificacao', e.target.value)}
                placeholder="Ex: Receita Federal"
                className="bg-background/50 border-border/50 h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`cred-senha-${index}`} className="text-xs text-muted-foreground">
                Senha {index + 1}
              </Label>
              <div className="relative">
                <Input
                  id={`cred-senha-${index}`}
                  type={visiblePasswords[index] ? 'text' : 'password'}
                  value={cred.senha}
                  onChange={(e) => onCredentialChange(index, 'senha', e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50 h-9 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                  onClick={() => onTogglePassword(index)}
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
  )
}
