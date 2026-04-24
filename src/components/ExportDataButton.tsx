import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export function ExportDataButton() {
  const [exporting, setExporting] = useState(false)

  const exportToCsv = async () => {
    setExporting(true)
    try {
      const tables = [
        'leads',
        'clientes',
        'demandas',
        'candidatos',
        'colaboradores',
        'users',
        'whatsapp_contacts',
      ]

      let csvContent = ''

      for (const table of tables) {
        const { data } = await supabase.from(table).select('*')
        csvContent += `--- TABELA: ${table.toUpperCase()} ---\n`
        if (data && data.length > 0) {
          csvContent += Object.keys(data[0]).join(',') + '\n'
          data.forEach((row: any) => {
            csvContent +=
              Object.values(row)
                .map((val) => {
                  if (val === null || val === undefined) return '""'
                  const str = String(val).replace(/"/g, '""')
                  return `"${str}"`
                })
                .join(',') + '\n'
          })
        } else {
          csvContent += 'Nenhum registro encontrado.\n'
        }
        csvContent += '\n\n'
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `export_crm_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({ title: 'Exportação Concluída', description: 'O arquivo CSV foi gerado com sucesso.' })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro na Exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      onClick={exportToCsv}
      disabled={exporting}
      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
    >
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Exportar Dados (CSV)
    </Button>
  )
}
