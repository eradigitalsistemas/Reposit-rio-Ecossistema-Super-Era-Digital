import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const CoreAuthContext = createContext<AuthContextType | undefined>(undefined)

export const useCoreAuth = () => {
  const context = useContext(CoreAuthContext)
  if (!context) throw new Error('useCoreAuth must be used within a CoreAuthProvider')
  return context
}

export const CoreAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let subscription: any = null

    try {
      const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (!isMounted) return
        setSession(currentSession ?? null)
        setUser(currentSession?.user ?? null)
        setLoading(false)
      })
      subscription = data?.subscription

      supabase.auth
        .getSession()
        .then(({ data: { session: currentSession }, error }) => {
          if (!isMounted) return
          if (error) {
            setSession(null)
            setUser(null)
          } else {
            setSession(currentSession ?? null)
            setUser(currentSession?.user ?? null)
          }
          setLoading(false)
        })
        .catch(() => {
          if (!isMounted) return
          setSession(null)
          setUser(null)
          setLoading(false)
        })
    } catch (err) {
      if (isMounted) setLoading(false)
    }

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <CoreAuthContext.Provider value={{ user, session, loading }}>
      {children}
    </CoreAuthContext.Provider>
  )
}
