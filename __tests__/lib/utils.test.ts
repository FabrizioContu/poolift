import { describe, it, expect } from 'vitest'
import { calculatePricePerFamily, formatCelebrants, formatPrice, getPartyStatus } from '@/lib/utils'

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

  describe('getPartyStatus', () => {
    it('retorna pendiente cuando no hay propuestas ni regalo', () => {
      const result = getPartyStatus([], null)
      expect(result.status).toBe('pendiente')
      expect(result.label).toBe('Pendiente')
    })

    it('retorna votacion cuando hay propuestas sin seleccionar', () => {
      const proposals = [{ is_selected: false }, { is_selected: false }]
      const result = getPartyStatus(proposals)
      expect(result.status).toBe('votacion')
      expect(result.label).toBe('Votación')
    })

    it('retorna decidido cuando una propuesta está seleccionada', () => {
      const proposals = [{ is_selected: false }, { is_selected: true }]
      const result = getPartyStatus(proposals)
      expect(result.status).toBe('decidido')
      expect(result.label).toBe('Decidido')
    })

    it('retorna decidido cuando existe regalo sin comprar', () => {
      const proposals = [{ is_selected: true }]
      const gift = { purchased_at: null }
      const result = getPartyStatus(proposals, gift)
      expect(result.status).toBe('decidido')
    })

    it('retorna comprado cuando el regalo tiene purchased_at', () => {
      const proposals = [{ is_selected: true }]
      const gift = { purchased_at: '2026-01-15T10:00:00Z' }
      const result = getPartyStatus(proposals, gift)
      expect(result.status).toBe('comprado')
      expect(result.label).toBe('Comprado')
    })

    it('comprado tiene prioridad sobre cualquier estado de propuestas', () => {
      const proposals = [{ is_selected: false }]
      const gift = { purchased_at: '2026-01-15T10:00:00Z' }
      const result = getPartyStatus(proposals, gift)
      expect(result.status).toBe('comprado')
    })

    it('retorna pendiente sin segundo argumento', () => {
      const result = getPartyStatus([])
      expect(result.status).toBe('pendiente')
    })
  })
})
