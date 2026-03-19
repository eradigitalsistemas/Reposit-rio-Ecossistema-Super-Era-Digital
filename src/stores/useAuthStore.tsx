import React, { createContext, useContext, useState, useMemo } from 'react'

export type Role = 'Admin' | 'Colaborador' | 'Client' | null

interface AuthStoreState {
  role: Role
  userName: string
  clientId: string | null
  setRole: (role: Role) => void
  toggleRole: () => void
  loginAsClient: (clientId: string, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthStoreState | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>('Admin')
  const [userName, setUserName] = useState('Admin User')
  const [clientId, setClientId] = useState<string | null>(null)

  const toggleRole = () => {
    if (role === 'Admin') {
      setRole('Colaborador')
      setUserName('Carlos Santos')
      setClientId(null)
    } else if (role === 'Colaborador') {
      setRole('Admin')
      setUserName('Admin User')
      setClientId(null)
    }
  }

  const loginAsClient = (id: string, name: string) => {
    setRole('Client')
    setClientId(id)
    setUserName(name)
  }

  const logout = () => {
    setRole(null)
    setClientId(null)
    setUserName('')
  }

  const value = useMemo(
    () => ({ role, userName, clientId, setRole, toggleRole, loginAsClient, logout }),
    [role, userName, clientId],
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
