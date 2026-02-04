'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { CloseParticipationButton } from '@/components/gifts/CloseParticipationButton'
import { ShoppingCart, Settings } from 'lucide-react'
import Link from 'next/link'

interface CoordinatorActionsProps {
  giftId: string
  shareCode: string
  giftName: string
  celebrantNames: string[]
  coordinatorId: string | null
  participationOpen: boolean
  isPurchased: boolean
  participantCount: number
  participantNames: string[]
  totalPrice: number
}

function checkIsCoordinator(giftId: string, coordinatorId: string | null): boolean {
  if (typeof window === 'undefined') return false

  const savedCoordinatorId = localStorage.getItem(`coordinator_${giftId}`)
  const savedFamilyId = localStorage.getItem('current_family_id')
  const urlParams = new URLSearchParams(window.location.search)

  return (
    savedCoordinatorId === 'true' ||
    savedFamilyId === coordinatorId ||
    urlParams.get('coordinator') === 'true'
  )
}

function useIsCoordinator(giftId: string, coordinatorId: string | null): boolean {
  const getSnapshot = useCallback(
    () => checkIsCoordinator(giftId, coordinatorId),
    [giftId, coordinatorId]
  )

  const getServerSnapshot = useCallback(() => false, [])

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function CoordinatorActions({
  giftId,
  shareCode,
  giftName,
  celebrantNames,
  coordinatorId,
  participationOpen,
  isPurchased,
  participantCount,
  participantNames,
  totalPrice
}: CoordinatorActionsProps) {
  const isCoordinator = useIsCoordinator(giftId, coordinatorId)

  if (!isCoordinator) {
    return null
  }

  if (isPurchased) {
    return (
      <div className="bg-green-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <Settings size={20} />
          <span className="font-semibold">Panel de Coordinador</span>
        </div>
        <p className="text-green-700 text-sm">
          El regalo ha sido comprado y finalizado.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 text-blue-800 mb-4">
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
      </div>
    </div>
  )
}
