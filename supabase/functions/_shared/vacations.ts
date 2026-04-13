export function daysBetween(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`)
  const e = new Date(`${end}T00:00:00Z`)
  const diffTime = e.getTime() - s.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export async function calculateBalance(supabase: any, employeeId: string) {
  const { data: employee, error: empErr } = await supabase
    .from('employees')
    .select('hire_date')
    .eq('id', employeeId)
    .single()

  if (empErr || !employee) throw new Error('Colaborador não encontrado')

  const hireDate = new Date(`${employee.hire_date}T00:00:00Z`)
  const today = new Date()

  let totalMonths =
    (today.getFullYear() - hireDate.getFullYear()) * 12 + (today.getMonth() - hireDate.getMonth())
  if (today.getDate() < hireDate.getDate()) {
    totalMonths--
  }

  const periodsCompleted = Math.floor(totalMonths / 12)
  const daysAccrued = periodsCompleted * 30

  const { data: requests } = await supabase
    .from('vacation_requests')
    .select('start_date, end_date, status')
    .eq('employee_id', employeeId)
    .in('status', ['Aprovado', 'Pendente'])

  let daysUsed = 0
  let pendingDays = 0

  if (requests) {
    requests.forEach((req: any) => {
      const days = daysBetween(req.start_date, req.end_date)
      if (req.status === 'Aprovado') {
        daysUsed += days
      } else if (req.status === 'Pendente') {
        pendingDays += days
      }
    })
  }

  const remaining = daysAccrued - daysUsed
  const available = remaining - pendingDays

  const periodsUsed = Math.floor(daysUsed / 30)
  const activePeriodStartYear = periodsUsed
  const expirationDate = new Date(hireDate)
  expirationDate.setFullYear(expirationDate.getFullYear() + activePeriodStartYear + 2)

  const daysToExpiration = Math.ceil(
    (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  const expiresSoon = remaining > 0 && daysToExpiration <= 30

  return {
    accrued: daysAccrued,
    used: daysUsed,
    pending: pendingDays,
    remaining,
    available,
    expiration_date: remaining > 0 ? expirationDate.toISOString().split('T')[0] : null,
    expires_soon: expiresSoon,
    months_worked: totalMonths,
    limit_reached: remaining >= 60,
  }
}
