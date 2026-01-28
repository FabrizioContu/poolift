#!/bin/bash

# ============================================
# POOLIFT - Frontend Setup Script (Vitest)
# Para Claude Code o desarrollo manual
# ============================================

echo "🚀 Configurando estructura frontend de Poolift con Vitest..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. INSTALAR DEPENDENCIAS
# ============================================

echo -e "${BLUE}📦 Instalando dependencias UI...${NC}"
npm install lucide-react react-hook-form zod @hookform/resolvers date-fns

echo -e "${BLUE}📦 Instalando Vitest y testing libraries...${NC}"
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @vitest/ui

echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# ============================================
# 2. CREAR ESTRUCTURA DE CARPETAS
# ============================================

echo -e "${BLUE}📁 Creando estructura de carpetas...${NC}"

# Componentes
mkdir -p components/ui
mkdir -p components/modals
mkdir -p components/cards
mkdir -p components/lists

# Hooks
mkdir -p lib/hooks

# Tests
mkdir -p __tests__/api
mkdir -p __tests__/components
mkdir -p __tests__/lib

# App routes
mkdir -p app/groups/\[inviteCode\]/setup
mkdir -p app/dashboard/\[groupId\]/parties/\[partyId\]
mkdir -p app/dashboard/\[groupId\]/ideas
mkdir -p app/coordinator/\[giftId\]/purchase
mkdir -p app/gifts/\[shareCode\]

echo -e "${GREEN}✅ Estructura de carpetas creada${NC}"
echo ""

# ============================================
# 3. CONFIGURAR VITEST
# ============================================

echo -e "${BLUE}⚙️  Configurando Vitest...${NC}"

# vitest.config.ts
cat > vitest.config.ts << 'ENDFILE'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
ENDFILE

echo -e "${GREEN}✅ vitest.config.ts${NC}"

# vitest.setup.ts
cat > vitest.setup.ts << 'ENDFILE'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
ENDFILE

echo -e "${GREEN}✅ vitest.setup.ts${NC}"

# ============================================
# 4. CREAR ARCHIVOS BASE
# ============================================

echo -e "${BLUE}📝 Creando archivos base...${NC}"

# ============================================
# lib/utils.ts
# ============================================
cat > lib/utils.ts << 'ENDFILE'
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
ENDFILE

echo -e "${GREEN}✅ lib/utils.ts${NC}"

# ============================================
# lib/messages.ts
# ============================================
cat > lib/messages.ts << 'ENDFILE'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://poolift.com'

export function generateInviteMessage(
  groupName: string,
  inviteCode: string
): string {
  return `🎉 ¡Únete a nuestro grupo de regalos!

Hola! Te invito a unirte a "${groupName}" en Poolift.

Con esta app podemos organizarnos mejor para los regalos de cumpleaños de los niños. Ya no más confusiones sobre quién participa o cuánto poner 😊

👉 Únete aquí: ${APP_URL}/groups/${inviteCode}

¡Nos vemos dentro!`
}

export function generateParticipationMessage(
  celebrants: string[],
  partyDate: string,
  giftName: string,
  totalPrice: number,
  shareCode: string
): string {
  const names = celebrants.join(' y ')
  
  return `🎁 Regalo para ${names}

Fiesta: ${partyDate}
Regalo: ${giftName}
Precio total: ${totalPrice}€

¿Quieres participar?

👉 Apúntate aquí: ${APP_URL}/gifts/${shareCode}`
}

export function generateCompletionMessage(
  celebrants: string[],
  partyDate: string,
  giftName: string,
  finalPrice: number,
  pricePerFamily: string,
  comment: string,
  shareCode: string
): string {
  const names = celebrants.join(' y ')
  
  return `🎉 ¡Regalo completado!

Cumpleaños: ${names}
Fiesta: ${partyDate}
Regalo: ${giftName}

💰 Precio final: ${finalPrice}€
👥 Por familia: ${pricePerFamily}€

${comment ? `📝 Nota: ${comment}\n\n` : ''}👉 Ver detalles: ${APP_URL}/gifts/${shareCode}`
}
ENDFILE

echo -e "${GREEN}✅ lib/messages.ts${NC}"

# ============================================
# components/ui/Modal.tsx
# ============================================
cat > components/ui/Modal.tsx << 'ENDFILE'
'use client'

import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
ENDFILE

echo -e "${GREEN}✅ components/ui/Modal.tsx${NC}"

# ============================================
# components/ui/Button.tsx
# ============================================
cat > components/ui/Button.tsx << 'ENDFILE'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
ENDFILE

echo -e "${GREEN}✅ components/ui/Button.tsx${NC}"

# ============================================
# lib/hooks/useParties.ts
# ============================================
cat > lib/hooks/useParties.ts << 'ENDFILE'
'use client'

import { useState, useEffect } from 'react'
import type { Party } from '@/lib/types'

export function useParties(groupId: string) {
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchParties() {
      try {
        const response = await fetch(`/api/parties?groupId=${groupId}`)
        const data = await response.json()
        
        if (data.error) throw new Error(data.error)
        
        setParties(data.parties || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar fiestas')
      } finally {
        setLoading(false)
      }
    }
    
    fetchParties()
  }, [groupId])
  
  return { parties, loading, error }
}
ENDFILE

echo -e "${GREEN}✅ lib/hooks/useParties.ts${NC}"

# ============================================
# lib/hooks/useRealtime.ts
# ============================================
cat > lib/hooks/useRealtime.ts << 'ENDFILE'
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtime(
  table: string,
  filter: { column: string; value: string },
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload) => onInsert?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload) => onUpdate?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload) => onDelete?.(payload.old)
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter.column, filter.value, onInsert, onUpdate, onDelete])
}
ENDFILE

echo -e "${GREEN}✅ lib/hooks/useRealtime.ts${NC}"

# ============================================
# app/page.tsx (Landing)
# ============================================
cat > app/page.tsx << 'ENDFILE'
import Link from 'next/link'
import { Gift } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <Gift className="w-20 h-20 mx-auto mb-6 text-blue-500" />
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Poolift
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Regalos juntos, mejor
          </p>
          
          <p className="text-lg text-gray-700 mb-12">
            Organiza regalos de cumpleaños escolares sin complicaciones.
            Coordina, vota y participa fácilmente.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/create-group"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Crear Grupo
            </Link>
            
            <Link 
              href="/join"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Unirse a Grupo
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎂</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Fiestas Conjuntas</h3>
            <p className="text-gray-600">
              Celebra a varios niños en una sola fiesta
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗳️</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Votación Democrática</h3>
            <p className="text-gray-600">
              Todos proponen y votan el regalo
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-bold text-lg mb-2">División Justa</h3>
            <p className="text-gray-600">
              Precio dividido automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
ENDFILE

echo -e "${GREEN}✅ app/page.tsx${NC}"

# ============================================
# __tests__/lib/utils.test.ts
# ============================================
cat > __tests__/lib/utils.test.ts << 'ENDFILE'
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
ENDFILE

echo -e "${GREEN}✅ __tests__/lib/utils.test.ts${NC}"

# ============================================
# __tests__/components/Button.test.tsx
# ============================================
cat > __tests__/components/Button.test.tsx << 'ENDFILE'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza correctamente', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('aplica la variante primary por defecto', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('bg-blue-500')
  })
  
  it('aplica la variante secondary', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByText('Secondary')
    expect(button).toHaveClass('bg-gray-200')
  })
  
  it('aplica la variante danger', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByText('Danger')
    expect(button).toHaveClass('bg-red-500')
  })
})
ENDFILE

echo -e "${GREEN}✅ __tests__/components/Button.test.tsx${NC}"

# ============================================
# FINALIZAR
# ============================================

echo ""
echo -e "${GREEN}🎉 ¡Setup con Vitest completado!${NC}"
echo ""
echo "📁 Estructura creada:"
echo "  ✅ Componentes base (Modal, Button)"
echo "  ✅ Utils y helpers"
echo "  ✅ Hooks personalizados"
echo "  ✅ Landing page"
echo "  ✅ Vitest configurado ⚡"
echo "  ✅ Tests de ejemplo funcionando"
echo ""
echo -e "${YELLOW}⚙️  IMPORTANTE: Añade estos scripts a package.json:${NC}"
echo ""
echo '  "scripts": {'
echo '    "dev": "next dev --turbopack",'
echo '    "build": "next build",'
echo '    "start": "next start",'
echo '    "lint": "next lint",'
echo '    "test": "vitest",'
echo '    "test:ui": "vitest --ui",'
echo '    "test:run": "vitest run",'
echo '    "coverage": "vitest run --coverage"'
echo '  }'
echo ""
echo "📝 Próximos pasos:"
echo "  1. Añadir scripts a package.json"
echo "  2. Ejecutar: npm test"
echo "  3. Ejecutar: npm run test:ui (recomendado)"
echo "  4. Implementar modales con Claude Code"
echo ""
echo "🚀 Comandos disponibles:"
echo "  npm run dev         # Desarrollo"
echo "  npm test            # Tests en watch mode"
echo "  npm run test:ui     # Tests con UI interactiva ⚡"
echo "  npm run test:run    # Tests una vez"
echo "  npm run coverage    # Cobertura de tests"
echo ""
echo -e "${YELLOW}💡 TIP: Ejecuta 'npm run test:ui' para ver tests en el navegador${NC}"
echo ""
