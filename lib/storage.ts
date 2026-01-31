// lib/storage.ts
'use client'

const STORAGE_KEYS = {
  MY_GROUPS: 'poolift_my_groups',
  USER_NAME: 'poolift_user_name',
  FAMILY_ID: 'poolift_family_id',
} as const

/**
 * Helper para gestionar datos de usuarios anónimos en localStorage
 * Usado cuando el usuario no tiene cuenta creada
 */
export const anonymousStorage = {
  /**
   * Obtener lista de grupos del usuario anónimo
   */
  getMyGroups(): string[] {
    if (typeof window === 'undefined') return []
    try {
      const groups = localStorage.getItem(STORAGE_KEYS.MY_GROUPS)
      return groups ? JSON.parse(groups) : []
    } catch {
      return []
    }
  },

  /**
   * Añadir grupo a la lista del usuario
   */
  addGroup(groupId: string) {
    if (typeof window === 'undefined') return
    const groups = this.getMyGroups()
    if (!groups.includes(groupId)) {
      groups.push(groupId)
      localStorage.setItem(STORAGE_KEYS.MY_GROUPS, JSON.stringify(groups))
    }
  },

  /**
   * Eliminar grupo de la lista
   */
  removeGroup(groupId: string) {
    if (typeof window === 'undefined') return
    const groups = this.getMyGroups().filter((id) => id !== groupId)
    localStorage.setItem(STORAGE_KEYS.MY_GROUPS, JSON.stringify(groups))
  },

  /**
   * Verificar si el usuario tiene acceso a un grupo
   */
  hasAccess(groupId: string): boolean {
    return this.getMyGroups().includes(groupId)
  },

  /**
   * Obtener nombre del usuario (para prevención de spoilers)
   */
  getUserName(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.USER_NAME)
  },

  /**
   * Guardar nombre del usuario
   */
  setUserName(name: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name)
  },

  /**
   * Obtener ID de familia del usuario anónimo
   */
  getFamilyId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.FAMILY_ID)
  },

  /**
   * Guardar ID de familia
   */
  setFamilyId(familyId: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.FAMILY_ID, familyId)
  },

  /**
   * Limpiar todos los datos anónimos
   * Usado cuando el usuario crea cuenta y migra datos
   */
  clear() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.MY_GROUPS)
    localStorage.removeItem(STORAGE_KEYS.USER_NAME)
    localStorage.removeItem(STORAGE_KEYS.FAMILY_ID)
  },

  /**
   * Obtener datos para migración a cuenta autenticada
   */
  getMigrationData() {
    return {
      groups: this.getMyGroups(),
      userName: this.getUserName(),
      familyId: this.getFamilyId(),
    }
  },
}
