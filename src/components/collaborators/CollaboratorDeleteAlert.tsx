import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Collaborator } from '@/pages/Collaborators'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  user: Collaborator | null
}

export default function CollaboratorDeleteAlert({ open, onOpenChange, onSuccess, user }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'delete_user',
          payload: { id: user.id },
        },
      })

      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)

      toast({
        title: 'Removido',
        description: 'O colaborador foi removido com sucesso.',
      })
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Ocorreu um erro ao remover.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o acesso deste colaborador ({user.nome})? Esta ação não
            poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Removendo...' : 'Sim, remover acesso'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
