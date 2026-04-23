import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, AlertCircle, FileSpreadsheet } from 'lucide-react'
import useClientStore from '@/stores/useClientStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ImportClientModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { importClients } = useClientStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.type !== 'text/csv' && !selected.name.endsWith('.csv')) {
        setError('Por favor, selecione um arquivo CSV válido.')
        setFile(null)
      } else {
        setError(null)
        setFile(selected)
      }
    }
  }

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
    if (lines.length < 2) throw new Error('O arquivo CSV está vazio ou sem dados suficientes.')

    // Detect delimiter (comma or semicolon)
    const firstLine = lines[0]
    const delimiter =
      (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ';' : ','

    const parseLine = (line: string) => {
      const result = []
      let cell = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"' && line[i + 1] === '"') {
          cell += '"'
          i++ // skip next quote
        } else if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          result.push(cell.trim())
          cell = ''
        } else {
          cell += char
        }
      }
      result.push(cell.trim())
      return result
    }

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase())

    const nameIdx = headers.findIndex((h) => h.includes('nome') || h.includes('name'))
    const emailIdx = headers.findIndex((h) => h.includes('email'))
    const companyIdx = headers.findIndex((h) => h.includes('empresa') || h.includes('company'))
    const phoneIdx = headers.findIndex(
      (h) => h.includes('telefone') || h.includes('phone') || h.includes('celular'),
    )
    const cnpjIdx = headers.findIndex((h) => h.includes('cnpj') || h.includes('documento'))

    if (nameIdx === -1 || emailIdx === -1) {
      throw new Error('O arquivo deve conter as colunas "nome" e "email".')
    }

    const clientsToImport = []
    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i])

      const name = row[nameIdx]
      const email = row[emailIdx]

      if (name && email) {
        clientsToImport.push({
          name,
          email,
          company: companyIdx !== -1 ? row[companyIdx] : '',
          phone: phoneIdx !== -1 ? row[phoneIdx] : '',
          cnpj: cnpjIdx !== -1 ? row[cnpjIdx] : '',
        })
      }
    }

    return clientsToImport
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const clients = parseCSV(text)

      if (clients.length === 0) {
        throw new Error('Nenhum dado válido encontrado para importar.')
      }

      await importClients(clients)
      setOpen(false)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o arquivo CSV.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setFile(null)
      setError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar Clientes</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV para importar clientes em lote. O arquivo deve conter as
            colunas obrigatórias <strong>nome</strong> e <strong>email</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Clique para selecionar um arquivo CSV'}
            </p>
            {!file && (
              <p className="text-xs text-muted-foreground mt-1">
                Apenas arquivos .csv são suportados
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? 'Importando...' : 'Importar Clientes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
