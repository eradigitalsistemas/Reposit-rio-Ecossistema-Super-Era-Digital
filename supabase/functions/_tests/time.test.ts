import { describe, it, expect } from 'npm:vitest'
import { timeToDecimal, calculateTimeEntry } from '../_shared/time'

describe('Time Calculations', () => {
  describe('timeToDecimal', () => {
    it('should convert time string to decimal', () => {
      expect(timeToDecimal('08:30')).toBe(8.5)
      expect(timeToDecimal('09:00:00')).toBe(9)
      expect(timeToDecimal('12:45')).toBe(12.75)
    })
  })

  describe('calculateTimeEntry', () => {
    it('should calculate standard hours correctly', () => {
      const result = calculateTimeEntry('08:00', '17:00', '01:00')
      expect(result.hoursWorked).toBe(8)
      expect(result.overtime).toBe(0)
      expect(result.delay).toBe(0)
    })

    it('should calculate overtime correctly', () => {
      const result = calculateTimeEntry('08:00', '19:00', '01:00')
      expect(result.hoursWorked).toBe(10)
      expect(result.overtime).toBe(2)
      expect(result.delay).toBe(0)
    })

    it('should calculate delays correctly', () => {
      const result = calculateTimeEntry('09:00', '17:00', '01:00')
      // Entrance at 9 means 1 hour delay (threshold is 8)
      expect(result.hoursWorked).toBe(7)
      expect(result.overtime).toBe(0)
      expect(result.delay).toBe(1)
    })

    it('should throw error if exit is before entry', () => {
      expect(() => calculateTimeEntry('17:00', '08:00', '01:00')).toThrow(
        /Horário de saída não pode ser menor/,
      )
    })

    it('should throw error if break makes hours negative', () => {
      expect(() => calculateTimeEntry('08:00', '09:00', '02:00')).toThrow(
        /Horário fora do expediente ou intervalo inválido/,
      )
    })
  })
})
