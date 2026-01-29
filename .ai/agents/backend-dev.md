# Backend Developer Agent - Poolift

## Role
API routes, database operations, business logic, and server-side processing.

## Tech Stack
- Next.js 16 API Routes (App Router)
- Supabase (PostgreSQL)
- TypeScript 5 (strict)
- Zod (validation)

## API Route Pattern

### Basic Structure
```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate with Zod
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('table')
    .insert(result.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

### Dynamic Routes
```typescript
// app/api/resource/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validation before delete
  const canDelete = await validateDelete(id)
  if (!canDelete.allowed) {
    return NextResponse.json(
      { error: canDelete.reason },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('table')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

## Supabase Patterns

### Select with Relations
```typescript
const { data } = await supabase
  .from('parties')
  .select(`
    *,
    coordinator:families!parties_coordinator_id_fkey(id, name),
    party_celebrants(
      birthday_id,
      birthdays(id, child_name, birth_date)
    )
  `)
  .eq('group_id', groupId)
  .order('party_date', { ascending: true })
```

### Upsert
```typescript
const { data } = await supabase
  .from('table')
  .upsert({ id, ...fields })
  .select()
  .single()
```

### Transaction-like Operations
```typescript
// Create party with celebrants
const { data: party, error: partyError } = await supabase
  .from('parties')
  .insert({ group_id, party_date, coordinator_id })
  .select()
  .single()

if (partyError) throw partyError

const celebrants = celebrantIds.map(id => ({
  party_id: party.id,
  birthday_id: id
}))

const { error: celebrantsError } = await supabase
  .from('party_celebrants')
  .insert(celebrants)

if (celebrantsError) {
  // Rollback - delete party
  await supabase.from('parties').delete().eq('id', party.id)
  throw celebrantsError
}
```

## Validation

### With Zod
```typescript
import { z } from 'zod'

const createPartySchema = z.object({
  groupId: z.string().uuid(),
  partyDate: z.string().refine(d => new Date(d) >= new Date(), {
    message: 'Date cannot be in the past'
  }),
  celebrantIds: z.array(z.string().uuid()).min(1, 'At least one celebrant'),
  coordinatorId: z.string().uuid().optional()
})

// Usage
const result = createPartySchema.safeParse(body)
if (!result.success) {
  return NextResponse.json(
    { error: result.error.issues[0].message },
    { status: 400 }
  )
}
```

### Delete Validation
```typescript
// lib/validators.ts
export async function canDeleteBirthday(id: string) {
  // Check if birthday is celebrant in any party
  const { data: parties } = await supabase
    .from('party_celebrants')
    .select('party_id')
    .eq('birthday_id', id)

  if (parties?.length) {
    return { allowed: false, reason: 'Birthday is celebrant in a party' }
  }

  // Check if birthday has ideas
  const { data: ideas } = await supabase
    .from('ideas')
    .select('id')
    .eq('birthday_id', id)

  if (ideas?.length) {
    return { allowed: false, reason: 'Birthday has ideas' }
  }

  return { allowed: true }
}
```

## Error Handling

```typescript
try {
  // Database operation
} catch (error) {
  console.error('API Error:', error)

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.issues[0].message },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## File Structure
```
app/api/
├── groups/
│   ├── route.ts           # GET, POST
│   └── [id]/route.ts      # GET, DELETE
├── families/route.ts      # GET, POST
├── birthdays/
│   ├── route.ts           # GET, POST
│   └── [id]/route.ts      # DELETE
├── parties/
│   ├── route.ts           # GET, POST
│   ├── [id]/route.ts      # GET, DELETE
│   └── celebrants/route.ts
├── ideas/
│   ├── route.ts           # GET, POST
│   └── [id]/route.ts      # DELETE
├── proposals/
│   ├── route.ts           # GET, POST
│   ├── [id]/
│   │   ├── route.ts       # GET, DELETE
│   │   ├── vote/route.ts  # POST
│   │   └── select/route.ts # PUT
└── gifts/
    ├── route.ts           # POST
    └── [id]/
        ├── route.ts       # GET
        ├── participate/route.ts # POST
        ├── close/route.ts # PUT
        └── finalize/route.ts # PUT
```

## References
- [API Design](../../docs/architecture/api-design.md)
- [Data Model](../../docs/architecture/data-model.md)
