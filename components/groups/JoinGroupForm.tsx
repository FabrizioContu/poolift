'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, CheckCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui-custom/Button'
import { Alert } from '@/components/ui-custom/Alert'
import { addGroupToSession } from '@/lib/auth'
import { anonymousStorage } from '@/lib/storage'

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
  const [shareCode, setShareCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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

      // Track grupo para usuario anónimo
      anonymousStorage.addGroup(groupId)

      setShareCode(responseData.family.share_code ?? null)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al grupo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!shareCode) return
    try {
      await navigator.clipboard.writeText(shareCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (success) {
    return (
      <div className="bg-background rounded-lg border border-border p-8 text-center">
        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ¡Te has unido al grupo!
        </h2>

        {shareCode && (
          <div className="mt-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Guarda tu código de familia
            </p>
            <p className="text-xs text-amber-700 mb-3">
              Con este código puedes volver a acceder al grupo desde cualquier dispositivo sin necesidad de cuenta. Guárdalo antes de continuar.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <span className="font-mono font-bold text-lg tracking-widest text-amber-900">
                {shareCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-amber-200 transition text-amber-700"
                aria-label="Copiar código"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        <Button
          onClick={() => router.push(`/dashboard/${groupId}`)}
          className="w-full py-3 mt-2"
        >
          Entrar al grupo
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-lg border border-border p-8">
      <div className="text-center mb-6">
        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Únete a {groupName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Introduce el nombre de tu familia para unirte
        </p>
      </div>

      <div className="mb-6 bg-muted rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Poolift</span> ayuda a
          las familias a coordinar juntas el regalo de cumpleaños: quién
          participa y cuánto pone cada uno, sin confusiones.
        </p>
        <p className="mt-2">
          No necesitas crear una cuenta. Al unirte recibirás un código de
          familia que guarda tu acceso desde cualquier dispositivo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nombre de tu familia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('familyName')}
            placeholder="ej: Familia García"
            maxLength={50}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={isSubmitting}
          />
          {errors.familyName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.familyName.message}
            </p>
          )}
        </div>

        {error && <Alert variant="error">{error}</Alert>}

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
