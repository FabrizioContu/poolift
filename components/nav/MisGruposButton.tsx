'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getGroupSessions, getDirectGiftSessions } from '@/lib/auth'

export function MisGruposButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get initial count
    const groups = getGroupSessions()
    const directGifts = getDirectGiftSessions()
    setCount(groups.length + directGifts.length)

    // Listen for storage changes (in case user opens multiple tabs)
    const handleStorage = () => {
      const groups = getGroupSessions()
      const directGifts = getDirectGiftSessions()
      setCount(groups.length + directGifts.length)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <Link href="/groups">
      <Button variant="secondary" className="px-4 py-2 relative">
        Mis Grupos
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
            {count}
          </span>
        )}
      </Button>
    </Link>
  )
}
