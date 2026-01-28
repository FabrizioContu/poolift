import { describe, it, expect } from 'vitest'
import { calculatePricePerFamily, formatCelebrants, formatPrice } from '@/lib/utils'

describe('Utils', () => {
  describe('calculatePricePerFamily', () => {
    it('calcula correctamente el precio por familia', () => {
      expect(calculatePricePerFamily(100, 4)).toBe('25.00')
      expect(calculatePricePerFamily(75.5, 3)).toBe('25.17')
    })
    
    it('retorna 0.00 cuando no hay participantes', () => {
      expect(calculatePricePerFamily(100, 0)).toBe('0.00')
    })
  })
  
  describe('formatCelebrants', () => {
    it('formatea un solo nombre', () => {
      expect(formatCelebrants(['Juan'])).toBe('Juan')
    })
    
    it('formatea dos nombres', () => {
      expect(formatCelebrants(['Juan', 'Gina'])).toBe('Juan y Gina')
    })
    
    it('formatea tres o más nombres', () => {
      expect(formatCelebrants(['Juan', 'Gina', 'Pedro'])).toBe('Juan, Gina y Pedro')
    })
    
    it('retorna string vacío para array vacío', () => {
      expect(formatCelebrants([])).toBe('')
    })
  })
  
  describe('formatPrice', () => {
    it('formatea precio con símbolo de euro', () => {
      expect(formatPrice(25.5)).toBe('25.50€')
      expect(formatPrice(100)).toBe('100.00€')
    })
  })
})
