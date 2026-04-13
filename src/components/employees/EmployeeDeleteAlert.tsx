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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useEmployeeStore, Employee } from '@/stores/useEmployeeStore'

export default function EmployeeDeleteAlert({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  employee?: Employee | null
}) {
  const { toast } = useToast()
  const { fetchEmployees } = useEmployeeStore()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!employee) return
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Usuário não autenticado')

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employees/${employee.id}`
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro ao demitir colaborador')
      }

      toast({ title: 'Demitido', description: 'Colaborador marcado como demitido (soft delete).' })
      fetchEmployees()
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Demissão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja demitir o colaborador{' '}
            <strong>{employee?.personal_data?.nome}</strong>? Esta ação marcará o status como
            "Demitido" e manterá o histórico no sistema (Soft Delete).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Demitindo...' : 'Sim, demitir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
