import { create } from 'zustand'
import { getCandidates, updateCandidate, convertCandidate, Candidate } from '@/services/candidates'
import { toast } from '@/hooks/use-toast'

interface CandidateFilters {
  search: string
  status: string
  profession: string
  min_salary: string
  max_salary: string
  start_date: string
  end_date: string
}

interface CandidateState {
  candidates: Candidate[]
  total: number
  loading: boolean
  error: string | null
  page: number
  limit: number
  filters: CandidateFilters
  selectedCandidate: Candidate | null
  isDetailsOpen: boolean
  isConvertOpen: boolean
  setFilters: (filters: Partial<CandidateFilters>) => void
  setPage: (page: number) => void
  setSelectedCandidate: (candidate: Candidate | null) => void
  setDetailsOpen: (open: boolean) => void
  setConvertOpen: (open: boolean) => void
  fetchCandidates: () => Promise<void>
  updateStatus: (id: string, status: string, observations?: string) => Promise<void>
  convertToEmployee: (id: string, data: any) => Promise<void>
}

export const useCandidateStore = create<CandidateState>((set, get) => ({
  candidates: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 20,
  selectedCandidate: null,
  isDetailsOpen: false,
  isConvertOpen: false,
  filters: {
    search: '',
    status: 'all',
    profession: '',
    min_salary: '',
    max_salary: '',
    start_date: '',
    end_date: '',
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }))
    get().fetchCandidates()
  },
  setPage: (page) => {
    set({ page })
    get().fetchCandidates()
  },
  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
  setDetailsOpen: (open) => set({ isDetailsOpen: open }),
  setConvertOpen: (open) => set({ isConvertOpen: open }),
  fetchCandidates: async () => {
    const { page, limit, filters } = get()
    set({ loading: true, error: null })
    try {
      const params: any = { page, limit }
      if (filters.search && filters.search.length >= 3) params.search = filters.search
      if (filters.status && filters.status !== 'all') params.status = filters.status
      if (filters.profession) params.profession = filters.profession
      if (filters.min_salary) params.min_salary = Number(filters.min_salary)
      if (filters.max_salary) params.max_salary = Number(filters.max_salary)
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      const response = await getCandidates(params)
      set({ candidates: response.data || [], total: response.meta?.total || 0, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },
  updateStatus: async (id, status, observations) => {
    try {
      await updateCandidate(id, { status, observations })
      toast({ title: 'Candidato atualizado com sucesso' })
      get().fetchCandidates()
      const { selectedCandidate } = get()
      if (selectedCandidate && selectedCandidate.id === id) {
        set({ selectedCandidate: { ...selectedCandidate, status, observations } })
      }
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      throw error
    }
  },
  convertToEmployee: async (id, data) => {
    try {
      await convertCandidate(id, data)
      toast({ title: 'Candidato convertido com sucesso!' })
      get().fetchCandidates()
      set({ isConvertOpen: false, isDetailsOpen: false })
    } catch (error: any) {
      toast({ title: 'Erro na conversão', description: error.message, variant: 'destructive' })
      throw error
    }
  },
}))
