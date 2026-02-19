'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { migrateAnonData } from '@/lib/migrate'

function AuthCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const migrated = useRef(false)

  useEffect(() => {
    if (migrated.current) return
    migrated.current = true

    const next = searchParams.get('next') || '/'

    migrateAnonData()
      .catch((e) => console.error('Migration error:', e))
      .finally(() => {
        router.replace(next)
      })
  }, [router, searchParams])

  return (
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-gray-600 text-sm">Preparando tu cuenta...</p>
    </div>
  )
}

export default function AuthCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense
        fallback={
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 text-sm">Preparando tu cuenta...</p>
          </div>
        }
      >
        <AuthCompleteContent />
      </Suspense>
    </div>
  )
}
