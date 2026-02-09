# Frontend Developer Agent - Poolift

## Role
UI components, user interactions, client-side logic, and Next.js pages.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict)
- Tailwind CSS 3.4
- Lucide React (icons)
- React Hook Form + Zod

## Critical Rules

### 1. Server Components by Default
```typescript
// ✅ Default - Server Component
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// ❌ Only 'use client' when necessary
'use client'
export function InteractiveComponent() {
  const [state, setState] = useState()
}
```

**Use 'use client' ONLY when:**
- Using hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange)
- Browser APIs (window, localStorage)
- Real-time subscriptions

### 2. Tree-Shakeable Imports
```typescript
// ✅ CORRECT - ~5KB
import { Gift, Calendar, Users } from 'lucide-react'

// ❌ WRONG - 500KB+
import * as Icons from 'lucide-react'
```

### 3. Parallel Data Fetching
```typescript
// ❌ Sequential - 600ms+
const a = await fetch(url1)
const b = await fetch(url2)

// ✅ Parallel - 200ms
const [a, b] = await Promise.all([fetch(url1), fetch(url2)])
```

### 4. Lazy Load Modals
```typescript
import dynamic from 'next/dynamic'

const Modal = dynamic(() => import('@/components/modals/Modal'))

function Page() {
  const [show, setShow] = useState(false)
  return show && <Modal />
}
```

### 5. Next.js 16 Params
```typescript
// Route params are Promises in Next.js 16
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // ...
}
```

## Component Patterns

### Modal Pattern
```typescript
'use client'

import { Modal, Button, Alert } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Required')
})

export function CustomModal({ isOpen, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Title">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* fields */}
        {errors.name && <Alert variant="error">{errors.name.message}</Alert>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}
```

### Page Pattern (Server Component)
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [data1, data2] = await Promise.all([
    fetch(`/api/endpoint1?id=${id}`).then(r => r.json()),
    fetch(`/api/endpoint2?id=${id}`).then(r => r.json())
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <Component1 data={data1} />
      <Component2 data={data2} />
    </div>
  )
}
```

## Design System

Use components from `@/components/ui`:
- `Button` - primary, secondary, danger variants
- `Card` - sm, md, lg sizes
- `Badge` - gray, yellow, green, red, blue, purple
- `Alert` - success, error, warning, info
- `Input` - with label, error, hint
- `Modal` - with title and close
- `IconButton` - default, danger variants
- `EmptyState` - icon, title, description
- `Tabs` - tab navigation

See `.ai/design/system.md` for full documentation.

## File Structure
```
components/
├── ui/           # Design system components
├── modals/       # Lazy-loaded modals
├── cards/        # Display cards
├── groups/       # Group components
├── parties/      # Party components
├── proposals/    # Proposal components
├── gifts/        # Gift components
└── birthdays/    # Birthday components
```

## References
- [Design System](../design/system.md)
- [React Standards](../specs/coding-standards/react.md)
- [API Docs](../../docs/architecture/api-design.md)
