import { describe, it, expect, vi, afterEach } from 'npm:vitest'
import { calculateBalance, daysBetween } from '../_shared/vacations'

describe('Vacations Logic', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('daysBetween', () => {
    it('should calculate inclusive days between dates', () => {
      expect(daysBetween('2023-01-01', '2023-01-10')).toBe(10)
      expect(daysBetween('2023-01-01', '2023-01-01')).toBe(1)
      expect(daysBetween('2023-02-28', '2023-03-01')).toBe(2)
    })
  })

  describe('calculateBalance', () => {
    it('should calculate accrued and available days correctly', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { hire_date: '2021-01-01' },
            error: null,
          }),
          then: vi.fn().mockResolvedValue({
            data: [
              { start_date: '2022-01-01', end_date: '2022-01-10', status: 'Aprovado' }, // 10 days used
            ],
          }),
        }),
      }

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-06-01T00:00:00Z'))

      const balance = await calculateBalance(mockSupabase as any, 'emp-123')

      // Hire date: 2021-01-01 to 2023-06-01 is 2 years and 5 months.
      // 2 periods completed = 2 * 30 = 60 days accrued.
      expect(balance.accrued).toBe(60)
      expect(balance.used).toBe(10)
      expect(balance.pending).toBe(0)
      expect(balance.remaining).toBe(50)
      expect(balance.available).toBe(50)
      expect(balance.months_worked).toBe(29)
      expect(balance.limit_reached).toBe(false)
    })

    it('should handle limit reached and expiration date (conformidade CLT)', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { hire_date: '2020-01-01' },
            error: null,
          }),
          then: vi.fn().mockResolvedValue({
            data: [], // no vacations used
          }),
        }),
      }

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2022-02-01T00:00:00Z'))

      const balance = await calculateBalance(mockSupabase as any, 'emp-123')

      // 2020-01-01 to 2022-02-01 = 2 years = 60 days accrued
      expect(balance.accrued).toBe(60)
      expect(balance.used).toBe(0)
      expect(balance.remaining).toBe(60)
      expect(balance.limit_reached).toBe(true) // Acúmulo máximo 60 dias
      expect(balance.expires_soon).toBe(false)
    })

    it('should account for pending vacation requests', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { hire_date: '2021-01-01' },
            error: null,
          }),
          then: vi.fn().mockResolvedValue({
            data: [
              { start_date: '2023-07-01', end_date: '2023-07-10', status: 'Pendente' }, // 10 days pending
            ],
          }),
        }),
      }

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-06-01T00:00:00Z'))

      const balance = await calculateBalance(mockSupabase as any, 'emp-123')

      expect(balance.accrued).toBe(60)
      expect(balance.used).toBe(0)
      expect(balance.pending).toBe(10)
      expect(balance.remaining).toBe(60)
      expect(balance.available).toBe(50) // 60 remaining - 10 pending
    })

    it('should throw an error if employee is not found', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found'),
          }),
        }),
      }

      await expect(calculateBalance(mockSupabase as any, 'invalid')).rejects.toThrow(
        'Colaborador não encontrado',
      )
    })
  })
})
