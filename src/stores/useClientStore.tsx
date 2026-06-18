import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { Client, ClientDocument } from '@/types/client'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from './useAuthStore'
import { toast } from '@/hooks/use-toast'

interface ClientStoreState {
  clients: Client[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMoreClients: () => Promise<void>
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'documents' | 'history'>) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  addDocument: (
    clientId: string,
    file: File | any,
    onProgress?: (p: number) => void,
  ) => Promise<boolean>
  deleteDocument: (clientId: string, docId: string, path?: string) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  importClients: (
    clients: Omit<Client, 'id' | 'createdAt' | 'documents' | 'history'>[],
  ) => Promise<void>
}

const ClientContext = createContext<ClientStoreState | null>(null)

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)
  const { user } = useAuthStore()
  const hasFetched = useRef(false)

  const fetchClients = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const { data, error } = await supabase
      .from('clientes_externos' as any)
      .select('*')
      .order('data_criacao', { ascending: false })
      .range(0, 99)

    if (error) {
      setIsLoading(false)
      return
    }

    if (data) {
      setClients(
        data.map((d: any) => {
          let parsedServices = []
          if (Array.isArray(d.servicos)) parsedServices = d.servicos
          else if (typeof d.servicos === 'string') {
            try {
              parsedServices = JSON.parse(d.servicos)
            } catch {
              /* intentionally ignored */
            }
          }

          let parsedDocs = []
          if (Array.isArray(d.documentos)) parsedDocs = d.documentos
          else if (typeof d.documentos === 'string') {
            try {
              parsedDocs = JSON.parse(d.documentos)
            } catch {
              /* intentionally ignored */
            }
          }

          return {
            id: d.id,
            name: d.nome || 'Sem nome',
            company: d.empresa || '',
            email: d.email || '',
            phone: d.telefone || '',
            cnpj: d.cnpj || '',
            address: {
              cep: d.endereco_cep || '',
              logradouro: d.endereco_logradouro || '',
              numero: d.endereco_numero || '',
              bairro: d.endereco_bairro || '',
              cidade: d.endereco_cidade || '',
              estado: d.endereco_estado || '',
            },
            services: parsedServices,
            documents: parsedDocs,
            history: [],
            createdAt: d.data_criacao || new Date().toISOString(),
          }
        }),
      )
      setHasMore(data.length === 100)
      setPage(1)
    }
    setIsLoading(false)
  }, [user])

  const loadMoreClients = useCallback(async () => {
    if (!user || !hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    const currentPage = page
    const { data, error } = await supabase
      .from('clientes_externos' as any)
      .select('*')
      .order('data_criacao', { ascending: false })
      .range(currentPage * 100, (currentPage + 1) * 100 - 1)

    if (data) {
      const newClients = data.map((d: any) => {
        let parsedServices = []
        if (Array.isArray(d.servicos)) parsedServices = d.servicos
        else if (typeof d.servicos === 'string') {
          try {
            parsedServices = JSON.parse(d.servicos)
          } catch {
            /* intentionally ignored */
          }
        }
        let parsedDocs = []
        if (Array.isArray(d.documentos)) parsedDocs = d.documentos
        else if (typeof d.documentos === 'string') {
          try {
            parsedDocs = JSON.parse(d.documentos)
          } catch {
            /* intentionally ignored */
          }
        }
        return {
          id: d.id,
          name: d.nome || 'Sem nome',
          company: d.empresa || '',
          email: d.email || '',
          phone: d.telefone || '',
          cnpj: d.cnpj || '',
          address: {
            cep: d.endereco_cep || '',
            logradouro: d.endereco_logradouro || '',
            numero: d.endereco_numero || '',
            bairro: d.endereco_bairro || '',
            cidade: d.endereco_cidade || '',
            estado: d.endereco_estado || '',
          },
          services: parsedServices,
          documents: parsedDocs,
          history: [],
          createdAt: d.data_criacao || new Date().toISOString(),
        }
      })

      setClients((prev) => {
        const existingIds = new Set(prev.map((c) => c.id))
        return [...prev, ...newClients.filter((c: any) => !existingIds.has(c.id))]
      })
      setHasMore(data.length === 100)
      setPage(currentPage + 1)
    }
    setIsLoadingMore(false)
  }, [user, hasMore, isLoadingMore, page])

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true
      fetchClients()
    }
  }, [user, fetchClients])

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
          endereco_cep: newClient.address?.cep,
          endereco_logradouro: newClient.address?.logradouro,
          endereco_numero: newClient.address?.numero,
          endereco_bairro: newClient.address?.bairro,
          endereco_cidade: newClient.address?.cidade,
          endereco_estado: newClient.address?.estado,
          servicos: newClient.services || [],
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
            name: data.nome || 'Sem nome',
            company: data.empresa || '',
            email: data.email || '',
            phone: data.telefone || '',
            cnpj: data.cnpj || '',
            address: {
              cep: data.endereco_cep || '',
              logradouro: data.endereco_logradouro || '',
              numero: data.endereco_numero || '',
              bairro: data.endereco_bairro || '',
              cidade: data.endereco_cidade || '',
              estado: data.endereco_estado || '',
            },
            services: Array.isArray(data.servicos) ? data.servicos : [],
            documents: [],
            history: [],
            createdAt: data.data_criacao || new Date().toISOString(),
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
        ...(data.address
          ? {
              endereco_cep: data.address.cep,
              endereco_logradouro: data.address.logradouro,
              endereco_numero: data.address.numero,
              endereco_bairro: data.address.bairro,
              endereco_cidade: data.address.cidade,
              endereco_estado: data.address.estado,
            }
          : {}),
        ...(data.services ? { servicos: data.services } : {}),
      })
      .eq('id', id)

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar cliente.', variant: 'destructive' })
      return
    }

    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const addDocument = useCallback(
    async (clientId: string, file: File | any, onProgress?: (p: number) => void) => {
      if (!(file instanceof File)) {
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === clientId) {
              return {
                ...c,
                documents: [
                  ...(c.documents || []),
                  { ...file, id: Math.random().toString(), createdAt: new Date().toISOString() },
                ],
              }
            }
            return c
          }),
        )
        return true
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Formato Inválido',
          description: 'Apenas arquivos PDF, JPG e PNG são suportados.',
          variant: 'destructive',
        })
        return false
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O limite máximo é de 5MB.',
          variant: 'destructive',
        })
        return false
      }

      let progressInterval: any
      if (onProgress) {
        let p = 0
        progressInterval = setInterval(() => {
          p += Math.random() * 15
          if (p > 90) p = 90
          onProgress(Math.floor(p))
        }, 200)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${clientId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos-clientes')
        .upload(filePath, file)

      if (progressInterval) clearInterval(progressInterval)
      if (onProgress) onProgress(100)

      if (uploadError) {
        toast({
          title: 'Erro',
          description: 'Erro ao fazer upload do arquivo.',
          variant: 'destructive',
        })
        return false
      }

      const newDoc: ClientDocument = {
        id: Math.random().toString(),
        name: file.name,
        path: filePath,
        type: file.type,
        createdAt: new Date().toISOString(),
      }

      const { data: fnData, error: fnErr } = await supabase.functions.invoke(
        'manage-client-documents',
        {
          body: { action: 'add_metadata', cliente_id: clientId, document: newDoc },
        },
      )

      setClients((prev) => {
        const newClients = [...prev]
        const clientIndex = newClients.findIndex((c) => c.id === clientId)
        if (clientIndex === -1) return prev

        const currentDocs = newClients[clientIndex].documents || []
        const updatedDocs = [...currentDocs, newDoc]

        if (fnErr || !fnData?.success) {
          supabase
            .from('clientes_externos' as any)
            .update({ documentos: updatedDocs })
            .eq('id', clientId)
            .then()
        }

        newClients[clientIndex] = { ...newClients[clientIndex], documents: updatedDocs }
        return newClients
      })
      toast({ title: 'Sucesso', description: 'Documento adicionado ao cliente.' })
      return true
    },
    [],
  )

  const deleteDocument = useCallback(async (clientId: string, docId: string, path?: string) => {
    if (path) {
      await supabase.storage.from('documentos-clientes').remove([path])
      await supabase.storage.from('documentos_clientes').remove([path])
    }

    setClients((prev) => {
      const newClients = [...prev]
      const clientIndex = newClients.findIndex((c) => c.id === clientId)
      if (clientIndex === -1) return prev

      const updatedDocs = (newClients[clientIndex].documents || []).filter((d) => d.id !== docId)

      supabase
        .from('clientes_externos' as any)
        .update({ documentos: updatedDocs })
        .eq('id', clientId)
        .then()

      newClients[clientIndex] = { ...newClients[clientIndex], documents: updatedDocs }
      return newClients
    })
    toast({ title: 'Sucesso', description: 'Documento excluído.' })
  }, [])

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

  const importClients = useCallback(
    async (newClients: Omit<Client, 'id' | 'createdAt' | 'documents' | 'history'>[]) => {
      const { data, error } = await supabase
        .from('clientes_externos' as any)
        .insert(
          newClients.map((c) => ({
            nome: c.name,
            empresa: c.company,
            email: c.email,
            telefone: c.phone,
            cnpj: c.cnpj,
            endereco_cep: c.address?.cep,
            endereco_logradouro: c.address?.logradouro,
            endereco_numero: c.address?.numero,
            endereco_bairro: c.address?.bairro,
            endereco_cidade: c.address?.cidade,
            endereco_estado: c.address?.estado,
            servicos: c.services || [],
          })),
        )
        .select()

      if (error) {
        toast({ title: 'Erro', description: 'Erro ao importar clientes.', variant: 'destructive' })
        return
      }

      if (data) {
        const imported = data.map((d: any) => ({
          id: d.id,
          name: d.nome || 'Sem nome',
          company: d.empresa || '',
          email: d.email || '',
          phone: d.telefone || '',
          cnpj: d.cnpj || '',
          address: {
            cep: d.endereco_cep || '',
            logradouro: d.endereco_logradouro || '',
            numero: d.endereco_numero || '',
            bairro: d.endereco_bairro || '',
            cidade: d.endereco_cidade || '',
            estado: d.endereco_estado || '',
          },
          services: Array.isArray(d.servicos) ? d.servicos : [],
          documents: Array.isArray(d.documentos) ? d.documentos : [],
          history: [],
          createdAt: d.data_criacao || new Date().toISOString(),
        }))
        setClients((prev) => [...imported, ...prev])
        toast({ title: 'Sucesso', description: `${data.length} clientes importados com sucesso.` })
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      clients,
      isLoading,
      isLoadingMore,
      hasMore,
      loadMoreClients,
      addClient,
      updateClient,
      addDocument,
      deleteDocument,
      deleteClient,
      importClients,
    }),
    [
      clients,
      isLoading,
      isLoadingMore,
      hasMore,
      loadMoreClients,
      addClient,
      updateClient,
      addDocument,
      deleteDocument,
      deleteClient,
      importClients,
    ],
  )

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export default function useClientStore() {
  const context = useContext(ClientContext)
  if (!context) throw new Error('useClientStore must be used within a ClientProvider')
  return context
}
