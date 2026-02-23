// components/auth/AccessGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { anonymousStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'

interface AccessGuardProps {
  groupId: string
  children: React.ReactNode
}

/**
 * AccessGuard - Protege rutas de grupos
 *
 * Authenticated: verifica en BD que el user_id tenga una familia en el grupo.
 *   Fallback a localStorage para familias creadas antes de Phase 5
 *   o si la migración aún no ha corrido.
 * Anonymous: Verifica localStorage (hasAccess)
 */
export function AccessGuard({ groupId, children }: AccessGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (loading) return

      if (user) {
        // Check DB: does this user have a linked family in this group?
        try {
          const supabase = createClient()
          const { data: family } = await supabase
            .from('families')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .maybeSingle()

          if (family) {
            setHasAccess(true)
            setChecking(false)
            return
          }
        } catch {
          // DB check failed — fall through to localStorage fallback
        }

        // Fallback: localStorage (pre-Phase5 families or failed migration)
        if (anonymousStorage.hasAccess(groupId)) {
          setHasAccess(true)
          setChecking(false)
          return
        }

        router.push('/')
        return
      }

      // Anonymous user — check localStorage
      if (!anonymousStorage.hasAccess(groupId)) {
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

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
