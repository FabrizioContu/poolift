# React Coding Standards - Poolift

Based on [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)

## Priority Levels

| Priority | Optimization | Impact |
|----------|--------------|--------|
| 🔴 Critical | Eliminate Waterfalls | -400-600ms |
| 🔴 Critical | Bundle Size | -495KB |
| 🟡 High | Server Components | -50KB JS |
| 🟢 Medium | Re-render Optimization | Less jank |
| 🔵 Medium | Lazy Loading | -100KB |

## 1. Eliminate Waterfalls (CRITICAL)

```typescript
// ❌ WRONG - Sequential (600ms+)
const birthday = await fetch(`/api/birthdays/${id}`)
const proposals = await fetch(`/api/proposals?id=${id}`)
const votes = await fetch(`/api/votes?id=${id}`)

// ✅ CORRECT - Parallel (200ms)
const [birthday, proposals, votes] = await Promise.all([
  fetch(`/api/birthdays/${id}`),
  fetch(`/api/proposals?id=${id}`),
  fetch(`/api/votes?id=${id}`)
])
```

## 2. Bundle Size (CRITICAL)

```typescript
// ❌ WRONG - 500KB+
import * as LucideIcons from 'lucide-react'

// ✅ CORRECT - ~5KB
import { Gift, Calendar, Users } from 'lucide-react'
```

**For Poolift icons:**
```typescript
// ✅ ALWAYS import specific icons
import {
  Gift, Calendar, Users, ThumbsUp,
  ShoppingCart, Check, X, Trash2,
  ExternalLink, Copy, Lock, AlertTriangle
} from 'lucide-react'
```

## 3. Server Components (HIGH)

```typescript
// ✅ Default - Server Component
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// ❌ Client Component (only when needed)
'use client'
export function Interactive() {
  const [state, setState] = useState()
}
```

**Use 'use client' ONLY when:**
- useState, useEffect, useContext
- Event handlers (onClick, onChange)
- Browser APIs (window, localStorage)
- Real-time subscriptions

## 4. Data Fetching (MEDIUM-HIGH)

```typescript
// ❌ WRONG - Fetch in useEffect
'use client'
function List() {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  return <div>{data.map(...)}</div>
}

// ✅ CORRECT - Server Component
async function List() {
  const { data } = await supabase.from('table').select('*')
  return <div>{data.map(...)}</div>
}
```

## 5. Re-render Optimization (MEDIUM)

### useMemo for Expensive Calculations
```typescript
// ❌ Runs on EVERY render
const sorted = items.sort((a, b) => a.name.localeCompare(b.name))

// ✅ Only when items change
const sorted = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

### useCallback for Functions
```typescript
// ✅ Stable reference
const handleClick = useCallback(() => {
  setCount(c => c + 1)
}, [])
```

## 6. Lazy Loading (MEDIUM)

```typescript
import dynamic from 'next/dynamic'

// ✅ Load only when needed
const CreateModal = dynamic(() =>
  import('@/components/modals/CreateModal')
)

function Page() {
  const [show, setShow] = useState(false)
  return show && <CreateModal />
}
```

## 7. React.cache() for Deduplication

```typescript
import { cache } from 'react'

const getUser = cache(async (id: string) => {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data
})

// Called 3 times but only executes once
const user1 = await getUser(id)  // Database query
const user2 = await getUser(id)  // Cache hit
const user3 = await getUser(id)  // Cache hit
```

## Anti-Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| Sequential awaits | 600ms+ latency | Promise.all |
| `import * from` | Large bundles | Named imports |
| 'use client' everywhere | More JS shipped | Server Components |
| fetch in useEffect | Extra round-trip | Server fetch |
| Re-render on every change | Jank | useMemo/useCallback |

## Checklist

Before completing any component:
- [ ] No request waterfalls (Promise.all used)
- [ ] Icons imported individually
- [ ] Server Component unless interactivity needed
- [ ] No fetch in useEffect (use Server Component)
- [ ] Modals lazy loaded
- [ ] useMemo for expensive calculations
- [ ] useCallback for functions passed as props

## Expected Impact

| Optimization | Savings |
|-------------|---------|
| Eliminate waterfalls | -400-600ms |
| Tree-shake lucide | -495KB |
| Server Components | -50KB JS |
| Lazy modals | -100KB |

**Total:** ~1MB less JavaScript + 500ms faster
