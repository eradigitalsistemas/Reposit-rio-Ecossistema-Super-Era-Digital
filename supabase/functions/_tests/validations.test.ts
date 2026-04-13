import { describe, it, expect } from 'npm:vitest'
import { isValidCPF, validateEmail, validatePassword } from '../_shared/validations'

describe('Validations', () => {
  describe('isValidCPF', () => {
    it('should validate correct CPF', () => {
      expect(isValidCPF('52998224725')).toBe(true)
      expect(isValidCPF('00000000000')).toBe(false)
      expect(isValidCPF('11111111111')).toBe(false)
      expect(isValidCPF('12345678909')).toBe(false) // invalid check digits
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123')).toBe(true)
      expect(validatePassword('weak')).toBe(false) // < 8 chars
      expect(validatePassword('nouppercase123')).toBe(false)
      expect(validatePassword('NOLOWERCASE123')).toBe(false)
      expect(validatePassword('NoNumbersHere')).toBe(false)
    })
  })
})
