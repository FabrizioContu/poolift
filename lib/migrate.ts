'use client'

import { anonymousStorage } from '@/lib/storage'
import {
  getGroupSessions,
  getDirectGiftSessions,
  clearAllSessions,
  type GroupSession,
  type DirectGiftSession,
} from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

export interface MigrationData {
  groups: string[]
  userName: string | null
  familyId: string | null
  groupSessions: GroupSession[]
  directGiftSessions: DirectGiftSession[]
}

/**
 * Recopila datos anónimos del localStorage para migración.
 * Retorna null si no hay datos que migrar.
 */
export function collectMigrationData(): MigrationData | null {
  const anonData = anonymousStorage.getMigrationData()
  const groupSessions = getGroupSessions()
  const directGiftSessions = getDirectGiftSessions()

  const hasData =
    anonData.groups.length > 0 ||
    groupSessions.length > 0 ||
    directGiftSessions.length > 0

  if (!hasData) return null

  return {
    groups: anonData.groups,
    userName: anonData.userName,
    familyId: anonData.familyId,
    groupSessions,
    directGiftSessions,
  }
}

/**
 * Migra datos anónimos al usuario autenticado.
 * Se llama después de login/signup exitoso y en auth/complete (OAuth).
 *
 * - Establece el nombre en user_metadata si el usuario no tiene uno
 * - Vincula familias anónimas al user_id en la BD
 * - Limpia localStorage una vez vinculado (directGiftSessions se mantienen)
 *
 * Seguro de llamar múltiples veces — verifica si hay datos antes de actuar.
 */
export async function migrateAnonData(): Promise<void> {
  const data = collectMigrationData()
  if (!data) return

  const supabase = createClient()

  // Si el usuario anónimo tenía nombre, asignarlo al perfil autenticado
  if (data.userName) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && !user.user_metadata?.name) {
        await supabase.auth.updateUser({
          data: { name: data.userName },
        })
      }
    } catch (e) {
      console.error('migrate: error updating user metadata', e)
    }
  }

  // Vincular familias al user_id en la BD
  const familyIds = data.groupSessions
    .map((s) => s.familyId)
    .filter((id): id is string => Boolean(id))

  if (familyIds.length > 0) {
    try {
      const response = await fetch('/api/families/link', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyIds }),
      })

      if (!response.ok) {
        console.error('migrate: link endpoint returned', response.status)
        // Non-blocking — localStorage fallback still works in AccessGuard
        return
      }
    } catch (e) {
      console.error('migrate: error linking families', e)
      // Non-blocking — localStorage fallback still works in AccessGuard
      return
    }
  }

  // Limpiar localStorage ahora que las familias están vinculadas en BD
  // directGiftSessions se mantienen — no hay vinculación a DB para regalos directos aún
  anonymousStorage.clear()
  clearAllSessions()
}
