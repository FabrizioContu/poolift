'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function JoinPage() {
  const router = useRouter()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedCode = inviteCode.trim().toLowerCase()

    if (!trimmedCode) {
      setError('El código de invitación es requerido')
      return
    }

    if (trimmedCode.length < 6 || trimmedCode.length > 12) {
      setError('El código debe tener entre 6 y 12 caracteres')
      return
    }

    if (!/^[a-z0-9]+$/.test(trimmedCode)) {
      setError('El código solo puede contener letras y números')
      return
    }

    router.push(`/join/${trimmedCode}`)
  }

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Unirse a Grupo</h1>
            <p className="text-gray-700 mt-2">
              Introduce el código que te han compartido
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">
                Código de invitación <span className="text-red-500">*</span>
              </label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                placeholder="ej: abc123xyz"
                maxLength={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                autoComplete="off"
              />
            </div>

            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3">
              Continuar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-700 mt-6">
            ¿No tienes código?{' '}
            <Link href="/create-group" className="text-blue-500 hover:underline">
              Crear un grupo nuevo
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
