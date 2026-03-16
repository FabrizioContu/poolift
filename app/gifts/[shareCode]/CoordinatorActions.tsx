'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Alert } from '@/components/ui/Alert'
import { CloseParticipationButton } from '@/components/gifts/CloseParticipationButton'
import { ShoppingCart, Settings, Users } from 'lucide-react'
import Link from 'next/link'

interface CoordinatorActionsProps {
  giftId: string
  shareCode: string
  giftName: string
  celebrantNames: string[]
  coordinatorId: string | null
  groupId: string | null
  participationOpen: boolean
  isPurchased: boolean
  participantCount: number
  participantNames: string[]
  totalPrice: number
}

function checkIsCoordinator(giftId: string, coordinatorId: string | null, groupId: string | null): boolean {
  if (typeof window === 'undefined') return false
  if (!coordinatorId || !groupId) return false

  // Check if user's family in the group matches the coordinator
  const sessions = localStorage.getItem('poolift_groups')
  if (sessions) {
    const groupSessions = JSON.parse(sessions)
    const session = groupSessions.find(
      (s: { groupId: string; familyId: string }) => s.groupId === groupId
    )
    if (session && session.familyId === coordinatorId) {
      return true
    }
  }

  return false
}

function useIsCoordinator(giftId: string, coordinatorId: string | null, groupId: string | null): boolean {
  const [isCoordinator, setIsCoordinator] = useState(false)

  useEffect(() => {
    setIsCoordinator(checkIsCoordinator(giftId, coordinatorId, groupId))
  }, [giftId, coordinatorId, groupId])

  return isCoordinator
}

export function CoordinatorActions({
  giftId,
  shareCode,
  giftName,
  celebrantNames,
  coordinatorId,
  groupId,
  participationOpen,
  isPurchased,
  participantCount,
  participantNames,
  totalPrice
}: CoordinatorActionsProps) {
  const isCoordinator = useIsCoordinator(giftId, coordinatorId, groupId)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [mergeLoading, setMergeLoading] = useState(false)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const [mergeKeep, setMergeKeep] = useState('')
  const [mergeRemove, setMergeRemove] = useState('')

  const handleMerge = async () => {
    if (!mergeKeep || !mergeRemove || mergeKeep === mergeRemove) return

    setMergeLoading(true)
    setMergeError(null)

    try {
      const response = await fetch(`/api/gifts/${giftId}/participants/merge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep: mergeKeep, remove: mergeRemove }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMergeError(data.error || 'Error al fusionar')
        return
      }

      setShowMergeModal(false)
      window.location.reload()
    } catch {
      setMergeError('Error al fusionar participantes')
    } finally {
      setMergeLoading(false)
    }
  }

  if (!isCoordinator) {
    return null
  }

  if (isPurchased) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-emerald-700 mb-2">
          <Settings size={20} />
          <span className="font-semibold">Panel de Coordinador</span>
        </div>
        <p className="text-emerald-600 text-sm">
          El regalo ha sido comprado y finalizado.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-bondi-blue-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-bondi-blue-700 mb-4">
          <Settings size={20} />
          <span className="font-semibold">Panel de Coordinador</span>
        </div>

        <div className="space-y-3">
          {participationOpen ? (
            <CloseParticipationButton
              giftId={giftId}
              shareCode={shareCode}
              giftName={giftName}
              celebrantNames={celebrantNames}
              participantCount={participantCount}
              participantNames={participantNames}
              totalPrice={totalPrice}
            />
          ) : (
            <Link href={`/coordinator/${giftId}/purchase`}>
              <Button className="w-full">
                <ShoppingCart size={18} className="mr-2" />
                Finalizar Compra
              </Button>
            </Link>
          )}

          {!participationOpen && (
            <p className="text-sm text-gray-700 text-center">
              Participación cerrada. Procede a finalizar la compra.
            </p>
          )}

          {/* Merge Button - only when open and 2+ participants */}
          {participationOpen && participantCount >= 2 && (
            <Button
              onClick={() => {
                setMergeKeep(participantNames[0] || '')
                setMergeRemove(participantNames[1] || '')
                setMergeError(null)
                setShowMergeModal(true)
              }}
              variant="secondary"
              className="w-full"
            >
              <Users size={18} className="mr-2" />
              Fusionar participantes duplicados
            </Button>
          )}
        </div>
      </div>

      {/* Merge Participants Modal */}
      {showMergeModal && (
        <Modal
          isOpen={showMergeModal}
          onClose={() => setShowMergeModal(false)}
          title="Fusionar participantes duplicados"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Selecciona la familia a mantener y el duplicado a eliminar.
              Esta acción no se puede deshacer.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mantener
              </label>
              <select
                value={mergeKeep}
                onChange={(e) => setMergeKeep(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bondi-blue-400 focus:border-transparent"
              >
                {participantNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eliminar (duplicado)
              </label>
              <select
                value={mergeRemove}
                onChange={(e) => setMergeRemove(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bondi-blue-400 focus:border-transparent"
              >
                {participantNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {mergeKeep === mergeRemove && (
              <p className="text-sm text-tropical-teal-500">
                Selecciona dos participantes distintos
              </p>
            )}

            {mergeError && <Alert variant="error">{mergeError}</Alert>}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowMergeModal(false)}
                variant="secondary"
                className="flex-1"
                disabled={mergeLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleMerge}
                disabled={mergeLoading || !mergeKeep || !mergeRemove || mergeKeep === mergeRemove}
                className="flex-1 bg-bondi-blue-500 hover:bg-bondi-blue-600"
              >
                {mergeLoading ? 'Fusionando...' : 'Fusionar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
