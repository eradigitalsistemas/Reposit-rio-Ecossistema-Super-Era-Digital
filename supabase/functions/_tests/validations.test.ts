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

    it('should handle formatting properly', () => {
      expect(isValidCPF('529.982.247-25')).toBe(true)
    })

    it('should return false for strings with invalid length after stripping', () => {
      expect(isValidCPF('529982247')).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('test.name+alias@example.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@example')).toBe(false) // Rejects because no dot
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123')).toBe(true)
      expect(validatePassword('aB3defgh')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false) // < 8 chars
      expect(validatePassword('nouppercase123')).toBe(false)
      expect(validatePassword('NOLOWERCASE123')).toBe(false)
      expect(validatePassword('NoNumbersHere')).toBe(false)
      expect(validatePassword('short1A')).toBe(false) // < 8 chars
    })
  })
})
