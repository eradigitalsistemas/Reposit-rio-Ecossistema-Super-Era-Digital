import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { Client, ClientDocument } from '@/types/client'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from './useAuthStore'
import { toast } from '@/hooks/use-toast'

interface ClientStoreState {
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'documents' | 'history'>) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  addDocument: (clientId: string, doc: Omit<ClientDocument, 'id' | 'createdAt'>) => void
  deleteClient: (id: string) => Promise<void>
}

const ClientContext = createContext<ClientStoreState | null>(null)

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const { user, role } = useAuthStore()

  const fetchClients = useCallback(async () => {
    if (!user || role !== 'Admin') return
    const { data, error } = await supabase
      .from('clientes_externos' as any) // Cast due to dynamic migration not in static types
      .select('*')
      .order('data_criacao', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return
    }

    if (data) {
      setClients(
        data.map((d: any) => ({
          id: d.id,
          name: d.nome,
          company: d.empresa || '',
          email: d.email,
          phone: d.telefone || '',
          cnpj: d.cnpj || '',
          documents: [],
          history: [],
          createdAt: d.data_criacao,
        })),
      )
    }
  }, [user, role])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const addClient = useCallback(
    async (newClient: Omit<Client, 'id' | 'createdAt' | 'documents' | 'history'>) => {
      const { data, error } = await supabase
        .from('clientes_externos' as any)
        .insert({
          nome: newClient.name,
          empresa: newClient.company,
          email: newClient.email,
          telefone: newClient.phone,
          cnpj: newClient.cnpj,
        })
        .select()
        .single()

      if (error) {
        toast({ title: 'Erro', description: 'Erro ao cadastrar cliente.', variant: 'destructive' })
        return
      }

      if (data) {
        setClients((prev) => [
          {
            id: data.id,
            name: data.nome,
            company: data.empresa || '',
            email: data.email,
            phone: data.telefone || '',
            cnpj: data.cnpj || '',
            documents: [],
            history: [],
            createdAt: data.data_criacao,
          },
          ...prev,
        ])
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso.' })
      }
    },
    [],
  )

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    const { error } = await supabase
      .from('clientes_externos' as any)
      .update({
        nome: data.name,
        empresa: data.company,
        email: data.email,
        telefone: data.phone,
        cnpj: data.cnpj,
      })
      .eq('id', id)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar cliente.', variant: 'destructive' })
      return
    }

    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const addDocument = useCallback(
    (clientId: string, doc: Omit<ClientDocument, 'id' | 'createdAt'>) => {
      // Mocking document addition since no table was specified for it in AC
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === clientId) {
            return {
              ...c,
              documents: [
                ...c.documents,
                { ...doc, id: Math.random().toString(), createdAt: new Date().toISOString() },
              ],
            }
          }
          return c
        }),
      )
    },
    [],
  )

  const deleteClient = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('clientes_externos' as any)
      .delete()
      .eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir cliente.', variant: 'destructive' })
      return
    }
    setClients((prev) => prev.filter((c) => c.id !== id))
    toast({ title: 'Sucesso', description: 'Cliente excluído.' })
  }, [])

  const value = useMemo(
    () => ({ clients, addClient, updateClient, addDocument, deleteClient }),
    [clients, addClient, updateClient, addDocument, deleteClient],
  )

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export default function useClientStore() {
  const context = useContext(ClientContext)
  if (!context) throw new Error('useClientStore must be used within a ClientProvider')
  return context
}
