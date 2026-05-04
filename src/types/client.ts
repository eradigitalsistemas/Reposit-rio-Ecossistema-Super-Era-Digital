export interface ClientDocument {
  id: string
  name: string
  url?: string
  path?: string
  type: string
  createdAt: string
}

export interface DemandHistoryEvent {
  id: string
  stage: string
  date: string
  description: string
}

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  cnpj: string
  address?: {
    cep?: string
    logradouro?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
  }
  services?: string[]
  documents: ClientDocument[]
  history: DemandHistoryEvent[]
  createdAt: string
}
