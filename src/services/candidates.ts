import { supabase } from '@/lib/supabase/client'

export interface Candidate {
  id: string
  name: string
  email: string
  status: string
  profession?: string
  observations?: string
  resume_data?: any
  disc_result?: any
  created_at: string
}

export const getCandidates = async (params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  profession?: string
  start_date?: string
  end_date?: string
  min_salary?: number
  max_salary?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}) => {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.limit) query.append('limit', params.limit.toString())
  if (params.search) query.append('search', params.search)
  if (params.status) query.append('status', params.status)
  if (params.profession) query.append('profession', params.profession)
  if (params.start_date) query.append('start_date', params.start_date)
  if (params.end_date) query.append('end_date', params.end_date)
  if (params.min_salary) query.append('min_salary', params.min_salary.toString())
  if (params.max_salary) query.append('max_salary', params.max_salary.toString())
  if (params.sort_by) query.append('sort_by', params.sort_by)
  if (params.sort_order) query.append('sort_order', params.sort_order)

  const { data, error } = await supabase.functions.invoke(`candidates?${query.toString()}`, {
    method: 'GET',
  })

  if (error) throw error
  return data
}

export const getCandidate = async (id: string) => {
  const { data, error } = await supabase.functions.invoke(`candidates/${id}`, {
    method: 'GET',
  })

  if (error) throw error
  return data
}

export const updateCandidate = async (
  id: string,
  payload: { status?: string; observations?: string },
) => {
  const { data, error } = await supabase.functions.invoke(`candidates/${id}`, {
    method: 'PUT',
    body: payload,
  })

  if (error) throw error
  return data
}

export const convertCandidate = async (id: string, payload: any) => {
  const { data, error } = await supabase.functions.invoke(`candidates/${id}/convert`, {
    method: 'POST',
    body: payload,
  })

  if (error) throw error
  return data
}
