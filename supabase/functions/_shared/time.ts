export function timeToDecimal(t: string) {
  if (!t) return 0
  const [h, m, s] = t.split(':').map(Number)
  return (h || 0) + (m || 0) / 60 + (s || 0) / 3600
}

export function calculateTimeEntry(
  entryTime: string,
  exitTime: string,
  breakDuration: string = '01:00:00',
) {
  const entryDecimal = timeToDecimal(entryTime)
  const exitDecimal = timeToDecimal(exitTime)
  const breakDecimal = timeToDecimal(breakDuration)

  if (exitDecimal < entryDecimal) {
    throw new Error('Horário de saída não pode ser menor que entrada')
  }

  let hoursWorked = exitDecimal - entryDecimal - breakDecimal
  if (hoursWorked < 0) {
    throw new Error('Horário fora do expediente ou intervalo inválido')
  }

  const overtime = hoursWorked > 8 ? parseFloat((hoursWorked - 8).toFixed(2)) : 0
  const delay = entryDecimal > 8 ? parseFloat((entryDecimal - 8).toFixed(2)) : 0

  return {
    hoursWorked: parseFloat(hoursWorked.toFixed(2)),
    overtime,
    delay,
  }
}
