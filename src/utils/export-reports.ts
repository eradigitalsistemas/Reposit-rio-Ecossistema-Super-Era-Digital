export function exportToCSV(
  data: any[],
  filename: string,
  columns: { header: string; key: string }[],
) {
  if (!data || data.length === 0) return

  const headers = columns.map((c) => `"${c.header}"`).join(',')
  const rows = data
    .map((row) =>
      columns
        .map((c) => {
          const val = String(row[c.key] ?? '').replace(/"/g, '""')
          return `"${val}"`
        })
        .join(','),
    )
    .join('\n')

  const csvContent = '\uFEFF' + headers + '\n' + rows
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
