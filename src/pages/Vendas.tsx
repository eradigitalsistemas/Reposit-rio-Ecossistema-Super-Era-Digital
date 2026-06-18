import { KanbanBoard } from '@/components/KanbanBoard'
import useLeadStore from '@/stores/useLeadStore'
import { Button } from '@/components/ui/button'

const Vendas = () => {
  const { hasMore, isLoadingMore, loadMoreLeads } = useLeadStore()

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] w-full bg-background flex flex-col overflow-hidden relative">
      <KanbanBoard />

      {hasMore && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            variant="default"
            onClick={loadMoreLeads}
            disabled={isLoadingMore}
            className="shadow-lg shadow-black/20"
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais leads'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Vendas
