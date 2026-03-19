import { useMemo } from 'react'
import { KANBAN_STAGES } from '@/types/crm'
import useLeadStore from '@/stores/useLeadStore'
import { KanbanColumn } from './KanbanColumn'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function KanbanBoard() {
  const { leads = [], searchQuery = '' } = useLeadStore()

  const filteredLeads = useMemo(() => {
    const safeQuery = searchQuery || ''
    if (!safeQuery.trim()) return leads
    const lowerQuery = safeQuery.toLowerCase()
    return leads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(lowerQuery) ||
        lead.company?.toLowerCase().includes(lowerQuery) ||
        lead.email?.toLowerCase().includes(lowerQuery),
    )
  }, [leads, searchQuery])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full bg-background">
      <div className="flex gap-4 p-6 min-w-max h-full pb-10 snap-x snap-mandatory overflow-x-auto">
        {(KANBAN_STAGES || []).map((stage) => {
          const stageLeads = filteredLeads.filter((lead) => lead.stage === stage.id)
          return <KanbanColumn key={stage.id} stage={stage} leads={stageLeads} />
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-2.5" />
    </ScrollArea>
  )
}
