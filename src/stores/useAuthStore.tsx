import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export type Role = 'Admin' | 'Colaborador' | 'Client' | null

interface AuthStoreState {
  role: Role
  userName: string
  clientId: string | null
  user: User | null
  loading: boolean
  setRole: (role: Role) => void
  toggleRole: () => void
  loginAsClient: (clientId: string, name: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthStoreState | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const [role, setRole] = useState<Role>(null)
  const [userName, setUserName] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session) setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      if (!user) {
        if (role !== 'Client') {
          setRole(null)
          setUserName('')
        }
        if (isMounted) setLoading(false)
        return
      }

      // If they are mocked as a client portal user, skip fetching CRM profile
      if (role === 'Client') {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('nome, perfil')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (isMounted && data) {
          setRole(data.perfil === 'admin' ? 'Admin' : 'Colaborador')
          setUserName(data.nome || user.email || '')
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [user, role])

  const toggleRole = () => {
    // Keeping this for demo purposes, though in a real app role is strictly DB driven
    if (role === 'Admin') {
      setRole('Colaborador')
    } else if (role === 'Colaborador') {
      setRole('Admin')
    }
  }

  const loginAsClient = (id: string, name: string) => {
    setRole('Client')
    setClientId(id)
    setUserName(name)
  }

  const logout = async () => {
    if (role === 'Client') {
      setRole(null)
      setClientId(null)
      setUserName('')
      return
    }

    setLoading(true)
    await supabase.auth.signOut()
    setRole(null)
    setClientId(null)
    setUserName('')
    setLoading(false)
  }

  const value = useMemo(
    () => ({ role, userName, clientId, user, loading, setRole, toggleRole, loginAsClient, logout }),
    [role, userName, clientId, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
