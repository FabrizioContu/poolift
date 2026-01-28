'use client'

import { useState, useEffect } from 'react'
import type { Party } from '@/lib/types'

export function useParties(groupId: string) {
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchParties() {
      try {
        const response = await fetch(`/api/parties?groupId=${groupId}`)
        const data = await response.json()
        
        if (data.error) throw new Error(data.error)
        
        setParties(data.parties || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar fiestas')
      } finally {
        setLoading(false)
      }
    }
    
    fetchParties()
  }, [groupId])
  
  return { parties, loading, error }
}
