import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export interface OnboardingTask {
  id: string
  task_id: string
  task_name: string
  completed: boolean
  completed_at: string | null
  employee_id: string
}

export interface OnboardingDoc {
  id: string
  document_type: string
  status: string
  upload_date: string
  file_path?: string
  expiration_date?: string
}

export interface ExperiencePeriod {
  end_date: string | null
  days_remaining: number | null
  alert: boolean
}

interface OnboardingState {
  tasks: OnboardingTask[]
  documents: OnboardingDoc[]
  missingDocs: string[]
  experiencePeriod: ExperiencePeriod | null
  docAlert: boolean
  loading: boolean
  error: string | null
  fetchOnboarding: (employeeId: string) => Promise<void>
  startOnboarding: (employeeId: string) => Promise<void>
  toggleTask: (employeeId: string, taskId: string, completed: boolean) => Promise<void>
  fetchDocuments: (employeeId: string) => Promise<void>
  clear: () => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  tasks: [],
  documents: [],
  missingDocs: [],
  experiencePeriod: null,
  docAlert: false,
  loading: false,
  error: null,
  clear: () =>
    set({
      tasks: [],
      documents: [],
      missingDocs: [],
      experiencePeriod: null,
      docAlert: false,
      error: null,
    }),
  fetchOnboarding: async (employeeId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.functions.invoke(`onboarding/${employeeId}`, {
        method: 'GET',
      })
      if (error) throw error
      set({ tasks: data.data || [] })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar onboarding' })
    } finally {
      set({ loading: false })
    }
  },
  startOnboarding: async (employeeId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.functions.invoke(`onboarding/${employeeId}`, {
        method: 'POST',
      })
      if (error) throw error
      if (data.data) {
        set({ tasks: data.data })
      }
    } catch (err: any) {
      set({ error: err.message || 'Erro ao iniciar onboarding' })
    } finally {
      set({ loading: false })
    }
  },
  toggleTask: async (employeeId, taskId, completed) => {
    set({ error: null })
    try {
      // Optimistic update
      const prevTasks = get().tasks
      set({
        tasks: prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
            : t,
        ),
      })

      const { data, error } = await supabase.functions.invoke(
        `onboarding/${employeeId}/tasks/${taskId}`,
        {
          method: 'PUT',
          body: { completed, completed_at: completed ? new Date().toISOString() : null },
        },
      )
      if (error) {
        // Revert on failure
        set({ tasks: prevTasks })
        throw error
      }
    } catch (err: any) {
      set({ error: err.message || 'Erro ao atualizar tarefa' })
      throw err
    }
  },
  fetchDocuments: async (employeeId) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.functions.invoke(
        `onboarding/${employeeId}/documents`,
        { method: 'GET' },
      )
      if (error) throw error
      set({
        documents: data.documents || [],
        missingDocs: data.missing_mandatory_documents || [],
        docAlert: data.document_alert || false,
        experiencePeriod: data.experience_period || null,
      })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar documentação' })
    } finally {
      set({ loading: false })
    }
  },
}))
