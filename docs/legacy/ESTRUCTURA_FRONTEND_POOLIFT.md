# 📁 Frontend Structure - Poolift

## React Best Practices Aplicadas

### ✅ Vercel Standards
- Server Components por defecto
- 'use client' solo cuando necesario
- Tree-shakeable imports (lucide-react)
- Promise.all() para parallelismo
- Lazy loading de modales

### ✅ Optimizaciones
- useMemo para cálculos costosos
- useCallback para funciones
- Real-time con Supabase subscriptions
- Bundle optimization

## Estructura de Carpetas

```
app/
├── page.tsx                    # Landing (Server Component)
├── groups/[inviteCode]/
│   ├── page.tsx               # Join group
│   └── setup/page.tsx         # Setup inicial
├── dashboard/[groupId]/
│   ├── page.tsx               # Calendario (Server)
│   ├── parties/[partyId]/
│   │   └── page.tsx           # Detalle fiesta
│   └── ideas/page.tsx         # Banco ideas
├── coordinator/[giftId]/
│   └── purchase/page.tsx      # Compra (Client)
└── gifts/[shareCode]/
    └── page.tsx               # Vista participante

components/
├── ui/
│   ├── Modal.tsx              # Base modal
│   ├── Button.tsx
│   └── Card.tsx
├── modals/                    # Lazy loaded
│   ├── CreateGroupModal.tsx
│   ├── AddBirthdayModal.tsx
│   ├── CreatePartyModal.tsx   ⭐ NUEVO
│   ├── AddIdeaModal.tsx
│   └── AddProposalModal.tsx
├── cards/
│   ├── PartyCard.tsx
│   ├── IdeaCard.tsx
│   └── ProposalCard.tsx
└── lists/
    ├── FamiliesList.tsx       # Real-time
    └── ParticipantsList.tsx   # Real-time

lib/
├── supabase.ts                ✅ Creado
├── types.ts                   ✅ Creado
├── utils.ts
├── messages.ts
└── hooks/
    ├── useParties.ts
    ├── useBirthdays.ts
    └── useRealtime.ts
```

## Comandos para Claude Code

```bash
# Instalar dependencias adicionales
npm install lucide-react react-hook-form zod @hookform/resolvers date-fns

# Testing con Vitest ⚡
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @vitest/ui

# Crear estructura
mkdir -p components/{ui,modals,cards,lists}
mkdir -p lib/hooks
mkdir -p __tests__/{api,components}
mkdir -p app/{groups/[inviteCode]/setup,dashboard/[groupId]/{parties/[partyId],ideas},coordinator/[giftId]/purchase,gifts/[shareCode]}
```

## Configuración de Testing (Vitest)

### vitest.config.ts
```typescript
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
```

### vitest.setup.ts
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

### Scripts en package.json
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage"
  }
}
```

## Ventajas de Vitest

⚡ **Performance:**
- 10-20x más rápido que Jest
- HMR para tests (recarga instantánea)
- Ejecución paralela optimizada

🎯 **Developer Experience:**
- UI interactiva incluida (`npm run test:ui`)
- Compatible con API de Jest
- Mejor integración con TypeScript
- ESM nativo sin configuración

🚀 **Next.js Integration:**
- Funciona perfectamente con Next.js 16
- Compatible con Turbopack
- Sin configuración compleja
