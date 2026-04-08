import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { Lead, LeadStage, InterestStatus } from '@/types/crm'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from './useAuthStore'

interface LeadStoreState {
  leads: Lead[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead | undefined>
  updateLead: (id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>) => Promise<void>
  moveLead: (id: string, newStage: LeadStage) => Promise<void>
  deleteLead: (id: string) => Promise<void>
}

const LeadContext = createContext<LeadStoreState | null>(null)

export const LeadProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { user, role } = useAuthStore()
  const hasFetched = useRef(false)

  const fetchLeads = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('data_criacao', { ascending: false })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os leads.',
        variant: 'destructive',
      })
      return
    }

    if (data) {
      setLeads(
        data.map((d: any) => ({
          id: d.id,
          name: d.nome,
          company: d.empresa || '',
          email: d.email,
          phone: d.telefone || '',
          address: d.endereco || '',
          notes: d.observacoes || '',
          stage: d.estagio as LeadStage,
          interestStatus: (d.status_interesse as InterestStatus) || 'Interessado',
          createdAt: d.data_criacao,
        })),
      )
    }
  }, [user])

  useEffect(() => {
    if (role && role !== 'Client' && !hasFetched.current && user) {
      hasFetched.current = true
      fetchLeads()
    }
  }, [role, user, fetchLeads])

  const addLead = useCallback(
    async (newLead: Omit<Lead, 'id' | 'createdAt'>) => {
      if (!user) return undefined

      const { data, error } = await supabase
        .from('leads')
        .insert({
          nome: newLead.name,
          empresa: newLead.company,
          email: newLead.email,
          telefone: newLead.phone,
          endereco: newLead.address,
          observacoes: newLead.notes,
          estagio: newLead.stage,
          status_interesse: newLead.interestStatus,
          usuario_id: user.id,
        } as any)
        .select()
        .single()

      if (error) {
        toast({ title: 'Erro', description: 'Erro ao criar lead.', variant: 'destructive' })
        return undefined
      }

      if (data) {
        const d = data as any
        const createdLead: Lead = {
          id: d.id,
          name: d.nome,
          company: d.empresa || '',
          email: d.email,
          phone: d.telefone || '',
          address: d.endereco || '',
          notes: d.observacoes || '',
          stage: d.estagio as LeadStage,
          interestStatus: (d.status_interesse as InterestStatus) || 'Interessado',
          createdAt: d.data_criacao,
        }
        setLeads((prev) => [createdLead, ...prev])
        toast({ title: 'Lead Criado', description: 'O lead foi adicionado com sucesso.' })
        return createdLead
      }
      return undefined
    },
    [user],
  )
  const updateLead = useCallback(
    async (id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>) => {
      const dbUpdates: any = {}
      if (updates.name !== undefined) dbUpdates.nome = updates.name
      if (updates.company !== undefined) dbUpdates.empresa = updates.company
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.phone !== undefined) dbUpdates.telefone = updates.phone
      if (updates.notes !== undefined) dbUpdates.observacoes = updates.notes
      if (updates.address !== undefined) dbUpdates.endereco = updates.address
      if (updates.stage !== undefined) dbUpdates.estagio = updates.stage
      if (updates.interestStatus !== undefined) dbUpdates.status_interesse = updates.interestStatus

      const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id)
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar lead.', variant: 'destructive' })
        return
      }

      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)))
      toast({ title: 'Lead Atualizado', description: 'O lead foi atualizado com sucesso.' })
    },
    [],
  )

  const moveLead = useCallback(
    async (id: string, newStage: LeadStage) => {
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, stage: newStage } : lead)))

      const { error } = await supabase.from('leads').update({ estagio: newStage }).eq('id', id)
      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar estágio do lead.',
          variant: 'destructive',
        })
        fetchLeads()
      }
    },
    [fetchLeads],
  )

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir lead.', variant: 'destructive' })
      return
    }

    setLeads((prev) => prev.filter((lead) => lead.id !== id))
    toast({ title: 'Lead Excluído', description: 'O lead foi removido.' })
  }, [])

  const value = useMemo(
    () => ({
      leads,
      searchQuery,
      setSearchQuery,
      addLead,
      updateLead,
      moveLead,
      deleteLead,
    }),
    [leads, searchQuery, addLead, updateLead, moveLead, deleteLead],
  )

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (!context) throw new Error('useLeadStore must be used within a LeadProvider')
  return context
}
