import { getExpiryStatus, getStatusConfig } from '@/lib/document-status'

interface DossierDoc {
  tipo: string
  nomeArquivo: string | null
  dataEmissao: string | null
  dataValidade: string | null
}

interface DossierSection {
  titulo: string
  docs: DossierDoc[]
}

export function exportDossier(
  entityName: string,
  entityType: 'empresa' | 'colaborador',
  sections: DossierSection[],
) {
  const win = window.open('', '_blank')
  if (!win) return

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')

  const sectionsHtml = sections
    .map(
      (s) => `
    <h2>${s.titulo}</h2>
    <table>
      <thead><tr><th>Tipo</th><th>Arquivo</th><th>Emissão</th><th>Validade</th><th>Status</th></tr></thead>
      <tbody>
        ${s.docs.length === 0 ? '<tr><td colspan="5" class="empty">Nenhum documento</td></tr>' : ''}
        ${s.docs
          .map((d) => {
            const status = getExpiryStatus(d.dataValidade)
            const cfg = getStatusConfig(status)
            return `<tr><td>${d.tipo}</td><td>${d.nomeArquivo || '—'}</td><td>${fmt(d.dataEmissao)}</td><td>${fmt(d.dataValidade)}</td><td class="${status === 'expired' ? 'expired' : 'valid'}">${cfg.label}</td></tr>`
          })
          .join('')}
      </tbody>
    </table>`,
    )
    .join('')

  win.document
    .write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dossiê - ${entityName}</title>
    <style>
      body{font-family:sans-serif;padding:20px;color:#333}
      h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:10px}
      h2{font-size:15px;margin-top:25px;margin-bottom:8px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:15px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f4f4f5}
      .empty{text-align:center;color:#999}
      .expired{color:#dc2626;font-weight:bold}
      .valid{color:#16a34a}
    </style></head><body>
    <h1>Dossiê ${entityType === 'empresa' ? 'da Empresa' : 'do Colaborador'}: ${entityName}</h1>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    ${sectionsHtml}
    <script>window.onload=()=>{setTimeout(()=>{window.print()},500)}</script>
    </body></html>`)
  win.document.close()
}
