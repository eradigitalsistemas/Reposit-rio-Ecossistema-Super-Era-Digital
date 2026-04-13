import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

interface TimeTrackingState {
  employeeId: string | null
  loading: boolean
  entries: any[]
  totals: any
  todayEntry: any
  error: string | null
  fetchEmployeeId: (email: string) => Promise<string | null>
  fetchToday: () => Promise<void>
  fetchMonthly: (month: string, year: string) => Promise<void>
  registerAction: (
    action: 'entry' | 'break' | 'exit',
    breakDuration?: string,
  ) => Promise<{ success: boolean; error?: string }>
}

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  employeeId: null,
  loading: false,
  entries: [],
  totals: { hours_worked: 0, overtime: 0, delay: 0, days_worked: 0 },
  todayEntry: null,
  error: null,

  fetchEmployeeId: async (email) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('personal_data->>email', email)
        .maybeSingle()

      if (error) throw error
      if (!data)
        throw new Error('Seu usuário não está vinculado a um colaborador ativo. Contate o RH.')

      set({ employeeId: data.id, loading: false })
      return data.id
    } catch (err: any) {
      set({ error: err.message, loading: false })
      return null
    }
  },

  fetchToday: async () => {
    const { employeeId } = get()
    if (!employeeId) return

    const now = new Date()
    const utcMinus3 = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const today = utcMinus3.toISOString().split('T')[0]

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/time-entries/${employeeId}/${today}`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      )
      const json = await res.json()
      set({ todayEntry: json.data || null })
    } catch (err) {
      console.error(err)
    }
  },

  fetchMonthly: async (month, year) => {
    const { employeeId } = get()
    if (!employeeId) return
    set({ loading: true })
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/time-entries/${employeeId}/${month}/${year}`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      )
      const json = await res.json()
      set({ entries: json.data || [], totals: json.totals || {}, loading: false })
    } catch (err) {
      console.error(err)
      set({ loading: false })
    }
  },

  registerAction: async (action, breakDuration) => {
    const { employeeId } = get()
    if (!employeeId) return { success: false, error: 'Colaborador não identificado' }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const payload: any = { employee_id: employeeId, action }
      if (breakDuration) payload.break_duration = breakDuration

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/time-entries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao registrar ponto')

      await get().fetchToday()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },
}))
