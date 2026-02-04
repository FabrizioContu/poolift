'use client'

import { useState } from 'react'
import { Gift, Users, Lock, CheckCircle, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface GiftStatusCardProps {
  gift: {
    id: string
    share_code: string
    participation_open: boolean
    purchased_at: string | null
    final_price: number | null
    participantCount: number
  }
  proposalName: string
  totalPrice: number
}

export function GiftStatusCard({ gift, proposalName, totalPrice }: GiftStatusCardProps) {
  const [copied, setCopied] = useState(false)

  const giftUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/gifts/${gift.share_code}`
    : `/gifts/${gift.share_code}`

  const handleCopy = async () => {
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

  const getStatusInfo = () => {
    if (gift.purchased_at) {
      return {
        icon: <CheckCircle className="text-green-500" size={32} />,
        title: 'Regalo Completado',
        badge: 'Finalizado',
        badgeColor: 'bg-green-100 text-green-800',
        description: 'Compra realizada'
      }
    }
    if (!gift.participation_open) {
      return {
        icon: <Lock className="text-orange-500" size={32} />,
        title: 'Participación Cerrada',
        badge: 'Cerrado',
        badgeColor: 'bg-orange-100 text-orange-800',
        description: 'Pendiente de compra'
      }
    }
    return {
      icon: <Gift className="text-blue-500" size={32} />,
      title: 'Regalo Activo',
      badge: 'Abierto',
      badgeColor: 'bg-green-100 text-green-800',
      description: 'Las familias pueden unirse'
    }
  }

  const statusInfo = getStatusInfo()
  const priceToShow = gift.final_price || totalPrice
  const pricePerFamily = gift.participantCount > 0
    ? priceToShow / gift.participantCount
    : priceToShow

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusInfo.icon}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {statusInfo.title}
            </h3>
            <p className="text-sm text-gray-700">
              {proposalName}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeColor}`}>
          {statusInfo.badge}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-gray-700" />
            <span className="text-xs text-gray-700">Participantes</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {gift.participantCount} {gift.participantCount === 1 ? 'familia' : 'familias'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} className="text-gray-700" />
            <span className="text-xs text-gray-700">
              {gift.purchased_at ? 'Por familia' : 'Precio est.'}
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(pricePerFamily)}
          </p>
        </div>
      </div>

      {/* Description */}
      {statusInfo.description && (
        <p className="text-sm text-gray-700 mb-4">
          {statusInfo.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/gifts/${gift.share_code}`}
          className="flex-1"
        >
          <Button variant="primary" className="w-full">
            <ExternalLink size={18} className="mr-2" />
            Ver Regalo
          </Button>
        </Link>

        <Button
          onClick={handleCopy}
          variant="secondary"
        >
          {copied ? (
            <>
              <CheckCircle size={18} className="mr-2" />
              Copiado
            </>
          ) : (
            <>
              <Copy size={18} className="mr-2" />
              Copiar
            </>
          )}
        </Button>
      </div>

      {/* Share Code */}
      <div className="mt-4 p-2 bg-white rounded-lg">
        <p className="text-xs text-gray-700 text-center">
          Codigo: <code className="font-mono text-gray-700">{gift.share_code}</code>
        </p>
      </div>
    </div>
  )
}
