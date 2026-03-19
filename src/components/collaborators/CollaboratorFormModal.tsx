import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Collaborator } from '@/pages/Collaborators'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData: Collaborator | null
}

export default function CollaboratorFormModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('colaborador')

  useEffect(() => {
    if (open) {
      if (initialData) {
        setNome(initialData.nome || '')
        setEmail(initialData.email || '')
        setTelefone(initialData.telefone || '')
        setPerfil(initialData.perfil || 'colaborador')
        setSenha('')
      } else {
        setNome('')
        setEmail('')
        setTelefone('')
        setSenha('')
        setPerfil('colaborador')
      }
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: initialData ? 'update_user' : 'create_user',
          payload: {
            id: initialData?.id,
            name: nome,
            email,
            telefone,
            perfil,
            password: senha || undefined,
          },
        },
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      toast({
        title: 'Sucesso',
        description: initialData
          ? 'Colaborador atualizado com sucesso.'
          : 'Colaborador criado com sucesso.',
      })
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Ocorreu um erro ao salvar.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
            <DialogDescription>
              {initialData
                ? 'Altere as informações do colaborador abaixo.'
                : 'Preencha os dados para registrar um novo colaborador.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!initialData}
                placeholder="joao@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">
                Senha{' '}
                {initialData && (
                  <span className="text-muted-foreground text-xs font-normal">
                    (deixe em branco para manter)
                  </span>
                )}
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required={!initialData}
                placeholder="******"
                minLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="perfil">Configurações de Acesso</Label>
              <Select value={perfil} onValueChange={setPerfil} required>
                <SelectTrigger id="perfil">
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
