'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Lock, AlertTriangle, Users, Check, Copy, Share2 } from 'lucide-react'
import { formatPrice, calculatePricePerFamily } from '@/lib/utils'
import { generateParticipationClosedMessage } from '@/lib/messages'
import { useAuth } from '@/lib/auth'

const AuthModal = dynamic(() =>
  import('@/components/auth/AuthModal').then((m) => ({ default: m.AuthModal }))
)

interface CloseParticipationButtonProps {
  giftId: string
  shareCode: string
  giftName: string
  celebrantNames: string[]
  participantCount: number
  participantNames: string[]
  totalPrice: number
  onSuccess?: () => void
}

export function CloseParticipationButton({
  giftId,
  shareCode,
  giftName,
  celebrantNames,
  participantCount,
  participantNames,
  totalPrice,
  onSuccess
}: CloseParticipationButtonProps) {
  const { isAnonymous } = useAuth()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showAuthNudge, setShowAuthNudge] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [finalPricePerFamily, setFinalPricePerFamily] = useState<string | null>(null)

  const estimatedPricePerFamily = calculatePricePerFamily(totalPrice, participantCount)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://poolift.vercel.app'
  const giftUrl = `${appUrl}/gifts/${shareCode}`

  const handleClose = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gifts/${giftId}/close`, {
        method: 'PUT'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cerrar participación')
      }

      const pricePerFamily = data.pricePerFamily
        ? data.pricePerFamily.toFixed(2)
        : estimatedPricePerFamily

      setFinalPricePerFamily(pricePerFamily)
      setShowConfirmModal(false)
      setShowSuccessModal(true)
      onSuccess?.()
      if (isAnonymous) setShowAuthNudge(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = giftUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareWhatsApp = () => {
    const message = generateParticipationClosedMessage(
      celebrantNames,
      giftName,
      finalPricePerFamily || estimatedPricePerFamily,
      participantCount,
      shareCode
    )
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
    window.location.reload()
  }

  if (participantCount === 0) {
    return (
      <Button
        disabled
        variant="secondary"
        className="w-full"
        title="No hay participantes"
      >
        <Lock size={18} className="mr-2" />
        Cerrar Participación
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirmModal(true)}
        variant="secondary"
        className="w-full"
      >
        <Lock size={18} className="mr-2" />
        Cerrar Participación
      </Button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Cerrar Participación"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-yellow-800">
                  ¿Estás seguro?
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Una vez cerrada, nadie más podrá apuntarse al regalo.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Users size={18} />
                <span className="font-medium">
                  {participantCount} familias participantes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total del regalo:</span>
                <span className="font-bold text-blue-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                <span className="text-gray-700">Precio por familia:</span>
                <span className="font-bold text-green-600 text-lg">
                  {estimatedPricePerFamily}€
                </span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="secondary"
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Cerrando...' : 'Cerrar Participación'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal with Share Options */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccess}
          title="Participación Cerrada"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Check className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-medium text-green-800">
                  La participación ha sido cerrada
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Comparte el enlace para que las familias vean el precio final.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-gray-700 mb-1">Regalo:</p>
                <p className="font-medium">{giftName}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700">Familias participantes:</span>
                <span className="font-bold">{participantCount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total:</span>
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700">Precio por familia:</span>
                <span className="font-bold text-green-600 text-xl">
                  {finalPricePerFamily || estimatedPricePerFamily}€
                </span>
              </div>
            </div>

            {/* Participants List */}
            {participantNames.length > 0 && (
              <div>
                <p className="text-xs text-gray-700 mb-2">Participantes:</p>
                <div className="flex flex-wrap gap-1">
                  {participantNames.map((name, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-gray-700">Compartir con las familias:</p>

              <Button
                onClick={handleShareWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Share2 size={18} className="mr-2" />
                Compartir por WhatsApp
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="secondary"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Link Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} className="mr-2" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <Button
                onClick={handleCloseSuccess}
                variant="secondary"
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Auth nudge — aparece tras cerrar participación si el usuario es anónimo */}
      <AuthModal
        isOpen={showAuthNudge}
        onClose={() => setShowAuthNudge(false)}
        defaultTab="register"
        headline="¡Regalo cerrado! ¿Guardamos tu historial?"
        subheadline="Crea una cuenta gratuita para acceder desde cualquier dispositivo"
      />
    </>
  )
}
