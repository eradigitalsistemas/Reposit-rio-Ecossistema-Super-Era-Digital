import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Shield, Calendar, UserIcon, Activity } from 'lucide-react'
import type { Collaborator } from '@/pages/Collaborators'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: Collaborator | null
}

export default function CollaboratorViewModal({ open, onOpenChange, user }: Props) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Colaborador</DialogTitle>
          <DialogDescription>Informações completas de acesso e contato.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center text-gray-700 dark:text-white">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold leading-none mb-2 text-gray-900 dark:text-white">
                {user.nome}
              </h3>
              <Badge variant={user.perfil === 'admin' ? 'default' : 'secondary'}>
                {user.perfil === 'admin' ? 'Admin' : 'Colaborador'}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 border-t border-gray-200 dark:border-white/10 pt-4">
            <div className="flex items-center gap-3 text-sm text-gray-900 dark:text-white">
              <Mail className="h-4 w-4 text-gray-500 dark:text-white/50 shrink-0" />
              <span className="font-medium truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-900 dark:text-white">
              <Phone className="h-4 w-4 text-gray-500 dark:text-white/50 shrink-0" />
              <span className="font-medium">{user.telefone || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-900 dark:text-white">
              <Shield className="h-4 w-4 text-gray-500 dark:text-white/50 shrink-0" />
              <span className="font-medium capitalize">Perfil: {user.perfil}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-900 dark:text-white">
              <Activity className="h-4 w-4 text-gray-500 dark:text-white/50 shrink-0" />
              <span className="font-medium">Status: {user.ativo ? 'Ativo' : 'Inativo'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-white/60">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-white/50 shrink-0" />
              <span className="font-medium">
                Criado em {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
