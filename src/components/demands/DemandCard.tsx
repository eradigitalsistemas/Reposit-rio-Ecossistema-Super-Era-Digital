import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  User2,
  MessageSquare,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react'
import { format } from 'date-fns'
import { DemandDetailsModal } from './DemandDetailsModal'
import { EditDemandModal } from './EditDemandModal'
import { useState } from 'react'
import useDemandStore from '@/stores/useDemandStore'
import useAuthStore from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
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

interface DemandCardProps {
  demand: Demand
}

export function DemandCard({ demand }: DemandCardProps) {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { acceptDemand, deleteDemand } = useDemandStore()

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgente':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'Durante o Dia':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open modal if not clicking an action button inside the card
    const target = e.target as HTMLElement
    if (!target.closest('button') && !target.closest('[role="dialog"]')) {
      setOpen(true)
    }
  }

  const handleDelete = () => {
    deleteDemand(demand.id)
  }

  return (
    <>
      <DemandDetailsModal open={open} onOpenChange={setOpen} demand={demand} />
      <EditDemandModal open={editOpen} onOpenChange={setEditOpen} demand={demand} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Demanda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta demanda? Esta ação é permanente e não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        onClick={handleCardClick}
        className="cursor-pointer hover:border-primary/50 transition-all duration-200 group border-border shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] overflow-hidden"
      >
        <CardContent className="p-4 sm:p-4 flex flex-col gap-3 relative">
          {demand.systemEscalated && (
            <div className="absolute top-0 right-0 -mr-6 mt-4 w-24 text-center rotate-45 text-[9px] font-bold tracking-widest text-white bg-red-600 shadow-md">
              ESCALADO
            </div>
          )}

          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold sm:font-medium text-base sm:text-sm leading-tight text-foreground group-hover:text-primary transition-colors pr-16">
              {demand.title}
            </h4>

            <div className="absolute right-2 top-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md p-0.5 border border-border/50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditOpen(true)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteOpen(true)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            <Badge
              variant="outline"
              className={`text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 h-auto font-medium ${getPriorityColor(
                demand.priority,
              )}`}
            >
              {demand.priority === 'Urgente' && (
                <AlertCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1" />
              )}
              {demand.priority === 'Durante o Dia' && (
                <Clock className="w-3.5 h-3.5 sm:w-3 sm:h-3 mr-1" />
              )}
              {demand.priority}
            </Badge>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between text-sm sm:text-xs text-muted-foreground w-full">
              <div className="flex items-center truncate max-w-[65%]">
                <User2 className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
                <span className="truncate">{demand.assignee}</span>
              </div>
              {demand.responses && demand.responses.length > 0 && (
                <div className="flex items-center shrink-0 ml-2">
                  <MessageSquare className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                  <span>{demand.responses.length}</span>
                </div>
              )}
            </div>

            {demand.dueDate && (
              <div className="flex items-center text-sm sm:text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
                <span>Vence em {format(new Date(demand.dueDate), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>

          {demand.status === 'Pendente' && (
            <div className="mt-2 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                className="w-full h-10 sm:h-9 text-sm sm:text-xs bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-primary/20 transition-all shadow-none"
                onClick={(e) => {
                  e.stopPropagation()
                  acceptDemand(demand.id)
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Aceitar Demanda
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
