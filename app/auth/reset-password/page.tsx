'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Mail } from 'lucide-react'

const schema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email no válido'),
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
      }
    )
    if (resetError) {
      setError('Error al enviar el email. Inténtalo de nuevo.')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Mail size={32} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Revisa tu email</h1>
            <p className="text-gray-600 text-sm">
              Si existe una cuenta con ese email, recibirás un enlace para
              restablecer tu contraseña.
            </p>
            <Link
              href="/"
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">
                Restablecer contraseña
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Introduce tu email y te enviaremos un enlace para crear una
                nueva contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                placeholder="tu@email.com"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register('email')}
              />

              {error && <Alert variant="error">{error}</Alert>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              ¿Recuerdas tu contraseña?{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                Volver al inicio
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
