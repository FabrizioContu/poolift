# Code Patterns - Poolift

Quick reference for common patterns used in the project.

## Component Patterns

### Server Component (Default)
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await fetchData(id)
  return <Component data={data} />
}
```

### Client Component
```typescript
'use client'
import { useState } from 'react'

export function Interactive() {
  const [state, setState] = useState(false)
  return <button onClick={() => setState(!state)}>Toggle</button>
}
```

### Modal with Form
```typescript
'use client'
import { Modal, Button, Input, Alert } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function FormModal({ isOpen, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Title">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Field" {...register('field')} error={errors.field?.message} />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}
```

## Data Fetching

### Parallel Fetching
```typescript
const [parties, birthdays, families] = await Promise.all([
  supabase.from('parties').select('*').eq('group_id', id),
  supabase.from('birthdays').select('*').eq('group_id', id),
  supabase.from('families').select('*').eq('group_id', id)
])
```

### With Relations
```typescript
const { data } = await supabase
  .from('parties')
  .select(`
    *,
    coordinator:families!parties_coordinator_id_fkey(id, name),
    party_celebrants(
      birthdays(id, child_name)
    )
  `)
  .eq('group_id', groupId)
```

## API Patterns

### GET Handler
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
```

### POST Handler
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('table')
    .insert(result.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

### Dynamic Route Handler
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabase.from('table').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

## UI Patterns

### Card with Actions
```typescript
<Card size="md" hover>
  <div className="flex items-start justify-between">
    <div className="flex-1">{/* Content */}</div>
    <div className="flex items-center gap-2">
      <Badge variant="yellow">Status</Badge>
      <IconButton icon={Trash2} variant="danger" label="Delete" />
    </div>
  </div>
</Card>
```

### Empty State
```typescript
<EmptyState
  icon={Gift}
  title="No items yet"
  description="Add your first item"
  action={<Button>Add Item</Button>}
/>
```

### Form with Validation
```typescript
<form className="space-y-4">
  <Input label="Name" required error={errors.name?.message} />
  {error && <Alert variant="error">{error}</Alert>}
  {success && <Alert variant="success">Saved!</Alert>}
  <div className="flex gap-3">
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

## Validation Patterns

### Zod Schema
```typescript
const schema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  date: z.string().refine(d => new Date(d) >= new Date(), 'Cannot be past'),
  items: z.array(z.object({
    name: z.string(),
    price: z.number().positive()
  })).min(1, 'At least one item')
})
```

### Delete Validation
```typescript
async function canDelete(id: string) {
  const { data: related } = await supabase
    .from('related_table')
    .select('id')
    .eq('foreign_id', id)

  if (related?.length) {
    return { allowed: false, reason: 'Has related records' }
  }
  return { allowed: true }
}
```

## Testing Patterns

### Component Test
```typescript
describe('Component', () => {
  it('renders correctly', () => {
    render(<Component {...props} />)
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })

  it('handles click', async () => {
    const user = userEvent.setup()
    render(<Component onClick={mockFn} />)
    await user.click(screen.getByRole('button'))
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### API Mock
```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: mockData })
})
```
