// components/auth/AccessGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { anonymousStorage } from '@/lib/storage'

interface AccessGuardProps {
  groupId: string
  children: React.ReactNode
}

/**
 * AccessGuard - Protege rutas de grupos
 *
 * Anonymous: Verifica localStorage (hasAccess)
 * Authenticated: Permite acceso (TODO: verificar en DB cuando tengamos RLS)
 */
export function AccessGuard({ groupId, children }: AccessGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (loading) return

      // Usuario autenticado - permitir acceso
      // TODO: Cuando implementemos RLS, verificar en database
      if (user) {
        setHasAccess(true)
        setChecking(false)
        return
      }

      // Usuario anónimo - verificar localStorage
      const hasLocalAccess = anonymousStorage.hasAccess(groupId)

      if (!hasLocalAccess) {
        // Sin acceso - redirigir a home
        router.push('/')
        return
      }

      setHasAccess(true)
      setChecking(false)
    }

    checkAccess()
  }, [user, loading, groupId, router])

  // Loading state
  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Sin acceso - redirigiendo
  if (!hasAccess) {
    return null
  }

  // Con acceso - mostrar contenido
  return <>{children}</>
}
