/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes a filename to remove accents, replace spaces, and strip special characters.
 * Useful for safely uploading files to storage without invalid key errors.
 * @param filename - Original filename
 * @returns Sanitized filename safe for storage
 */
/**
 * Formats time in milliseconds to a hierarchical string: Months > Days > Hours > Minutes > Seconds
 * Example: 1mo 5d 10h 30m 15s
 */
export function formatHierarchicalTime(ms: number): string {
  if (isNaN(ms) || ms <= 0) return '0s'

  const totalSeconds = Math.floor(ms / 1000)
  const months = Math.floor(totalSeconds / (30 * 24 * 3600))
  let rem = totalSeconds % (30 * 24 * 3600)

  const days = Math.floor(rem / (24 * 3600))
  rem %= 24 * 3600

  const hours = Math.floor(rem / 3600)
  rem %= 3600

  const minutes = Math.floor(rem / 60)
  const seconds = rem % 60

  const parts = []
  if (months > 0) parts.push(`${months}mo`)
  if (days > 0 || parts.length > 0) parts.push(`${days}d`)
  if (hours > 0 || parts.length > 0) parts.push(`${hours}h`)
  if (minutes > 0 || parts.length > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return parts.join(' ')
}

export function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD') // Decompose combined characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // Remove other special characters
}
