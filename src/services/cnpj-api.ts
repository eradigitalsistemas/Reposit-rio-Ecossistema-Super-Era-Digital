export interface CnpjData {
  nome: string
  fantasia: string
  email: string
  telefone: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  municipio: string
  uf: string
}

export async function fetchCnpjData(
  cnpj: string,
): Promise<{ data: CnpjData | null; error: string | null }> {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return { data: null, error: 'CNPJ deve ter 14 dígitos.' }
  try {
    const res = await fetch(`https://www.receitaws.com.br/v1/cnpj/${clean}`)
    if (!res.ok) return { data: null, error: 'Erro ao consultar CNPJ.' }
    const json = await res.json()
    if (json.status === 'ERROR')
      return { data: null, error: json.message || 'CNPJ não encontrado.' }
    return {
      data: {
        nome: json.nome || '',
        fantasia: json.fantasia || '',
        email: json.email || '',
        telefone: json.telefone || '',
        cep: (json.cep || '').replace(/\D/g, ''),
        logradouro: json.logradouro || '',
        numero: json.numero || '',
        bairro: json.bairro || '',
        municipio: json.municipio || '',
        uf: json.uf || '',
      },
      error: null,
    }
  } catch {
    return {
      data: null,
      error: 'Não foi possível consultar o CNPJ. Preencha manualmente.',
    }
  }
}
