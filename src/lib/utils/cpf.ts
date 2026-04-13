export function isValidCPF(cpf: string) {
  const cleanCPF = cpf.replace(/[^\d]+/g, '')
  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false
  let sum = 0,
    rest
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cleanCPF.substring(9, 10))) return false
  sum = 0
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cleanCPF.substring(10, 11))) return false
  return true
}

export function formatCPF(cpf: string) {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}
