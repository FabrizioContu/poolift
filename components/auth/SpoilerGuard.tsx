// components/auth/SpoilerGuard.tsx
'use client'

import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { anonymousStorage } from '@/lib/storage'

interface SpoilerGuardProps {
  celebrantNames: string[]
  children: React.ReactNode
}

// Simple store for name state
let nameState = {
  promptedName: null as string | null,
  promptComplete: false,
}
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return nameState
}

function setNameState(updates: Partial<typeof nameState>) {
  nameState = { ...nameState, ...updates }
  listeners.forEach((cb) => cb())
}

/**
 * SpoilerGuard - Previene que celebrantes vean sus regalos
 *
 * Compara nombre del usuario con nombres de celebrantes
 * Si coincide, muestra mensaje de spoiler y bloquea acceso
 */
export function SpoilerGuard({ celebrantNames, children }: SpoilerGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const hasAskedRef = useRef(false)

  // Use external store for name state
  const { promptedName, promptComplete } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  )

  // Derive userName from auth or storage
  const authenticatedName = user?.user_metadata?.name as string | undefined
  const storedName =
    typeof window !== 'undefined' ? anonymousStorage.getUserName() : null

  // Effect only for prompting (external side effect - no setState)
  useEffect(() => {
    // Skip if we have a name from auth or storage
    if (authenticatedName || storedName) {
      setNameState({ promptComplete: true })
      return
    }

    // Skip if already asked
    if (hasAskedRef.current) {
      setNameState({ promptComplete: true })
      return
    }

    // Ask for name once
    hasAskedRef.current = true
    const name = window.prompt(
      '¿Cual es tu nombre?\n\n(Para prevenir que veas spoilers de tus propios regalos)'
    )

    if (name && name.trim()) {
      const trimmedName = name.trim()
      anonymousStorage.setUserName(trimmedName)
      setNameState({ promptedName: trimmedName, promptComplete: true })
    } else {
      setNameState({ promptComplete: true })
    }
  }, [authenticatedName, storedName])

  // Determine final userName
  const userName = authenticatedName || storedName || promptedName

  // Verificar si el usuario es celebrante
  const isCelebrant =
    userName &&
    celebrantNames.some((celebrantName) => {
      const userLower = userName.toLowerCase()
      const celebrantLower = celebrantName.toLowerCase()

      // Coincidencia si algún nombre contiene al otro
      return (
        userLower.includes(celebrantLower) ||
        celebrantLower.includes(userLower)
      )
    })

  const handleGoHome = useCallback(() => {
    router.push('/')
  }, [router])

  const handleNotMe = useCallback(() => {
    anonymousStorage.setUserName('')
    window.location.reload()
  }, [])

  // Esperando verificación de nombre
  if (!promptComplete && !authenticatedName && !storedName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  // Usuario es celebrante - mostrar pantalla de spoiler
  if (isCelebrant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md border border-gray-200">
          <Gift className="mx-auto text-yellow-500 mb-4" size={64} />

          <h2 className="text-3xl font-bold mb-3 text-gray-900">Sorpresa!</h2>

          <p className="text-lg text-gray-700 mb-4">
            Este es tu regalo de cumpleanos.
            <br />
            <strong>No mires para que sea sorpresa!</strong>
          </p>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              Detectamos que eres <strong>{userName}</strong>.
              <br />
              Espera al dia de tu fiesta para ver el regalo
            </p>
          </div>

          <Button
            onClick={handleGoHome}
            className="w-full mb-3"
          >
            Volver al Inicio
          </Button>

          <button onClick={handleNotMe} className="text-sm text-gray-700 hover:text-gray-700">
            No soy {userName}
          </button>
        </div>
      </div>
    )
  }

  // Usuario no es celebrante - mostrar contenido normal
  return <>{children}</>
}
