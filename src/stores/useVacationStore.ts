import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

interface VacationState {
  balance: any
  requests: any[]
  loading: boolean
  error: string | null
  fetchBalance: (employeeId: string) => Promise<void>
  fetchRequests: (employeeId: string) => Promise<void>
  submitRequest: (employeeId: string, payload: any) => Promise<{ success: boolean; error?: string }>
}

export const useVacationStore = create<VacationState>((set, get) => ({
  balance: null,
  requests: [],
  loading: false,
  error: null,

  fetchBalance: async (employeeId) => {
    set({ loading: true, error: null })
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vacation-balance/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      set({ balance: json.data, loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  fetchRequests: async (employeeId) => {
    set({ loading: true })
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vacation-requests/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      set({ requests: json.data || [], loading: false })
    } catch (err: any) {
      console.error(err)
      set({ loading: false })
    }
  },

  submitRequest: async (employeeId, payload) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vacation-requests`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ employee_id: employeeId, ...payload }),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao solicitar férias')

      await get().fetchRequests(employeeId)
      await get().fetchBalance(employeeId)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },
}))
