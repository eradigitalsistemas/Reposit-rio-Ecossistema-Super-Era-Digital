export interface ParsedCsvRow {
  nome: string
  cpf: string
  email: string
  especialidades: string
  ativo: string
}

function detectDelimiter(line: string): string {
  const semicolons = (line.match(/;/g) || []).length
  const commas = (line.match(/,/g) || []).length
  return semicolons > commas ? ';' : ','
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export function parseColaboradoresCSV(text: string): ParsedCsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []
  const delimiter = detectDelimiter(lines[0])
  const headers = parseLine(lines[0], delimiter).map((h) => h.toLowerCase().trim())
  const rows: ParsedCsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push({
      nome: row['nome'] || '',
      cpf: row['cpf'] || '',
      email: row['email'] || '',
      especialidades: row['especialidades'] || '',
      ativo: row['ativo'] || 'true',
    })
  }
  return rows
}
