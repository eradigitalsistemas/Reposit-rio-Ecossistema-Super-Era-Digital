import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

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
  const [authInitialized, setAuthInitialized] = useState(false)

  const [role, setRole] = useState<Role>(null)
  const [userName, setUserName] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setRole(null)
        setUserName('')
        setClientId(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return
      if (error || !session) {
        setSession(null)
        setUser(null)
        setAuthInitialized(true)
        setLoading(false)
      } else {
        setSession(session)
        setUser(session.user)
        setAuthInitialized(true)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      if (!user) {
        if (isMounted && role !== 'Client' && authInitialized) {
          setLoading(false)
        }
        return
      }

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
          setRole((prev) =>
            prev === 'Client' ? 'Client' : data.perfil === 'admin' ? 'Admin' : 'Colaborador',
          )
          setUserName((prev) => (prev ? prev : data.nome || user.email || ''))
        }
      } catch (err) {
        // Silently handle
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (authInitialized) {
      if (user && role !== 'Client') {
        setLoading(true)
        fetchProfile()
      } else if (!user && role !== 'Client') {
        if (isMounted) setLoading(false)
      }
    }

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authInitialized])

  const toggleRole = () => {
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
