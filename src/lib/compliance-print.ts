import type { ComplianceDoc } from '@/services/empresa-compliance'
import {
  getComplianceStatus,
  getDaysFromExpiry,
  getComplianceStatusConfig,
} from '@/lib/compliance-status'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const CATEGORIAS = ['Certidões', 'Documentos SST', 'Atestados', 'Constituição'] as const

export function generateCompliancePrintHTML(
  empresaNome: string,
  empresaCnpj: string,
  mes: number,
  ano: number,
  docs: ComplianceDoc[],
): string {
  const referenceDate = new Date(ano, mes, 1)
  const now = new Date()

  const sections = CATEGORIAS.map((cat) => {
    const catDocs = docs.filter((d) => d.categoria === cat)
    if (catDocs.length === 0) return ''

    const rows = catDocs
      .map((doc) => {
        const status = getComplianceStatus(doc.dataValidade, referenceDate)
        const cfg = getComplianceStatusConfig(status)
        const days = getDaysFromExpiry(doc.dataValidade, referenceDate)
        const validadeStr = doc.dataValidade
          ? new Date(doc.dataValidade).toLocaleDateString('pt-BR')
          : '—'
        const daysStr =
          days === null
            ? 'Sem data'
            : days >= 0
              ? `${days} dias restantes`
              : `Vencido há ${Math.abs(days)} dias`
        const colabStr = doc.colaboradorName ? ` (${doc.colaboradorName})` : ''

        return `<tr>
          <td style="padding:6px 8px;border:1px solid #e5e7eb">${doc.tipo}${colabStr}</td>
          <td style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">${validadeStr}</td>
          <td style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">${daysStr}</td>
          <td style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">
            <span style="background:${cfg.bgColor};color:${cfg.color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600">${cfg.label}</span>
          </td>
        </tr>`
      })
      .join('')

    return `<h3 style="margin:16px 0 8px;color:#333;font-size:14px">${cat}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:#f3f4f6">
          <th style="text-align:left;padding:6px 8px;border:1px solid #e5e7eb">Documento</th>
          <th style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">Validade</th>
          <th style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">Dias</th>
          <th style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório de Compliance - ${empresaNome}</title>
<style>
  @page { size: A4; margin: 1.5cm; }
  body { font-family: -apple-system, system-ui, sans-serif; color: #1f2937; margin: 0; }
  .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 18px; margin: 0 0 4px; }
  .header p { font-size: 12px; color: #6b7280; margin: 2px 0; }
  .footer { margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Compliance</h1>
    <p><strong>Empresa:</strong> ${empresaNome}</p>
    <p><strong>CNPJ:</strong> ${empresaCnpj || '—'}</p>
    <p><strong>Período:</strong> ${MESES[mes]} de ${ano}</p>
  </div>
  ${docs.length === 0 ? '<p style="text-align:center;padding:32px;color:#6b7280">Nenhum documento com vencimento neste período.</p>' : sections}
  <div class="footer">
    Relatório gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}
  </div>
</body>
</html>`
}

export function printComplianceReport(html: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) return
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 300)
}
