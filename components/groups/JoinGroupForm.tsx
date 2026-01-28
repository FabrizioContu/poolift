'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { addGroupToSession } from '@/lib/auth'

const schema = z.object({
  familyName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
})

type FormData = z.infer<typeof schema>

interface JoinGroupFormProps {
  groupId: string
  groupName: string
  inviteCode: string
}

export function JoinGroupForm({ groupId, groupName, inviteCode }: JoinGroupFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          familyName: data.familyName.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al unirse al grupo')
      }

      const responseData = await response.json()

      // Save session to localStorage
      addGroupToSession({
        groupId,
        groupName,
        familyId: responseData.family.id,
        familyName: responseData.family.name,
        isCreator: false,
        inviteCode,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/dashboard/${groupId}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al grupo')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Te has unido al grupo!
        </h2>
        <p className="text-gray-600">
          Redirigiendo al dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Únete a {groupName}
        </h1>
        <p className="text-gray-600 mt-2">
          Introduce el nombre de tu familia para unirte
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de tu familia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('familyName')}
            placeholder="ej: Familia García"
            maxLength={50}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.familyName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.familyName.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3"
        >
          {isSubmitting ? 'Uniéndose...' : 'Unirse al Grupo'}
        </Button>
      </form>
    </div>
  )
}
