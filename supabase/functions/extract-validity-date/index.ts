import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const MONTHS: Record<string, number> = {
  jan: 1, janeiro: 1, fev: 2, fevereiro: 2, mar: 3, marco: 3, março: 3,
  abr: 4, abril: 4, mai: 5, maio: 5, jun: 6, junho: 6, jul: 7, julho: 7,
  ago: 8, agosto: 8, set: 9, setembro: 9, out: 10, outubro: 10,
  nov: 11, novembro: 11, dez: 12, dezembro: 12,
  feb: 2, apr: 4, sep: 9, oct: 10, dec: 12,
}

function pad(n: number): string { return n.toString().padStart(2, '0') }

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

function extractFromDateParts(y: number, m: number, d: number): string | null {
  if (!isValidDate(y, m, d)) return null
  const date = `${y}-${pad(m)}-${pad(d)}`
  return isFutureOrToday(date) ? date : null
}

function extractFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase()

  let m = lower.match(/(\d{4})[-_](\d{2})[-_](\d{2})/)
  if (m) { const r = extractFromDateParts(+m[1], +m[2], +m[3]); if (r) return r }

  m = lower.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
  if (m) { const r = extractFromDateParts(+m[3], +m[2], +m[1]); if (r) return r }

  m = lower.match(/(\d{2})[\/\-_](\d{4})/)
  if (m) { const r = extractFromDateParts(+m[2], +m[1], 28); if (r) return r }

  for (const [abbr, num] of Object.entries(MONTHS)) {
    const regex = new RegExp(`${abbr}[\\s\\-_]?(\\d{4})`, 'i')
    m = lower.match(regex)
    if (m) { const r = extractFromDateParts(+m[1], num, 28); if (r) return r }
  }

  return null
}

function extractFromText(text: string): string | null {
  const lower = text.toLowerCase()

  const patterns: RegExp[] = [
    /validade[:\s]+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i,
    /v[áa]lid[oa][\s]+at[ée][:\s]+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i,
    /expira[\s]+em[:\s]+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i,
    /expiration[:\s]+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i,
    /validade[:\s]+(\d{4})[-_](\d{2})[-_](\d{2})/i,
    /v[áa]lid[oa][\s]+at[ée][:\s]+(\d{4})[-_](\d{2})[-_](\d{2})/i,
  ]

  for (const p of patterns) {
    const m = lower.match(p)
    if (m) {
      if (m[1].length === 4) {
        const r = extractFromDateParts(+m[1], +m[2], +m[3]); if (r) return r
      } else {
        const r = extractFromDateParts(+m[3], +m[2], +m[1]); if (r) return r
      }
    }
  }

  const idx = lower.search(/validade|v[áa]lid|expir|valid/i)
  if (idx >= 0) {
    const win = lower.substring(idx, idx + 120)
    let m = win.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
    if (m) { const r = extractFromDateParts(+m[3], +m[2], +m[1]); if (r) return r }
    m = win.match(/(\d{4})[-_](\d{2})[-_](\d{2})/)
    if (m) { const r = extractFromDateParts(+m[1], +m[2], +m[3]); if (r) return r }
  }

  return null
}

function extractPdfText(bytes: Uint8Array): string {
  const decoder = new TextDecoder('latin1')
  const raw = decoder.decode(bytes)
  const texts: string[] = []
  const btEtRegex = /BT\s+(.*?)\s+ET/gs
  let match: RegExpExecArray | null
  while ((match = btEtRegex.exec(raw)) !== null) {
    const textRegex = /\(([^)]*)\)/g
    let tm: RegExpExecArray | null
    while ((tm = textRegex.exec(match[1])) !== null) {
      if (tm[1].trim() && /[\p{L}\d]/u.test(tm[1])) {
        texts.push(tm[1])
      }
    }
  }
  return texts.join(' ')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filename, filePath, bucket } = await req.json()

    if (!filename) {
      return new Response(JSON.stringify({ date: null, method: 'none' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const fileDate = extractFromFilename(filename)
    if (fileDate) {
      return new Response(JSON.stringify({ date: fileDate, method: 'filename' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!filePath || !bucket) {
      return new Response(JSON.stringify({ date: null, method: 'none' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: fileData, error: dlError } = await supabase.storage
      .from(bucket)
      .download(filePath)

    if (dlError || !fileData) {
      return new Response(JSON.stringify({ date: null, method: 'none', error: 'download_failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer())
    const ext = filename.split('.').pop()?.toLowerCase()

    let extractedText = ''
    if (ext === 'pdf') {
      extractedText = extractPdfText(bytes)
    }

    if (extractedText) {
      const textDate = extractFromText(extractedText)
      if (textDate) {
        return new Response(JSON.stringify({ date: textDate, method: 'ocr' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ date: null, method: 'none' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ date: null, method: 'none', error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
