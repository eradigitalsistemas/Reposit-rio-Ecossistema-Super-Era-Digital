import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from '../ReportLayout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { exportToCSV } from '@/utils/export-reports'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export function ComplianceReport() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [empRes, docRes] = await Promise.all([
        supabase
          .from('employees')
          .select('id, status, experience_end_date, personal_data')
          .eq('status', 'Ativo'),
        supabase.from('documents').select('employee_id, document_type, status'),
      ])

      const emps = empRes.data || []
      const docs = docRes.data || []
      const mandatory = ['RG', 'CPF', 'Comprovante de Residência', 'Carteira de Trabalho']

      const mapped = emps
        .map((e) => {
          const myDocs = docs.filter((d) => d.employee_id === e.id)
          const existingTypes = myDocs.map((d) => d.document_type)
          const missing = mandatory.filter((m) => !existingTypes.includes(m))
          const hasExpired = myDocs.some((d) => d.status === 'Vencido')

          let docStatus = 'OK'
          if (missing.length > 0 || hasExpired) docStatus = 'CRÍTICO'

          let expStatus = 'OK'
          if (e.experience_end_date) {
            const days =
              (new Date(e.experience_end_date).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
            if (days >= 0 && days <= 7) expStatus = 'ATENÇÃO'
            else if (days < 0 && e.status === 'Em Experiência') expStatus = 'CRÍTICO'
          }

          return {
            id: e.id,
            nome: e.personal_data?.nome || 'Desconhecido',
            docStatus,
            expStatus,
            detalhesDoc:
              missing.length > 0
                ? `Falta: ${missing.length} doc(s)`
                : hasExpired
                  ? 'Doc Vencido'
                  : 'Completo',
          }
        })
        .sort((a, b) => a.nome.localeCompare(b.nome))

      setData(mapped)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleExport = () => {
    exportToCSV(data, 'conformidade.csv', [
      { header: 'Colaborador', key: 'nome' },
      { header: 'Documentação', key: 'docStatus' },
      { header: 'Detalhes Doc', key: 'detalhesDoc' },
      { header: 'Período Experiência', key: 'expStatus' },
    ])
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'OK') return <CheckCircle2 className="w-5 h-5 text-green-500" />
    if (status === 'ATENÇÃO') return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <ReportLayout
      title="Relatório de Conformidade"
      description="Auditoria de documentação e contratos."
      loading={loading}
      onExport={handleExport}
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead className="text-center">Documentação</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead className="text-center">Período Experiência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum dado
                </TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.nome}</TableCell>
                <TableCell className="text-center flex justify-center">
                  <StatusIcon status={row.docStatus} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.detalhesDoc}</TableCell>
                <TableCell className="text-center flex justify-center">
                  <StatusIcon status={row.expStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    />
  )
}
