# Component Creation Prompt

Use this template when creating new components.

## Server Component (Default)

```typescript
// No 'use client' needed

import { supabase } from '@/lib/supabase'
import type { DataType } from '@/lib/types'

interface ComponentProps {
  data: DataType
  className?: string
}

export function ComponentName({ data, className = '' }: ComponentProps) {
  return (
    <div className={`base-classes ${className}`}>
      {/* Content */}
    </div>
  )
}
```

## Client Component

```typescript
'use client'

import { useState } from 'react'
import { Button, Card } from '@/components/ui'
import { Gift } from 'lucide-react'

interface ComponentProps {
  data: DataType
  onAction: () => void
}

export function ComponentName({ data, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onAction()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Gift size={20} />
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </Card>
  )
}
```

## Modal Component

```typescript
'use client'

import { useState } from 'react'
import { Modal, Button, Input, Alert } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres')
})

type FormData = z.infer<typeof schema>

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CustomModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Error')
      }

      reset()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Title">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          required
          {...register('name')}
          error={errors.name?.message}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CustomModal
```

## Page Component

```typescript
// app/route/page.tsx
// No 'use client' - Server Component

import { supabase } from '@/lib/supabase'
import { ComponentName } from '@/components/ComponentName'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  // Parallel data fetching
  const [data1, data2] = await Promise.all([
    supabase.from('table1').select('*').eq('id', id),
    supabase.from('table2').select('*').eq('id', id)
  ])

  if (data1.error || !data1.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Error loading data</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Title</h1>
      <ComponentName data={data1.data} />
    </div>
  )
}
```
