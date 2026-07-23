const MONTHS: Record<string, number> = {
  jan: 1,
  janeiro: 1,
  fev: 2,
  fevereiro: 2,
  mar: 3,
  marco: 3,
  março: 3,
  abr: 4,
  abril: 4,
  mai: 5,
  maio: 5,
  jun: 6,
  junho: 6,
  jul: 7,
  julho: 7,
  ago: 8,
  agosto: 8,
  set: 9,
  setembro: 9,
  out: 10,
  outubro: 10,
  nov: 11,
  novembro: 11,
  dez: 12,
  dezembro: 12,
  feb: 2,
  apr: 4,
  sep: 9,
  oct: 10,
  dec: 12,
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

function isFutureOrToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}

function tryDate(y: number, m: number, d: number): string | null {
  if (!isValidDate(y, m, d)) return null
  const date = `${y}-${pad(m)}-${pad(d)}`
  return isFutureOrToday(date) ? date : null
}

export function extractDateFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase()

  let m = lower.match(/(\d{4})[-_](\d{2})[-_](\d{2})/)
  if (m) {
    const r = tryDate(+m[1], +m[2], +m[3])
    if (r) return r
  }

  m = lower.match(/(\d{2})[/-](\d{2})[/-](\d{4})/)
  if (m) {
    const r = tryDate(+m[3], +m[2], +m[1])
    if (r) return r
  }

  m = lower.match(/(\d{2})[/\-_](\d{4})/)
  if (m) {
    const r = tryDate(+m[2], +m[1], 28)
    if (r) return r
  }

  for (const [abbr, num] of Object.entries(MONTHS)) {
    const regex = new RegExp(`${abbr}[\\s\\-_]?(\\d{4})`, 'i')
    m = lower.match(regex)
    if (m) {
      const r = tryDate(+m[1], num, 28)
      if (r) return r
    }
  }

  return null
}

export function isExpiryCategory(category: string): boolean {
  const lower = category.toLowerCase()
  return ['certid', 'alvar', 'licen', 'valid'].some((t) => lower.includes(t))
}

export function isExpiryFilename(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ['certid', 'alvar', 'licen', 'valid', 'alvara', 'certidao', 'certidoes'].some((t) =>
    lower.includes(t),
  )
}
