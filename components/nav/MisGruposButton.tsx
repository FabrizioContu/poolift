'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getGroupSessions, getDirectGiftSessions } from '@/lib/auth'

function getInitialCount(): number {
  if (typeof window === 'undefined') return 0
  const groups = getGroupSessions()
  const directGifts = getDirectGiftSessions()
  return groups.length + directGifts.length
}

export function MisGruposButton() {
  const [count, setCount] = useState(getInitialCount)

  const updateCount = useCallback(() => {
    const groups = getGroupSessions()
    const directGifts = getDirectGiftSessions()
    setCount(groups.length + directGifts.length)
  }, [])

  useEffect(() => {
    // Listen for storage changes (in case user opens multiple tabs)
    window.addEventListener('storage', updateCount)
    return () => window.removeEventListener('storage', updateCount)
  }, [updateCount])

  return (
    <Link href="/groups" className="relative px-4 py-2 rounded-lg font-bold transition bg-gray-200 text-gray-800 hover:bg-gray-300">
      Mis Grupos
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
          {count}
        </span>
      )}
    </Link>
  )
}
