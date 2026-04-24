import { Demand } from '@/types/demand'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

async function fetchAllRecords(table: string) {
  let allData: any[] = []
  let from = 0
  const limit = 1000
  while (true) {
    const { data } = await supabase
      .from(table)
      .select('*')
      .range(from, from + limit - 1)
    if (!data || data.length === 0) break
    allData = allData.concat(data)
    if (data.length < limit) break
    from += limit
  }
  return allData
}

export async function exportFullDatabaseJSON() {
  const tables = [
    'leads',
    'historico_leads',
    'clientes_externos',
    'leads_parceiros',
    'demandas',
    'agenda_eventos',
    'employees',
    'candidates',
    'departments',
    'usuarios',
    'notificacoes',
    'configuracoes',
  ]
  const data: Record<string, any> = {}

  for (const table of tables) {
    data[table] = await fetchAllRecords(table)
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `backup_completo_${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportAllTablesCSV() {
  const tables = [
    'leads',
    'historico_leads',
    'clientes_externos',
    'leads_parceiros',
    'demandas',
    'agenda_eventos',
    'employees',
    'candidates',
    'usuarios',
  ]

  for (const table of tables) {
    const tableData = await fetchAllRecords(table)
    if (tableData && tableData.length > 0) {
      const headers = Object.keys(tableData[0])
      const escapeCSV = (str: any) => {
        if (str === null || str === undefined) return '""'
        if (typeof str === 'object') return `"${JSON.stringify(str).replace(/"/g, '""')}"`
        return `"${String(str).replace(/"/g, '""').replace(/\n/g, ' ')}"`
      }

      const rows = tableData.map((row) => headers.map((h) => escapeCSV(row[h])))
      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n')
      const bom = '\uFEFF'
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${table}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Small delay to help browsers not block multiple downloads
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
}

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
    collaboratorIds: string[]
    metrics: { demands: boolean; leads: boolean }
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

  if (config.collaboratorIds.length > 0) {
    filteredDemands = filteredDemands.filter((d) =>
      config.collaboratorIds.includes(d.responsavel_id),
    )
  }

  let filteredLeads = data.leads.filter((l) => {
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

  const colabNames =
    config.collaboratorIds.length === 0
      ? 'toda a equipe'
      : data.users
          .filter((u: any) => config.collaboratorIds.includes(u.id))
          .map((u: any) => u.nome)
          .join(', ')

  const startDateFormatted = config.startDate
    ? format(new Date(config.startDate + 'T12:00:00'), 'dd/MM/yyyy')
    : 'Início'
  const endDateFormatted = config.endDate
    ? format(new Date(config.endDate + 'T12:00:00'), 'dd/MM/yyyy')
    : 'Hoje'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Desempenho Operacional</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
            @bottom-right {
              content: "Página " counter(page) " de " counter(pages);
            }
          }
          * { box-sizing: border-box; }
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #000; 
            background: #fff; 
            line-height: 1.5; 
            margin: 0 auto;
            max-width: 210mm;
          }
          @media print {
            body { 
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page-break { page-break-before: always; }
            .metric-card, table, tr, .analysis-section { page-break-inside: avoid; }
          }
          .header { 
            display: flex; 
            align-items: center; 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
          }
          .logo { height: 45px; margin-right: 20px; }
          .title-container { flex: 1; }
          .title { font-size: 22px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #333; margin-top: 5px; }
          .section { margin-bottom: 35px; }
          h2 { 
            font-size: 16px; 
            color: #000; 
            border-bottom: 1px solid #ccc; 
            padding-bottom: 6px; 
            margin-bottom: 15px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
          }
          .grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-bottom: 25px; 
          }
          .metric-card { 
            border: 1px solid #000; 
            padding: 15px; 
            border-radius: 4px; 
            background: #fff; 
            text-align: center; 
          }
          .metric-label { 
            font-size: 11px; 
            color: #000; 
            text-transform: uppercase; 
            font-weight: bold; 
            margin-bottom: 8px; 
          }
          .metric-value { 
            font-size: 26px; 
            font-weight: bold; 
            color: #000; 
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
            font-size: 12px; 
            border: 1px solid #000; 
          }
          th, td { 
            border: 1px solid #000; 
            padding: 10px; 
            text-align: left; 
          }
          th { 
            background-color: #f0f0f0; 
            font-weight: bold; 
            color: #000; 
            text-transform: uppercase; 
          }
          
          .analysis-section { 
            background: #fff; 
            border: 2px solid #000; 
            padding: 25px; 
            border-radius: 6px; 
            margin-top: 40px; 
          }
          .analysis-section h2 { border-bottom: 2px solid #000; }
          .analysis-section p { 
            font-size: 14px; 
            color: #000; 
            text-align: justify; 
            margin-bottom: 15px; 
            line-height: 1.6;
          }
          
          .footer { 
            margin-top: 50px; 
            font-size: 10px; 
            color: #000; 
            text-align: center; 
            border-top: 1px solid #000; 
            padding-top: 15px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://img.usecurling.com/i?q=company+logo&shape=outline&color=solid-black" class="logo" alt="Era Digital" />
          <div class="title-container">
            <h1 class="title">Relatório de Desempenho Operacional</h1>
            <div class="subtitle">
              <strong>Período:</strong> ${startDateFormatted} a ${endDateFormatted} <br/>
              <strong>Colaboradores:</strong> ${colabNames}
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
          <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
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

        <div class="page-break"></div>

        <div class="header">
          <img src="https://img.usecurling.com/i?q=company+logo&shape=outline&color=solid-black" class="logo" alt="Era Digital" />
          <div class="title-container">
            <h1 class="title">Análise de Inteligência Operacional</h1>
          </div>
        </div>

        <div class="section analysis-section">
          <h2>Consideração Final Executiva</h2>
          <p>Analisando os dados operacionais de <strong>${colabNames}</strong> no período selecionado, observamos uma dinâmica de trabalho que reflete o comprometimento e a capacidade técnica da operação.</p>
          
          ${config.metrics.demands ? `<p>Com um volume de <strong>${demandsTotal}</strong> demandas geradas e <strong>${demandsConcluidas}</strong> concluídas, a equipe demonstra engajamento robusto com as metas estabelecidas. O tempo médio de resolução de <strong>${avgTimeHours.toFixed(1)}h</strong> indica um ritmo sólido de entrega. Recomendamos, sob uma ótica de liderança humanizada, avaliar o volume de demandas classificadas como 'Urgentes' (${demandsUrgentes}), buscando antecipar gargalos processuais para que a equipe atue com mais previsibilidade e menos sobrecarga. O foco na prevenção de urgências preserva a saúde mental e o foco analítico de cada talento.</p>` : ''}
          
          ${config.metrics.leads ? `<p>Em relação à captação comercial, os <strong>${leadsTotal}</strong> novos leads com <strong>${conversaoRate}%</strong> de conversão confirmam o potencial do nosso fluxo. Para otimizar uma produtividade sustentável, sugerimos revisitar os pontos de contato da jornada do lead, oferecendo suporte contínuo aos colaboradores para que o fechamento ocorra de forma fluida, estruturada e assertiva.</p>` : ''}
          
          <p>Reafirmamos nosso compromisso com uma gestão centrada no desenvolvimento humano. A excelência nas entregas e no atendimento é o resultado direto de um ambiente de trabalho saudável e empático, onde os processos atuam a favor da equipe e impulsionam o sucesso coletivo de forma sustentável e inovadora.</p>
        </div>

        <div class="footer">
          Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} pelo Sistema CRM Era Digital | Este documento contém informações confidenciais
        </div>
        
        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); }
        </script>
      </body>
    </html>
  `

  newWindow.document.write(html)
  newWindow.document.close()
}
