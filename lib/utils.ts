/**
 * Calcula el precio por familia
 */
export function calculatePricePerFamily(
  totalPrice: number,
  participants: number
): string {
  if (participants === 0) return '0.00'
  return (totalPrice / participants).toFixed(2)
}

/**
 * Formatea una fecha a formato español
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formatea un precio
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(2)}€`
}

/**
 * Genera nombre corto para celebrantes
 * Ej: ["Juan", "Gina", "Pedro"] -> "Juan, Gina y Pedro"
 */
export function formatCelebrants(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} y ${names[1]}`
  
  const lastIndex = names.length - 1
  return names.slice(0, lastIndex).join(', ') + ' y ' + names[lastIndex]
}

/**
 * Obtiene el estado de una fiesta según sus propuestas y regalo
 */
export type PartyStatus = 'pendiente' | 'votacion' | 'decidido' | 'comprado'

export interface PartyStatusInfo {
  status: PartyStatus
  label: string
  color: string
}

export function getPartyStatus(
  proposals: Array<{ is_selected: boolean }>,
  gift?: { purchased_at: string | null } | null
): PartyStatusInfo {
  if (gift?.purchased_at) {
    return { status: 'comprado', label: 'Comprado', color: 'bg-purple-100 text-purple-800' }
  }
  if (proposals.some(p => p.is_selected) || gift) {
    return { status: 'decidido', label: 'Decidido', color: 'bg-green-100 text-green-800' }
  }
  if (proposals.length > 0) {
    return { status: 'votacion', label: 'Votación', color: 'bg-yellow-100 text-yellow-800' }
  }
  return { status: 'pendiente', label: 'Pendiente', color: 'bg-blue-100 text-blue-800' }
}
