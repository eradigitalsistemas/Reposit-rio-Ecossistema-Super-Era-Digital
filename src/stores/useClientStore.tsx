import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { Client, ClientDocument } from '@/types/client'

interface ClientStoreState {
  clients: Client[]
  updateClient: (id: string, data: Partial<Client>) => void
  addDocument: (clientId: string, doc: Omit<ClientDocument, 'id' | 'createdAt'>) => void
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Roberto Almeida',
    company: 'Tech Solutions',
    email: 'roberto@techsolutions.com',
    phone: '(11) 98765-4321',
    cnpj: '12.345.678/0001-90',
    documents: [
      {
        id: 'd1',
        name: 'contrato_prestacao_servicos.pdf',
        url: '#',
        type: 'application/pdf',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
    history: [
      {
        id: 'h1',
        stage: 'Prospecção',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        description: 'Cliente entrou em contato via site.',
      },
      {
        id: 'h2',
        stage: 'Negociação',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        description: 'Proposta enviada e em análise.',
      },
      {
        id: 'h3',
        stage: 'Fechamento',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        description: 'Contrato assinado.',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Fernanda Lima',
    company: 'Agência Criativa',
    email: 'fernanda@criativa.com',
    phone: '(21) 97654-3210',
    cnpj: '98.765.432/0001-10',
    documents: [],
    history: [
      {
        id: 'h1',
        stage: 'Lead',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: 'Indicação de parceiro.',
      },
    ],
    createdAt: new Date().toISOString(),
  },
]

const ClientContext = createContext<ClientStoreState | null>(null)

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(mockClients)

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const addDocument = useCallback(
    (clientId: string, doc: Omit<ClientDocument, 'id' | 'createdAt'>) => {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === clientId) {
            return {
              ...c,
              documents: [
                ...c.documents,
                {
                  ...doc,
                  id: Math.random().toString(36).substr(2, 9),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          }
          return c
        }),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({ clients, updateClient, addDocument }),
    [clients, updateClient, addDocument],
  )

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export default function useClientStore() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientStore must be used within a ClientProvider')
  }
  return context
}
