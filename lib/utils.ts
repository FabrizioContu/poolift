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
 * Obtiene el estado de una fiesta
 */
export function getPartyStatus(party: any): 'ideas' | 'votacion' | 'decidido' | 'comprado' {
  // TODO: Implementar lógica según propuestas y regalo
  return 'ideas'
}
