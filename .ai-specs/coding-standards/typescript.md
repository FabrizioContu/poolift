# TypeScript Coding Standards - Poolift

## Configuration

TypeScript is configured in strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Types vs Interfaces

**Use interfaces for objects:**
```typescript
interface User {
  id: string
  name: string
  email: string
}
```

**Use types for unions/aliases:**
```typescript
type Status = 'pending' | 'active' | 'completed'
type ButtonVariant = 'primary' | 'secondary' | 'danger'
```

## Component Props

```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  className = ''
}: ButtonProps) {
  // ...
}
```

## API Types

```typescript
// Request types
interface CreatePartyRequest {
  groupId: string
  partyDate: string
  celebrantIds: string[]
  coordinatorId?: string
}

// Response types
interface ApiResponse<T> {
  data?: T
  error?: string
}

interface Party {
  id: string
  group_id: string
  party_date: string
  coordinator: Family | null
  party_celebrants: PartyCelebrant[]
}
```

## Generics

```typescript
// Generic API response handler
async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Fetch failed')
  return response.json()
}

// Usage
const party = await fetchApi<Party>('/api/parties/123')
```

## Avoid `any`

```typescript
// ❌ WRONG
const handleClick = (e: any) => {}

// ✅ CORRECT
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}

// ❌ WRONG
const data: any = await fetch('/api')

// ✅ CORRECT
const data: ApiResponse<Party> = await fetch('/api').then(r => r.json())
```

## Null Handling

```typescript
// Optional chaining
const name = user?.profile?.name

// Nullish coalescing
const displayName = name ?? 'Anonymous'

// Type narrowing
if (user) {
  // user is not null here
  console.log(user.name)
}
```

## Event Types

```typescript
// Click events
onClick: (e: React.MouseEvent<HTMLButtonElement>) => void

// Change events
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

// Form events
onSubmit: (e: React.FormEvent<HTMLFormElement>) => void

// Keyboard events
onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
```

## Component Types

```typescript
// Function component
const Button: React.FC<ButtonProps> = ({ children }) => (
  <button>{children}</button>
)

// Or without FC (preferred)
function Button({ children }: ButtonProps) {
  return <button>{children}</button>
}

// With children
interface LayoutProps {
  children: React.ReactNode
}
```

## Async Component Types (Next.js 16)

```typescript
// Page props with async params
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  // ...
}
```

## Utility Types

```typescript
// Partial - all props optional
type PartialUser = Partial<User>

// Pick - select specific props
type UserBasic = Pick<User, 'id' | 'name'>

// Omit - exclude props
type UserWithoutId = Omit<User, 'id'>

// Record - typed object
type StatusColors = Record<Status, string>
```

## Type Guards

```typescript
function isParty(obj: unknown): obj is Party {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'party_date' in obj &&
    'coordinator' in obj
  )
}

// Usage
if (isParty(data)) {
  // data is Party here
  console.log(data.party_date)
}
```

## Enums vs Unions

**Prefer unions over enums:**
```typescript
// ❌ Enum (generates extra code)
enum Status {
  Pending = 'pending',
  Active = 'active'
}

// ✅ Union (zero runtime cost)
type Status = 'pending' | 'active' | 'completed'
```

## Import Types

```typescript
// Import types separately
import type { Party, Birthday, Family } from '@/lib/types'

// Or inline
import { formatDate, type Party } from '@/lib/utils'
```

## Checklist

- [ ] No `any` types
- [ ] Interfaces for objects, types for unions
- [ ] Props interface for every component
- [ ] API responses properly typed
- [ ] Null handling with optional chaining
- [ ] Event handlers properly typed
- [ ] No @ts-ignore without comment
