// lib/auth.ts
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'

// ============================================
// SUPABASE AUTH (NEW)
// ============================================

/**
 * Hook para obtener el usuario actual autenticado
 * Retorna { user, loading }
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}

/**
 * Registrar nuevo usuario
 */
export async function signUp(email: string, password: string, name?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: name ? { name } : undefined,
    },
  })
  return { data, error }
}

/**
 * Iniciar sesión con email/password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Hook completo de autenticación
 * Retorna { user, loading, isAuthenticated, isAnonymous, signUp, signIn, signOut }
 */
export function useAuth() {
  const { user, loading } = useUser()

  const handleSignUp = useCallback(
    async (email: string, password: string, name?: string) => {
      return signUp(email, password, name)
    },
    []
  )

  const handleSignIn = useCallback(async (email: string, password: string) => {
    return signIn(email, password)
  }, [])

  const handleSignOut = useCallback(async () => {
    return signOut()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAnonymous: !user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  }
}

// ============================================
// GROUP SESSIONS (EXISTING - for family-based system)
// ============================================

export interface GroupSession {
  groupId: string
  groupName: string
  familyId: string
  familyName: string
  isCreator: boolean
  inviteCode: string
  joinedAt: string
}

const STORAGE_KEY = 'poolift_groups'

export function getGroupSessions(): GroupSession[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addGroupToSession(
  session: Omit<GroupSession, 'joinedAt'>
): void {
  if (typeof window === 'undefined') return

  const sessions = getGroupSessions()

  // Check if already exists
  const exists = sessions.some((s) => s.groupId === session.groupId)
  if (exists) {
    // Update existing
    const updated = sessions.map((s) =>
      s.groupId === session.groupId ? { ...session, joinedAt: s.joinedAt } : s
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return
  }

  // Add new
  sessions.push({
    ...session,
    joinedAt: new Date().toISOString(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function removeGroupSession(groupId: string): void {
  if (typeof window === 'undefined') return

  const sessions = getGroupSessions()
  const filtered = sessions.filter((s) => s.groupId !== groupId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function getGroupSession(groupId: string): GroupSession | null {
  const sessions = getGroupSessions()
  return sessions.find((s) => s.groupId === groupId) || null
}

export function clearAllSessions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ============================================
// DIRECT GIFT SESSIONS
// ============================================

export interface DirectGiftSession {
  shareCode: string
  recipientName: string
  occasion: string
  giftIdea?: string
  organizerName: string
  createdAt: string
}

const DIRECT_GIFTS_KEY = 'poolift_direct_gifts'

export function getDirectGiftSessions(): DirectGiftSession[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(DIRECT_GIFTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addDirectGiftSession(
  session: Omit<DirectGiftSession, 'createdAt'>
): void {
  if (typeof window === 'undefined') return

  const sessions = getDirectGiftSessions()

  // Check if already exists
  const exists = sessions.some((s) => s.shareCode === session.shareCode)
  if (exists) return

  // Add new
  sessions.push({
    ...session,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem(DIRECT_GIFTS_KEY, JSON.stringify(sessions))
}

export function removeDirectGiftSession(shareCode: string): void {
  if (typeof window === 'undefined') return

  const sessions = getDirectGiftSessions()
  const filtered = sessions.filter((s) => s.shareCode !== shareCode)
  localStorage.setItem(DIRECT_GIFTS_KEY, JSON.stringify(filtered))
}
