import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Lead, LeadStage } from '@/types/crm'
import { toast } from '@/hooks/use-toast'

interface LeadStoreState {
  leads: Lead[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  moveLead: (id: string, newStage: LeadStage) => void
  updateTrainingStep: (id: string, step: 1 | 2 | 3) => void
  deleteLead: (id: string) => void
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'João Silva',
    company: 'Tech Corp',
    email: 'joao@tech.com',
    phone: '(11) 99999-1111',
    notes: '',
    stage: 'leads',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Souza',
    company: 'Design In',
    email: 'maria@design.com',
    phone: '(11) 98888-2222',
    notes: '',
    stage: 'prospeccao',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    company: 'Agro Plus',
    email: 'carlos@agro.com',
    phone: '(11) 97777-3333',
    notes: '',
    stage: 'treinamento',
    trainingStep: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Ana Costa',
    company: 'Logistics SA',
    email: 'ana@logistics.com',
    phone: '(11) 96666-4444',
    notes: '',
    stage: 'convertido',
    createdAt: new Date().toISOString(),
  },
]

const LeadContext = createContext<LeadStoreState | null>(null)

export const LeadProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [searchQuery, setSearchQuery] = useState('')

  const addLead = useCallback((newLead: Omit<Lead, 'id' | 'createdAt'>) => {
    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...(newLead.stage === 'treinamento' ? { trainingStep: 1 } : {}),
    }
    setLeads((prev) => [lead, ...prev])
  }, [])

  const moveLead = useCallback((id: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              stage: newStage,
              trainingStep:
                newStage === 'treinamento' && !lead.trainingStep ? 1 : lead.trainingStep,
            }
          : lead,
      ),
    )
  }, [])

  const updateTrainingStep = useCallback((id: string, step: 1 | 2 | 3) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, trainingStep: step } : lead)),
    )
  }, [])

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
    toast({
      title: 'Lead Excluído',
      description: 'O lead foi removido com sucesso.',
      variant: 'destructive',
    })
  }, [])

  const value = useMemo(
    () => ({
      leads,
      searchQuery,
      setSearchQuery,
      addLead,
      moveLead,
      updateTrainingStep,
      deleteLead,
    }),
    [leads, searchQuery, addLead, moveLead, updateTrainingStep, deleteLead],
  )

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (!context) {
    throw new Error('useLeadStore must be used within a LeadProvider')
  }
  return context
}
