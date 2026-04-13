import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export type Employee = {
  id: string
  cpf: string
  rg: string | null
  personal_data: {
    nome: string
    email: string
    telefone?: string
    data_nascimento?: string
    endereco?: string
  } | null
  professional_data: {
    cargo?: string
    [key: string]: any
  } | null
  salary: number | null
  department_id: string | null
  departments?: { id: string; name: string } | null
  status: string
  hire_date: string
  experience_end_date: string | null
  created_at: string
}

interface EmployeeStore {
  employees: Employee[]
  total: number
  loading: boolean
  page: number
  limit: number
  fetchEmployees: (filters?: any) => Promise<void>
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  total: 0,
  loading: false,
  page: 1,
  limit: 20,
  fetchEmployees: async (filters = {}) => {
    set({ loading: true })
    try {
      let query = supabase.from('employees').select('*, departments(id, name)', { count: 'exact' })

      if (filters.status && filters.status !== 'Todos') {
        query = query.eq('status', filters.status)
      }
      if (filters.department_id && filters.department_id !== 'Todos') {
        query = query.eq('department_id', filters.department_id)
      }

      if (filters.search) {
        const s = `%${filters.search}%`
        query = query.or(
          `cpf.ilike.${s},personal_data->>nome.ilike.${s},personal_data->>email.ilike.${s}`,
        )
      }

      const page = filters.page || 1
      const limit = get().limit
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

      const { data, count, error } = await query
      if (error) throw error

      set({ employees: data as any, total: count || 0, page })
    } catch (err) {
      console.error('Erro ao buscar colaboradores:', err)
    } finally {
      set({ loading: false })
    }
  },
}))
