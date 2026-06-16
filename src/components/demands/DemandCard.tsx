import { Demand } from '@/types/demand'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'react-router-dom'
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
  Briefcase,
  RotateCcw,
} from 'lucide-react'
import { format, isValid } from 'date-fns'
import { DemandDetailsModal } from './DemandDetailsModal'
import { EditDemandModal } from './EditDemandModal'
import { CompleteDemandModal } from './CompleteDemandModal'
import { DemandTimer } from './DemandTimer'
import React, { useState, useEffect, memo } from 'react'
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

export const DemandCard = memo(
  function DemandCard({ demand }: DemandCardProps) {
    const [open, setOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [completeOpen, setCompleteOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()

    const { acceptDemand, deleteDemand, reopenDemand } = useDemandStore()

    useEffect(() => {
      if (demand.protocolo && searchParams.get('protocolo') === demand.protocolo) {
        setOpen(true)
        searchParams.delete('protocolo')
        setSearchParams(searchParams, { replace: true })
      }
    }, [searchParams, demand.protocolo, setSearchParams])

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

    const formatPhaseName = (phase: string) => {
      switch (phase) {
        case 'treinamento':
          return 'Treinamento'
        case 'pos_venda_5d':
          return 'Pós-Venda 5d'
        case 'pos_venda_20d':
          return 'Pós-Venda 20d'
        case 'pos_venda_35d':
          return 'Pós-Venda 35d'
        case 'finalizado':
          return 'Ativo (Finalizado)'
        default:
          return phase
      }
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
          id={`demand-card-${demand.id}`}
          onClick={handleCardClick}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', demand.id)
            e.dataTransfer.effectAllowed = 'move'
            setTimeout(() => {
              const el = document.getElementById(`demand-card-${demand.id}`)
              if (el) el.style.opacity = '0.5'
            }, 0)
          }}
          onDragEnd={(e) => {
            const el = document.getElementById(`demand-card-${demand.id}`)
            if (el) el.style.opacity = '1'
          }}
          className="cursor-grab active:cursor-grabbing transition-opacity duration-200 group bg-white dark:bg-card border-gray-300 dark:border-border shadow-md dark:shadow-sm hover:shadow-lg dark:hover:shadow-md hover:border-primary/50 dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] overflow-hidden hardware-accelerated"
        >
          <CardContent className="p-4 flex flex-col gap-3 relative">
            {demand.systemEscalated && (
              <div className="absolute top-0 right-0 -mr-6 mt-4 w-24 text-center rotate-45 text-[9px] font-bold tracking-widest text-primary-foreground bg-primary shadow-md z-10">
                ESCALADO
              </div>
            )}

            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col gap-1 pr-16">
                {demand.protocolo && (
                  <span className="text-[10px] font-mono text-muted-foreground font-semibold tracking-wider">
                    {demand.protocolo}
                  </span>
                )}
                <h4 className="font-semibold sm:font-medium text-base sm:text-sm leading-tight text-gray-900 dark:text-card-foreground group-hover:text-primary transition-colors">
                  {demand.title}
                </h4>
              </div>

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
              <DemandTimer demand={demand} />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              {demand.clientName && (
                <div className="flex items-center text-sm sm:text-xs text-muted-foreground w-full mb-0.5">
                  <Briefcase className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
                  <span className="truncate">{demand.clientName}</span>
                </div>
              )}

              {demand.workflowTipo === 'implantacao_pos_venda' && demand.posVendaFase && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 mb-1 w-fit font-bold border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  {demand.posVendaAlvo ? 'Retreinamento' : formatPhaseName(demand.posVendaFase)}
                  {demand.posVendaAlvo && ` 🎯 ${formatPhaseName(demand.posVendaAlvo)}`}
                  {demand.dataProximaAcao &&
                    demand.posVendaFase !== 'finalizado' &&
                    ` - Próx: ${format(new Date(demand.dataProximaAcao), 'dd/MM')}`}
                </Badge>
              )}

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

              {demand.dueDate && isValid(new Date(demand.dueDate)) && (
                <div className="flex items-center text-sm sm:text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4 sm:w-3 sm:h-3 mr-1.5 sm:mr-1 shrink-0" />
                  <span>Vence em {format(new Date(demand.dueDate), 'dd/MM/yyyy')}</span>
                </div>
              )}
            </div>

            {(demand.status === 'Pendente' ||
              demand.status === 'Em Andamento' ||
              demand.status === 'Concluído') && (
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
                {demand.status === 'Concluído' && (
                  <Button
                    variant="outline"
                    className="flex-1 h-10 sm:h-9 text-sm sm:text-xs font-bold transition-all hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-500 border-orange-200 dark:border-orange-800/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      reopenDemand(demand.id)
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reabrir
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )
  },
  (prev, next) => {
    return (
      prev.demand.updatedAt === next.demand.updatedAt &&
      prev.demand.status === next.demand.status &&
      prev.demand.id === next.demand.id
    )
  },
)
