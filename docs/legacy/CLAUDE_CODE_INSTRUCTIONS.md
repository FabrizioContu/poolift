# 🤖 INSTRUCCIONES PARA CLAUDE CODE - Frontend Poolift

## 📋 Estado Actual

**✅ COMPLETADO:**
- Database Agent (11 tablas en Supabase)
- Backend Agent (15+ API endpoints funcionando)
- Estructura base del frontend
- Configuración de testing

**⏳ POR HACER:**
- Modales (5)
- Pantallas principales (7-8)
- Componentes de tarjetas
- Real-time updates
- Testing

---

## 🎯 Prioridades de Desarrollo

### CRÍTICO: Seguir React Best Practices

**Antes de escribir cualquier código, lee:**
- `/mnt/user-data/outputs/REACT_BEST_PRACTICES_POOLIFT.md`

**Reglas clave:**
1. ✅ Server Components por defecto
2. ✅ 'use client' SOLO cuando:
   - Usas useState, useEffect
   - Tienes event handlers (onClick, etc.)
   - Accedes a browser APIs
3. ✅ Importar iconos individuales:
   ```typescript
   // ✅ CORRECTO
   import { Gift, Calendar, Users } from 'lucide-react'
   
   // ❌ INCORRECTO
   import * as Icons from 'lucide-react'
   ```
4. ✅ Promise.all() para requests paralelos
5. ✅ Lazy loading de modales:
   ```typescript
   const CreatePartyModal = dynamic(() => 
     import('@/components/modals/CreatePartyModal')
   )
   ```

---

## 📁 Archivos Creados

### ✅ Ya Disponibles:

**Utilidades:**
- `lib/utils.ts` - Funciones helper
- `lib/messages.ts` - Mensajes WhatsApp
- `lib/hooks/useParties.ts` - Hook para fiestas
- `lib/hooks/useRealtime.ts` - Hook real-time

**Componentes Base:**
- `components/ui/Modal.tsx` - Modal reutilizable
- `components/ui/Button.tsx` - Botón con variantes

**Páginas:**
- `app/page.tsx` - Landing page básico

**Testing:**
- `jest.config.js` - Configuración Jest
- `jest.setup.js` - Setup testing

---

## 🚀 Plan de Desarrollo (Orden Recomendado)

### FASE 1: Modales (Críticos)

**1.1 CreatePartyModal ⭐ NUEVO - MÁS IMPORTANTE**

Ubicación: `components/modals/CreatePartyModal.tsx`

**Requisitos:**
```typescript
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

interface CreatePartyModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  birthdays: Array<{id: string, child_name: string, birth_date: string}>
}

// Funcionalidad:
// 1. Input: fecha de fiesta
// 2. Checkboxes: seleccionar celebrantes (múltiple)
// 3. Dropdown: coordinador (opcional - auto si vacío)
// 4. Botón: Crear Fiesta
// 5. POST /api/parties con celebrantIds[]
```

**Ejemplo de uso:**
```typescript
const [showModal, setShowModal] = useState(false)

// En el render:
{showModal && (
  <CreatePartyModal 
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    groupId={groupId}
    birthdays={birthdays}
  />
)}
```

---

**1.2 AddBirthdayModal** (Simplificado - ya NO tiene party_date)

Ubicación: `components/modals/AddBirthdayModal.tsx`

```typescript
// Campos:
// - childName
// - birthDate
// Ya NO incluye: party_date, coordinator_id
```

---

**1.3 Otros Modales:**
- `AddIdeaModal.tsx` - Añadir idea
- `AddProposalModal.tsx` - Crear propuesta

**Referencia:** Ver `poolift-wireframes.jsx` líneas correspondientes

---

### FASE 2: Pantallas Principales

**2.1 Dashboard/Calendar** (Server Component)

Ubicación: `app/dashboard/[groupId]/page.tsx`

```typescript
// Server Component - carga datos en server
import { supabase } from '@/lib/supabase'

export default async function DashboardPage({ 
  params 
}: { 
  params: { groupId: string } 
}) {
  // Cargar fiestas desde API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/parties?groupId=${params.groupId}`,
    { cache: 'no-store' } // Datos dinámicos
  )
  const { parties } = await response.json()
  
  return (
    <div>
      {/* Lista de PartyCard */}
      {/* Botón: Crear Fiesta (abre modal) */}
    </div>
  )
}
```

**Importante:**
- ✅ Es Server Component (no 'use client')
- ✅ Datos cargados en server
- ✅ Modal se carga lazy cuando se clickea botón

---

**2.2 Party Detail**

Ubicación: `app/dashboard/[groupId]/parties/[partyId]/page.tsx`

```typescript
// Server Component
// Mostrar:
// - Info de fiesta
// - Celebrantes (Juan + Gina)
// - Tabs: Propuestas | Ideas
// - Votación
// - Botón coordinador: "Elegir este regalo"
```

---

**2.3 Vista Participante**

Ubicación: `app/gifts/[shareCode]/page.tsx`

```typescript
// Server Component
// Cargar regalo por share_code
// Mostrar:
// - Celebrantes, fecha, regalo
// - Lista participantes (real-time)
// - Botón: Apuntarse/Desapuntarse
// - Si cerrado: precio por familia
```

---

### FASE 3: Componentes de Tarjetas

**3.1 PartyCard**

Ubicación: `components/cards/PartyCard.tsx`

```typescript
interface PartyCardProps {
  party: {
    id: string
    party_date: string
    party_celebrants: Array<{
      birthdays: { child_name: string }
    }>
    coordinator: { name: string }
  }
  isCoordinator: boolean
}

// Visual:
// - Badge de estado (ideas/votación/decidido)
// - Fecha de fiesta
// - Celebrantes: "Juan y Gina"
// - Coordinador
// - Badge "TU TURNO" si isCoordinator
```

---

### FASE 4: Real-time Updates

**Usar `useRealtime` hook:**

```typescript
'use client'

import { useRealtime } from '@/lib/hooks/useRealtime'

export function ParticipantsList({ giftId }: { giftId: string }) {
  const [participants, setParticipants] = useState([])
  
  // Real-time subscription
  useRealtime(
    'participants',
    { column: 'gift_id', value: giftId },
    (newParticipant) => {
      setParticipants(prev => [...prev, newParticipant])
    }
  )
  
  return (/* lista */)
}
```

---

## 🧪 Testing

**Crear tests para:**

1. **Modales:**
```typescript
// __tests__/components/CreatePartyModal.test.tsx
import { render, screen } from '@testing-library/react'
import { CreatePartyModal } from '@/components/modals/CreatePartyModal'

describe('CreatePartyModal', () => {
  it('renders correctly', () => {
    // Test aquí
  })
})
```

2. **APIs:**
```typescript
// __tests__/api/parties.test.ts
describe('POST /api/parties', () => {
  it('creates party with celebrants', async () => {
    // Test de integración
  })
})
```

---

## 🎨 Estilos (Tailwind)

**Paleta de colores:**

```css
/* Estados */
bg-yellow-100 border-yellow-300  /* Ideas */
bg-purple-100 border-purple-300  /* Votación */
bg-green-100 border-green-300    /* Decidido */
bg-gray-100 border-gray-300      /* Comprado */

/* Acciones */
bg-blue-500 hover:bg-blue-600    /* Primary */
bg-green-500 hover:bg-green-600  /* Success */
```

---

## 📊 Checklist Completo

### Modales:
- [ ] CreatePartyModal ⭐ CRÍTICO
- [ ] AddBirthdayModal (simplificado)
- [ ] AddIdeaModal
- [ ] AddProposalModal

### Pantallas:
- [ ] Dashboard/Calendar
- [ ] Party Detail
- [ ] Setup Inicial
- [ ] Vista Participante
- [ ] Compra y Cierre (coordinador)
- [ ] Banco de Ideas

### Componentes:
- [ ] PartyCard
- [ ] IdeaCard
- [ ] ProposalCard
- [ ] FamiliesList (real-time)
- [ ] ParticipantsList (real-time)

### Features:
- [ ] Real-time subscriptions
- [ ] Lazy loading de modales
- [ ] Optimistic updates
- [ ] Error handling
- [ ] Loading states

### Testing:
- [ ] Tests de modales
- [ ] Tests de componentes
- [ ] Tests de APIs
- [ ] Tests e2e básicos

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Testing
npm test
npm test -- --watch

# Build
npm run build

# Lint
npm run lint
```

---

## 🚨 Errores Comunes a Evitar

### ❌ NO HACER:

**1. Client Component innecesario:**
```typescript
// ❌ MALO
'use client'
function PartyList({ parties }: { parties: Party[] }) {
  return <div>{parties.map(...)}</div>
}

// ✅ BUENO (Server Component)
function PartyList({ parties }: { parties: Party[] }) {
  return <div>{parties.map(...)}</div>
}
```

**2. Importar toda la librería:**
```typescript
// ❌ MALO
import * as Icons from 'lucide-react'

// ✅ BUENO
import { Gift, Calendar, Users } from 'lucide-react'
```

**3. Fetch secuencial:**
```typescript
// ❌ MALO
const parties = await fetch('/api/parties')
const ideas = await fetch('/api/ideas')

// ✅ BUENO
const [parties, ideas] = await Promise.all([
  fetch('/api/parties'),
  fetch('/api/ideas')
])
```

---

## 📝 Notas Finales

**El modelo Party es DIFERENTE al wireframe:**

**Wireframe original:**
- Cada cumpleaños tiene su fiesta

**Modelo actual:**
- Cumpleaños solo tiene datos del niño
- **Fiestas son entidades separadas**
- Una fiesta puede celebrar a múltiples niños

**Por tanto:**
- El modal "Añadir Cumpleaños" es más simple (solo niño)
- **Hay un NUEVO modal "Crear Fiesta"** (seleccionar celebrantes)
- El calendario muestra **fiestas**, no cumpleaños individuales

---

## 🎯 Primera Tarea Recomendada

**Implementar CreatePartyModal:**

1. Leer REACT_BEST_PRACTICES_POOLIFT.md
2. Crear `components/modals/CreatePartyModal.tsx`
3. Usar 'use client'
4. Form con react-hook-form
5. Validación con zod
6. Checkboxes para seleccionar celebrantes
7. POST a /api/parties
8. Probar funcionamiento

**Esto desbloquea el resto del desarrollo** ✅

---

**Versión:** 1.0  
**Para:** Claude Code o desarrollo manual  
**Stack:** Next.js 16 + Supabase + TypeScript + Tailwind  
**Modelo:** Party v2.0 (fiestas conjuntas)
