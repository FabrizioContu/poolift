# 📘 React Best Practices para Poolift - Guía de Agentes

**Basado en:** [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)

---

## 🎯 Para Qué Usar Esta Guía

**Agentes que DEBEN leer esto:**
- ✅ Frontend Agent (CRÍTICO)
- ✅ Backend Agent (para Server Components)

**Cuándo aplicar:**
- Escribiendo componentes React
- Implementando data fetching
- Creando páginas Next.js
- Optimizando performance

---

## ⚡ Prioridades de Optimización (de Vercel)

### 🔴 CRÍTICO (Impacto Mayor)
1. **Eliminar Waterfalls** - Cada `await` secuencial añade latencia completa
2. **Optimizar Bundle Size** - Importaciones pesadas matan el FCP

### 🟡 ALTO
3. **Server-Side Performance** - Usar Server Components cuando sea posible

### 🟢 MEDIO-ALTO
4. **Client-Side Data Fetching** - Patterns correctos de fetch

### 🔵 MEDIO
5. **Re-render Optimization** - useMemo, useCallback
6. **Rendering Performance** - Lazy loading, code splitting

### ⚪ BAJO-MEDIO
7. **JavaScript Micro-optimizations** - Optimizaciones menores

---

## 🚨 Reglas CRÍTICAS para Poolift

### 1. ELIMINAR WATERFALLS (CRITICAL)

**❌ INCORRECTO - Waterfall secuencial:**
```typescript
// Cada await espera al anterior = 600ms+
async function loadBirthdayPage(id: string) {
  const birthday = await fetch(`/api/birthdays/${id}`)
  const proposals = await fetch(`/api/proposals?birthdayId=${id}`)
  const votes = await fetch(`/api/votes?birthdayId=${id}`)
}
```

**✅ CORRECTO - Paralelo:**
```typescript
async function loadBirthdayPage(id: string) {
  const [birthday, proposals, votes] = await Promise.all([
    fetch(`/api/birthdays/${id}`),
    fetch(`/api/proposals?birthdayId=${id}`),
    fetch(`/api/votes?birthdayId=${id}`)
  ])
}
```

**Impacto:** ~400-600ms menos de tiempo de carga

---

### 2. OPTIMIZAR BUNDLE SIZE (CRITICAL)

**❌ INCORRECTO - Importar toda la librería:**
```typescript
import * as LucideIcons from 'lucide-react' // 500KB+

function BirthdayCard() {
  return <LucideIcons.Gift size={24} />
}
```

**✅ CORRECTO - Tree-shakeable imports:**
```typescript
import { Gift, Calendar, Users } from 'lucide-react' // ~5KB

function BirthdayCard() {
  return <Gift size={24} />
}
```

**Impacto:** -495KB en bundle final

**Para Poolift:**
```typescript
// SIEMPRE importar iconos específicos
import { Gift, Calendar, Users, Vote, ShoppingCart } from 'lucide-react'

// NO importar todo
❌ import * as Icons from 'lucide-react'
```

---

### 3. SERVER COMPONENTS por Defecto (HIGH)

**En Next.js 16, todos los componentes son Server Components por defecto.**

**✅ USAR Server Component cuando:**
- No necesitas interactividad (onClick, onChange)
- Cargas datos de BD
- No usas hooks (useState, useEffect)

**❌ USAR 'use client' SOLO cuando:**
- Necesitas useState, useEffect
- Tienes event handlers (onClick, onChange)
- Usas browser APIs (window, localStorage)

**Para Poolift:**
```typescript
// app/groups/[id]/page.tsx
// ✅ Server Component - carga datos desde BD
export default async function CalendarPage({ params }: { params: { id: string } }) {
  const { data: birthdays } = await supabase
    .from('birthdays')
    .select('*')
    .eq('group_id', params.id)
  
  return <BirthdayList birthdays={birthdays} />
}

// components/BirthdayCard.tsx  
// ❌ Client Component - tiene onClick
'use client'
export function BirthdayCard({ birthday, onClick }: Props) {
  return <div onClick={onClick}>...</div>
}
```

---

### 4. DATA FETCHING Patterns (MEDIUM-HIGH)

**❌ INCORRECTO - Fetch en useEffect (Client Side):**
```typescript
'use client'
function BirthdayList() {
  const [birthdays, setBirthdays] = useState([])
  
  useEffect(() => {
    fetch('/api/birthdays').then(r => r.json()).then(setBirthdays)
  }, [])
  
  return <div>{birthdays.map(...)}</div>
}
```

**✅ CORRECTO - Server Component:**
```typescript
// NO 'use client'
async function BirthdayList() {
  const { data: birthdays } = await supabase.from('birthdays').select('*')
  
  return <div>{birthdays.map(...)}</div>
}
```

**Impacto:** 
- Menos JavaScript al cliente
- Datos disponibles en primera renderización
- SEO friendly

---

### 5. LAZY LOADING de Modales (MEDIUM)

**Para Poolift, los modales NO se usan hasta que se abren:**

**✅ CORRECTO - Lazy load:**
```typescript
import dynamic from 'next/dynamic'

const CreateGroupModal = dynamic(() => 
  import('@/components/modals/CreateGroupModal')
)
const AddBirthdayModal = dynamic(() => 
  import('@/components/modals/AddBirthdayModal')
)

function HomePage() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>Crear Grupo</button>
      {showModal && <CreateGroupModal />}
    </>
  )
}
```

**Impacto:** Modal solo se descarga cuando se necesita

---

### 6. RE-RENDER Optimization (MEDIUM)

**❌ INCORRECTO - Re-render innecesario:**
```typescript
function ParticipantsList({ giftId }: { giftId: string }) {
  const [participants, setParticipants] = useState([])
  
  // Se ejecuta en CADA render
  const sortedParticipants = participants.sort((a, b) => 
    a.name.localeCompare(b.name)
  )
  
  return <div>{sortedParticipants.map(...)}</div>
}
```

**✅ CORRECTO - useMemo:**
```typescript
function ParticipantsList({ giftId }: { giftId: string }) {
  const [participants, setParticipants] = useState([])
  
  // Solo re-calcula si participants cambia
  const sortedParticipants = useMemo(
    () => participants.sort((a, b) => a.name.localeCompare(b.name)),
    [participants]
  )
  
  return <div>{sortedParticipants.map(...)}</div>
}
```

---

### 7. CACHING con React.cache() (HIGH)

**Para requests repetidos dentro de un mismo request:**

**✅ Server Component con cache:**
```typescript
import { cache } from 'react'

const getBirthday = cache(async (id: string) => {
  const { data } = await supabase
    .from('birthdays')
    .select('*')
    .eq('id', id)
    .single()
  
  return data
})

// Llama 3 veces pero solo hace 1 query
async function BirthdayPage({ id }: { id: string }) {
  const birthday = await getBirthday(id)
  const birthdayForTitle = await getBirthday(id) // Cache hit
  const birthdayForMeta = await getBirthday(id) // Cache hit
  
  return <div>...</div>
}
```

---

## 🎯 Checklist Específico para Poolift

### Durante Desarrollo:

**Backend Agent:**
- [ ] API Routes usan `Promise.all()` cuando es posible
- [ ] Queries a Supabase son paralelas
- [ ] No hay waterfalls secuenciales

**Frontend Agent:**
- [ ] Componentes son Server Components por defecto
- [ ] Solo usa 'use client' cuando necesario
- [ ] Iconos importados individualmente (no `import *`)
- [ ] Modales con lazy loading
- [ ] No fetch en useEffect si puede ser Server Component
- [ ] useMemo para cálculos costosos
- [ ] useCallback para funciones pasadas a children

---

## 📊 Impacto Esperado en Poolift

**Si sigues estas prácticas:**

| Optimización | Impacto | Para Poolift |
|--------------|---------|--------------|
| Eliminar waterfalls | -400-600ms | Calendario carga más rápido |
| Tree-shaking lucide | -495KB | Bundle más ligero |
| Server Components | -50KB JS | Menos descarga al cliente |
| Lazy modals | -100KB | Modals solo cuando se usan |
| useMemo en listas | Menos jank | Listas grandes fluidas |

**Total estimado:** ~1MB menos de JS + 500ms más rápido

---

## 🚨 Anti-Patterns a Evitar

### ❌ NO HACER NUNCA:

**1. Fetch secuencial cuando puede ser paralelo**
```typescript
❌ const a = await fetch(url1)
❌ const b = await fetch(url2)

✅ const [a, b] = await Promise.all([fetch(url1), fetch(url2)])
```

**2. Importar librerías completas**
```typescript
❌ import _ from 'lodash'
✅ import { debounce } from 'lodash-es'

❌ import * as Icons from 'lucide-react'
✅ import { Gift, Calendar } from 'lucide-react'
```

**3. Client Component cuando puede ser Server**
```typescript
❌ 'use client'
   function StaticList() { return <div>...</div> }

✅ function StaticList() { return <div>...</div> }
```

**4. Fetch en useEffect cuando puede ser Server Component**
```typescript
❌ useEffect(() => { fetch().then(setData) }, [])
✅ async function Component() { const data = await fetch() }
```

---

## 🔍 Debugging Performance

**Herramientas para validar:**

```bash
# Analizar bundle size
npm run build
# Ver output de Next.js - buscar paquetes grandes

# React DevTools Profiler
# Buscar renders innecesarios

# Chrome DevTools Network
# Buscar waterfalls en requests
```

---

## 📚 Referencias

- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

---

**Versión:** 1.0 (basado en Vercel v1.0.0)  
**Para:** Agentes Backend y Frontend de Poolift  
**Prioridad:** ALTA - Aplicar desde el inicio del desarrollo
