import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'
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

  const fetchedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let subscription: any = null

    try {
      const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (!isMounted) return
        setSession(currentSession ?? null)
        setUser(currentSession?.user ?? null)
        if (event === 'SIGNED_OUT') {
          setRole(null)
          setUserName('')
          setClientId(null)
          fetchedUserIdRef.current = null
          setLoading(false)
        }
      })
      subscription = data?.subscription

      supabase.auth
        .getSession()
        .then(({ data: { session: currentSession }, error }) => {
          if (!isMounted) return
          if (error || !currentSession) {
            setSession(null)
            setUser(null)
            setAuthInitialized(true)
            setLoading(false)
          } else {
            setSession(currentSession ?? null)
            setUser(currentSession?.user ?? null)
            setAuthInitialized(true)
          }
        })
        .catch(() => {
          if (!isMounted) return
          setSession(null)
          setUser(null)
          setAuthInitialized(true)
          setLoading(false)
        })
    } catch (err) {
      if (isMounted) {
        setAuthInitialized(true)
        setLoading(false)
      }
    }

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      if (!user?.id) {
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
          .maybeSingle()

        if (error) throw error

        if (isMounted && data) {
          setRole((prev) =>
            prev === 'Client' ? 'Client' : data?.perfil === 'admin' ? 'Admin' : 'Colaborador',
          )
          setUserName((prev) => (prev ? prev : (data?.nome ?? user?.email ?? '')))
          fetchedUserIdRef.current = user.id
        }
      } catch (err) {
        // Silently handle
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (authInitialized) {
      if (user?.id && role !== 'Client') {
        // Prevent loading flash and unmounts on Alt+Tab/Focus
        if (fetchedUserIdRef.current !== user.id) {
          setLoading(true)
          fetchProfile()
        } else {
          if (isMounted) setLoading(false)
        }
      } else if (!user?.id && role !== 'Client') {
        fetchedUserIdRef.current = null
        if (isMounted) setLoading(false)
      }
    }

    return () => {
      isMounted = false
    }
  }, [user?.id, authInitialized, role])

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
    try {
      const currentUserEmail = user?.email
      await supabase.auth.signOut()
      if (currentUserEmail) {
        await supabase.functions.invoke('custom-auth', {
          body: { action: 'logout', payload: { email: currentUserEmail } },
        })
      }
    } catch (e) {
      // Ignore errors on logout
    }
    setRole(null)
    setClientId(null)
    setUserName('')
    fetchedUserIdRef.current = null
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
  return conte