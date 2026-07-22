export type ExpiryStatus = 'valid' | 'near' | 'expired' | 'none'

export interface StatusConfig {
  label: string
  dotClass: string
  badgeClass: string
  textClass: string
}

export function getExpiryStatus(expiryDate?: string | null): ExpiryStatus {
  if (!expiryDate) return 'none'
  const now = new Date()
  const expiry = new Date(expiryDate)
  if (isNaN(expiry.getTime())) return 'none'
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 15) return 'near'
  return 'valid'
}

export function getStatusConfig(status: ExpiryStatus): StatusConfig {
  switch (status) {
    case 'valid':
      return {
        label: 'Válido',
        dotClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        textClass: 'text-emerald-600',
      }
    case 'near':
      return {
        label: 'Vencendo',
        dotClass: 'bg-amber-500',
        badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        textClass: 'text-amber-600',
      }
    case 'expired':
      return {
        label: 'Vencido',
        dotClass: 'bg-red-500',
        badgeClass: 'bg-red-500/10 text-red-600 border-red-500/30',
        textClass: 'text-red-600',
      }
    default:
      return {
        label: 'Sem validade',
        dotClass: 'bg-muted-foreground',
        badgeClass: 'bg-muted/10 text-muted-foreground border-border',
        textClass: 'text-muted-foreground',
      }
  }
}

export function getDaysUntilExpiry(expiryDate?: string | null): number | null {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  if (isNaN(expiry.getTime())) return null
  return Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
}
