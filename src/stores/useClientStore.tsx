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
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'documents' | 'history'>) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  addDocument: (
    clientId: string,
    file: File | any,
    onProgress?: (p: number) => void,
  ) => Promise<boolean>
  deleteDocument: (clientId: string, docId: string, path?: string) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

const ClientContext = createContext<ClientStoreState | null>(null)

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([])
  const { user, role } = useAuthStore()
  const hasFetched = useRef(false)

  const fetchClients = useCallback(async () => {
    if (!user || role !== 'Admin') return
    const { data, error } = await supabase
      .from('clientes_externos' as any)
      .select('*')
      .order('data_criacao', { ascending: false })

    if (error) return

    if (data) {
      setClients(
        data.map((d: any) => ({
          id: d.id,
          name: d.nome,
          company: d.empresa || '',
          email: d.email,
          phone: d.telefone || '',
          cnpj: d.cnpj || '',
          documents: d.documentos || [],
          history: [],
          createdAt: d.data_criacao,
        })),
      )
    }
  }, [user, role])

  useEffect(() => {
    if (user && role === 'Admin' && !hasFetched.current) {
      hasFetched.current = true
      fetchClients()
    }
  }, [user, role, fetchClients])

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

  const value = useMemo(
    () => ({ clients, addClient, updateClient, addDocument, deleteDocument, deleteClient }),
    [clients, addClient, updateClient, addDocument, deleteDocument, deleteClient],
  )

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
}

export default function useClientStore() {
  const context = useContext(ClientContext)
  if (!context) throw new Error('useClientStore must be used within a ClientProvider')
  return context
}
