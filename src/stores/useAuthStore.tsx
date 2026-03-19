import React, { createContext, useContext, useState, useMemo } from 'react'

export type Role = 'Admin' | 'Colaborador'

interface AuthStoreState {
  role: Role
  userName: string
  setRole: (role: Role) => void
  toggleRole: () => void
}

const AuthContext = createContext<AuthStoreState | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>('Admin')
  const [userName, setUserName] = useState('Admin User')

  const toggleRole = () => {
    if (role === 'Admin') {
      setRole('Colaborador')
      setUserName('Carlos Santos')
    } else {
      setRole('Admin')
      setUserName('Admin User')
    }
  }

  const value = useMemo(() => ({ role, userName, setRole, toggleRole }), [role, userName])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
