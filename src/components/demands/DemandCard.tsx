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
  CheckCircle,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { DemandDetailsModal } from './DemandDetailsModal'
import { EditDemandModal } from './EditDemandModal'
import { CompleteDemandModal } from './CompleteDemandModal'
import { useState } from 'react'
import useDemandStore from '@/stores/useDemandStore'
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
  const [completeOpen, setCompleteOpen] = useState(false)

  const { acceptDemand, deleteDemand } = useDemandStore()

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgente':
        return 'bg-red-600 text-white border-red-600 font-bold dark:shadow-[0_0_10px_rgba(220,38,38,0.4)] shadow-sm'
      case 'Durante o Dia':
        return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
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
      <DemandDetailsModal
        open={open}
        onOpenChange={setOpen}
        demand={demand}
        onCompleteClick={() => {
          setOpen(false)
          setCompleteOpen(true)
        }}
      />
      <EditDemandModal open={editOpen} onOpenChange={setEditOpen} demand={demand} />
      <CompleteDemandModal open={completeOpen} onOpenChange={setCompleteOpen} demand={demand} />

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
        className="cursor-pointer transition-all duration-200 group bg-white dark:bg-card border-gray-300 dark:border-border shadow-md dark:shadow-sm hover:shadow-lg dark:hover:shadow-md hover:border-primary/50 dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] overflow-hidden"
      >
        <CardContent className="p-4 flex flex-col gap-3 relative">
          {demand.systemEscalated && (
            <div className="absolute top-0 right-0 -mr-6 mt-4 w-24 text-center rotate-45 text-[9px] font-bold tracking-widest text-primary-foreground bg-primary shadow-md z-10">
              ESCALADO
            </div>
          )}

          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold sm:font-medium text-base sm:text-sm leading-tight text-gray-900 dark:text-card-foreground group-hover:text-primary transition-colors pr-16">
              {demand.title}
            </h4>

            <div className="absolute right-2 top-2 flex items-center gap-1 bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-md p-0.5 border border-gray-200 dark:border-border sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 shadow-sm">
              {demand.status !== 'Concluído' ? (
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
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(true)
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
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
              className={`text-xs sm:text-[10px] px-2 sm:px-1.5 py-0.5 h-auto font-medium border ${getPriorityColor(
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

          {(demand.status === 'Pendente' || demand.status === 'Em Andamento') && (
            <div className="mt-2 pt-3 border-t border-border flex flex-col sm:flex-row gap-2">
              {demand.status === 'Pendente' && (
                <Button
                  variant="default"
                  className="flex-1 h-10 sm:h-9 text-sm sm:text-xs font-bold transition-all shadow-none bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    acceptDemand(demand.id)
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aceitar
                </Button>
              )}
              {demand.status === 'Em Andamento' && (
                <Button
                  variant="default"
                  className="flex-1 h-10 sm:h-9 text-sm sm:text-xs font-bold transition-all shadow-none bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCompleteOpen(true)
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Concluir
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
