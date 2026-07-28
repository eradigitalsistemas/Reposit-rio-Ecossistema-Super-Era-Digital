export type ComplianceStatus = 'valid' | 'near' | 'expired' | 'none'

export interface ComplianceStatusConfig {
  label: string
  color: string
  bgColor: string
}

export function getComplianceStatus(
  dataValidade: string | null,
  referenceDate: Date,
): ComplianceStatus {
  if (!dataValidade) return 'none'
  const expiry = new Date(dataValidade)
  if (isNaN(expiry.getTime())) return 'none'
  if (expiry < referenceDate) return 'expired'
  const diffDays = Math.ceil((expiry.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 30) return 'near'
  return 'valid'
}

export function getDaysFromExpiry(dataValidade: string | null, referenceDate: Date): number | null {
  if (!dataValidade) return null
  const expiry = new Date(dataValidade)
  if (isNaN(expiry.getTime())) return null
  return Math.ceil((expiry.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))
}

export function getComplianceStatusConfig(status: ComplianceStatus): ComplianceStatusConfig {
  switch (status) {
    case 'valid':
      return { label: 'Válido', color: '#22c55e', bgColor: '#dcfce7' }
    case 'near':
      return { label: 'A vencer', color: '#f59e0b', bgColor: '#fef3c7' }
    case 'expired':
      return { label: 'Vencido', color: '#ef4444', bgColor: '#fee2e2' }
    default:
      return { label: 'Sem data de validade', color: '#6b7280', bgColor: '#f3f4f6' }
  }
}
