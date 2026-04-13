import { describe, it, expect, vi } from 'npm:vitest'
import { calculateBalance, daysBetween } from '../_shared/vacations'

describe('Vacations Logic', () => {
  describe('daysBetween', () => {
    it('should calculate inclusive days between dates', () => {
      expect(daysBetween('2023-01-01', '2023-01-10')).toBe(10)
      expect(daysBetween('2023-01-01', '2023-01-01')).toBe(1)
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

      // Mock date so 'today' is deterministic
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
      expect(balance.limit_reached).toBe(false) // remaining < 60 since it is 50

      vi.useRealTimers()
    })

    it('should handle limit reached and expiration date', async () => {
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
      expect(balance.limit_reached).toBe(true)

      vi.useRealTimers()
    })
  })
})
