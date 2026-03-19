import { Demand } from '@/types/demand'
import { format } from 'date-fns'

export function exportToCSV(demands: Demand[], filename: string = 'relatorio.csv') {
  const headers = ['Título', 'Descrição', 'Prioridade', 'Status', 'Prazo', 'Responsável']

  const escapeCSV = (str: string) => `"${str.replace(/"/g, '""').replace(/\n/g, ' ')}"`

  const rows = demands.map((d) => [
    escapeCSV(d.title),
    escapeCSV(d.description),
    escapeCSV(d.priority),
    escapeCSV(d.status),
    escapeCSV(format(new Date(d.dueDate), 'dd/MM/yyyy')),
    escapeCSV(d.assignee),
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const bom = '\uFEFF' // Allows Excel to read UTF-8 properly
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF(demands: Demand[]) {
  const newWindow = window.open('', '_blank')
  if (!newWindow) return

  const html = `
    <html>
      <head>
        <title>Relatório de Demandas</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
          th { background-color: #f4f4f5; font-weight: bold; }
          h1 { font-size: 22px; margin-bottom: 5px; color: #000; }
          p { color: #666; font-size: 14px; margin-top: 0; }
          .priority-Urgente { color: #dc2626; font-weight: bold; }
          .priority-Durante { color: #ca8a04; font-weight: bold; }
          .priority-Pode { color: #16a34a; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Relatório de Demandas</h1>
        <p>Data de exportação: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        <p>Total de demandas: ${demands.length}</p>
        <table>
          <thead>
            <tr>
              <th>Título / Descrição</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Prazo</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            ${demands
              .map(
                (d) => `
              <tr>
                <td>
                  <strong>${d.title}</strong><br/>
                  <span style="color:#666;font-size:11px">${d.description.substring(0, 150)}${d.description.length > 150 ? '...' : ''}</span>
                </td>
                <td class="priority-${d.priority.split(' ')[0]}">${d.priority}</td>
                <td>${d.status}</td>
                <td>${format(new Date(d.dueDate), 'dd/MM/yyyy')}</td>
                <td>${d.assignee}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        <script>
          window.onload = () => { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `

  newWindow.document.write(html)
  newWindow.document.close()
}
