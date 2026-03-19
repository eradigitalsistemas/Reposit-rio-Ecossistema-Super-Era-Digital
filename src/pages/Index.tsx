import { KanbanBoard } from '@/components/KanbanBoard'

const Index = () => {
  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] w-full bg-[#F8FAFC] dark:bg-background flex flex-col overflow-hidden">
      <KanbanBoard />
    </div>
  )
}

export default Index
