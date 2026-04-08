// components/auth/AccessGuard.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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
 *
 * Una vez que se concede acceso (grantedKey === currentKey), no se vuelve
 * a redirigir aunque cambien auth events (TOKEN_REFRESHED, USER_UPDATED).
 * Esto evita falsos redirects durante la migración anon→auth.
 */
export function AccessGuard({ groupId, children }: AccessGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [checking, setChecking] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  // Tracks the (userId|'anon'):groupId key for which access was granted.
  // Prevents re-checking (and false redirects) on auth events like
  // TOKEN_REFRESHED or USER_UPDATED that fire during/after migration.
  const grantedKey = useRef<string>('')

  useEffect(() => {
    async function checkAccess() {
      if (loading) return

      const currentKey = `${user?.id ?? 'anon'}:${groupId}`

      // Already granted for this user+group — skip re-check.
      if (grantedKey.current === currentKey) return

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
            grantedKey.current = currentKey
            setHasAccess(true)
            setChecking(false)
            return
          }
        } catch {
          // DB check failed — fall through to localStorage fallback
        }

        // Fallback: localStorage (pre-Phase5 families or failed migration)
        if (anonymousStorage.hasAccess(groupId)) {
          grantedKey.current = currentKey
          setHasAccess(true)
          setChecking(false)
          return
        }

        // Authenticated user with no DB link and no localStorage —
        // show explicit "no access" UI instead of silently redirecting.
        setAccessDenied(true)
        setChecking(false)
        return
      }

      // Anonymous user — check localStorage
      if (!anonymousStorage.hasAccess(groupId)) {
        router.push('/')
        return
      }

      grantedKey.current = currentKey
      setHasAccess(true)
      setChecking(false)
    }

    checkAccess()
  }, [user, loading, groupId, router])

  // Loading state
  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center max-w-sm px-4">
          <p className="text-foreground font-semibold mb-2">Sin acceso a este grupo</p>
          <p className="text-muted-foreground text-sm mb-6">
            No encontramos tu familia vinculada a este grupo.
          </p>
          <Link
            href="/groups"
            className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Volver a mis grupos
          </Link>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
