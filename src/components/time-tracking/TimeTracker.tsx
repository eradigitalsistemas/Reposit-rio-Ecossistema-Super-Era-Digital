import { useEffect, useState } from 'react'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Play, Pause, Square, FileDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TimeTracker() {
  const { todayEntry, fetchToday, fetchMonthly, registerAction, entries, totals } =
    useTimeTrackingStore()
  const [time, setTime] = useState(new Date())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  const [year, setYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    fetchToday()
    fetchMonthly(month, year)
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [month, year])

  const handleAction = async (action: 'entry' | 'break' | 'exit') => {
    const res = await registerAction(action)
    if (res.success) {
      toast.success('Ponto registrado com sucesso.')
      fetchMonthly(month, year)
    } else {
      toast.error(res.error || 'Erro ao registrar ponto.')
    }
  }

  const exportCSV = () => {
    const csv = ['Data,Entrada,Intervalo,Saída,Horas Trab.,Horas Extras,Atraso']
    entries.forEach((e: any) =>
      csv.push(
        `${e.date},${e.entry_time || '-'},${e.break_duration || '-'},${e.exit_time || '-'},${e.hours_worked || '0'},${e.overtime || '0'},${e.delay || '0'}`,
      ),
    )
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ponto_${month}_${year}.csv`
    a.click()
  }

  const hasEntry = !!todayEntry?.entry_time
  const hasExit = !!todayEntry?.exit_time

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl text-center font-mono py-4">
            {time.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </CardTitle>
          <CardDescription className="text-center">Horário de Brasília (UTC-3)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-center gap-4">
          <Button
            size="lg"
            disabled={hasEntry}
            onClick={() => handleAction('entry')}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="mr-2 h-5 w-5" /> Registrar Entrada
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={!hasEntry || hasExit}
            onClick={() => handleAction('break')}
            className="w-full md:w-auto"
          >
            <Pause className="mr-2 h-5 w-5" /> Registrar Intervalo
          </Button>
          <Button
            size="lg"
            variant="destructive"
            disabled={!hasEntry || hasExit}
            onClick={() => handleAction('exit')}
            className="w-full md:w-auto"
          >
            <Square className="mr-2 h-5 w-5" /> Registrar Saída
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Folha de Ponto Mensal</CardTitle>
          <div className="flex gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {String(i + 1).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV}>
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Dias Trabalhados</p>
              <p className="text-2xl font-bold">{totals.days_worked || 0}</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
              <p className="text-2xl font-bold">{totals.hours_worked || 0}h</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Horas Extras</p>
              <p className="text-2xl font-bold text-green-500">{totals.overtime || 0}h</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Atrasos</p>
              <p className="text-2xl font-bold text-red-500">{totals.delay || 0}h</p>
            </div>
          </div>

          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Entrada</th>
                  <th className="p-3">Intervalo</th>
                  <th className="p-3">Saída</th>
                  <th className="p-3">Trab.</th>
                  <th className="p-3">Extra</th>
                  <th className="p-3">Atraso</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any) => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3">
                      {new Date(`${e.date}T12:00:00Z`).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3">{e.entry_time || '-'}</td>
                    <td className="p-3">{e.break_duration || '-'}</td>
                    <td className="p-3">{e.exit_time || '-'}</td>
                    <td className="p-3">{e.hours_worked || 0}h</td>
                    <td className="p-3 text-green-600">{e.overtime || 0}h</td>
                    <td className="p-3 text-red-600">{e.delay || 0}h</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
