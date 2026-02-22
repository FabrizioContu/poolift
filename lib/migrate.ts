'use client'

import { anonymousStorage } from '@/lib/storage'
import {
  getGroupSessions,
  getDirectGiftSessions,
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
 * Se llama después de login/signup exitoso.
 *
 * - Establece el nombre en user_metadata si el usuario no tiene uno
 * - NO limpia localStorage hasta Phase 4 (cuando familias estén vinculadas en DB)
 *   Si limpiamos ahora, al cerrar sesión el usuario pierde acceso a sus grupos
 *   porque AccessGuard/useIsCoordinator usan localStorage como fuente de verdad.
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

  // TODO: Phase 4 — vincular familias al user_id en la BD y limpiar localStorage
  // Requiere: ALTER TABLE families ADD COLUMN user_id UUID REFERENCES auth.users(id)
  // Para cada groupSession, actualizar family.user_id = userId
  // Una vez hecho, mover aquí: anonymousStorage.clear(), clearAllSessions()
}
