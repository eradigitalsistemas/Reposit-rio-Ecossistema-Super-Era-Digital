import { Demand } from '@/types/demand'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

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

export function exportDetailedPDF(
  data: { demands: any[]; leads: any[]; users: any[] },
  config: {
    startDate: string
    endDate: string
    collaboratorId: string
    metrics: { demands: boolean; leads: boolean; checklists: boolean }
  },
) {
  const newWindow = window.open('', '_blank')
  if (!newWindow) return

  const parseLocal = (dateStr: string, isEnd: boolean) => {
    if (!dateStr) return isEnd ? new Date(8640000000000000) : new Date(0)
    const [year, month, day] = dateStr.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return isEnd ? endOfDay(d) : startOfDay(d)
  }

  const startDate = parseLocal(config.startDate, false)
  let endDate = parseLocal(config.endDate, true)
  if (startDate > endDate) {
    endDate = startDate
  }

  let filteredDemands = data.demands.filter((d) => {
    if (!d.data_criacao) return false
    const date = new Date(d.data_criacao)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })

  if (config.collaboratorId !== 'all') {
    filteredDemands = filteredDemands.filter((d) => d.responsavel_id === config.collaboratorId)
  }

  const filteredLeads = data.leads.filter((l) => {
    if (!l.data_criacao) return false
    const date = new Date(l.data_criacao)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })

  // Demands Metrics
  const demandsTotal = filteredDemands.length
  const demandsConcluidas = filteredDemands.filter((d) => d.status === 'Concluído').length
  const demandsUrgentes = filteredDemands.filter((d) => d.prioridade === 'Urgente').length

  let totalTimeMs = 0
  let concludedWithTime = 0
  filteredDemands.forEach((d) => {
    if (d.status === 'Concluído' && d.data_resposta && d.data_criacao) {
      const diff = new Date(d.data_resposta).getTime() - new Date(d.data_criacao).getTime()
      if (diff > 0) {
        totalTimeMs += diff
        concludedWithTime++
      }
    }
  })
  const avgTimeHours =
    concludedWithTime > 0 ? totalTimeMs / concludedWithTime / (1000 * 60 * 60) : 0

  // Leads Metrics
  const leadsTotal = filteredLeads.length
  const leadsConvertidos = filteredLeads.filter((l) =>
    ['convertido', 'treinamento', 'finalizado', 'pos_venda', 'ativo'].includes(l.estagio),
  ).length
  const conversaoRate = leadsTotal > 0 ? ((leadsConvertidos / leadsTotal) * 100).toFixed(1) : '0.0'

  // Checklists Metrics
  let totalChecklistItems = 0
  let completedChecklistItems = 0
  filteredDemands.forEach((d) => {
    if (d.checklist && Array.isArray(d.checklist)) {
      d.checklist.forEach((item: any) => {
        totalChecklistItems++
        if (item.checked) completedChecklistItems++
      })
    }
  })
  const checklistRate =
    totalChecklistItems > 0
      ? ((completedChecklistItems / totalChecklistItems) * 100).toFixed(1)
      : '0.0'

  const html = `
    <html>
      <head>
        <title>Relatório de Desempenho Operacional</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #000; background: #fff; line-height: 1.5; }
          .header { display: flex; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { height: 50px; margin-right: 20px; }
          .title-container { flex: 1; }
          .title { font-size: 24px; font-weight: bold; margin: 0; color: #111827; }
          .subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }
          .section { margin-bottom: 40px; }
          h2 { font-size: 18px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
          .metric-card { border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; background: #f9fafb; text-align: center; }
          .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
          .metric-value { font-size: 28px; font-weight: bold; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 600; color: #374151; }
          .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            .metric-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://img.usecurling.com/i?q=company+logo&shape=outline&color=solid-black" class="logo" alt="Era Digital" />
          <div class="title-container">
            <h1 class="title">Relatório de Desempenho Operacional</h1>
            <div class="subtitle">
              Período: ${
                config.startDate
                  ? format(new Date(config.startDate + 'T12:00:00'), 'dd/MM/yyyy')
                  : 'Início'
              } até ${
                config.endDate
                  ? format(new Date(config.endDate + 'T12:00:00'), 'dd/MM/yyyy')
                  : 'Hoje'
              } | 
              Colaborador: ${
                config.collaboratorId === 'all'
                  ? 'Todos'
                  : data.users.find((u: any) => u.id === config.collaboratorId)?.nome ||
                    'Desconhecido'
              }
            </div>
          </div>
        </div>

        ${
          config.metrics.demands
            ? `
        <div class="section">
          <h2>Métricas de Demandas</h2>
          <div class="grid">
            <div class="metric-card">
              <div class="metric-label">Volume Total</div>
              <div class="metric-value">${demandsTotal}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Concluídas</div>
              <div class="metric-value">${demandsConcluidas}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Urgentes</div>
              <div class="metric-value">${demandsUrgentes}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Tempo Médio</div>
              <div class="metric-value">${avgTimeHours.toFixed(1)}h</div>
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          config.metrics.leads
            ? `
        <div class="section">
          <h2>Métricas de Leads</h2>
          <div class="grid">
            <div class="metric-card">
              <div class="metric-label">Novos Leads</div>
              <div class="metric-value">${leadsTotal}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Convertidos</div>
              <div class="metric-value">${leadsConvertidos}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Taxa de Conversão</div>
              <div class="metric-value">${conversaoRate}%</div>
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          config.metrics.checklists
            ? `
        <div class="section">
          <h2>Desempenho de Tarefas (Checklists)</h2>
          <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="metric-card">
              <div class="metric-label">Total de Tarefas</div>
              <div class="metric-value">${totalChecklistItems}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Tarefas Concluídas</div>
              <div class="metric-value">${completedChecklistItems}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Taxa de Conclusão</div>
              <div class="metric-value">${checklistRate}%</div>
            </div>
          </div>
        </div>
        `
            : ''
        }

        <div class="footer">
          Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} pelo Sistema CRM Era Digital
        </div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
        </script>
      </body>
    </html>
  `

  newWindow.document.write(html)
  newWindow.document.close()
}
