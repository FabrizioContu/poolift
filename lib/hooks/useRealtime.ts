'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtime(
  table: string,
  filter: { column: string; value: string },
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload) => onInsert?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload) => onUpdate?.(payload.new)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload) => onDelete?.(payload.old)
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter.column, filter.value, onInsert, onUpdate, onDelete])
}
