'use client'

import { useState } from 'react'
import { Gift, Users, Lock, CheckCircle, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui-custom/Button'
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

const STATUS_BADGE_CLASSES = {
  finalized: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200',
  closed:    'bg-tropical-teal-50 text-tropical-teal-700 dark:bg-tropical-teal-700 dark:text-tropical-teal-200',
  active:    'bg-bondi-blue-100 text-bondi-blue-700 dark:bg-bondi-blue-600 dark:text-bondi-blue-100',
} as const

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
        icon: <CheckCircle className="text-emerald-400" size={32} />,
        title: 'Regalo Completado',
        badge: 'Finalizado',
        badgeKey: 'finalized' as const,
        description: 'Compra realizada'
      }
    }
    if (!gift.participation_open) {
      return {
        icon: <Lock className="text-tropical-teal-400" size={32} />,
        title: 'Participación Cerrada',
        badge: 'Cerrado',
        badgeKey: 'closed' as const,
        description: 'Pendiente de compra'
      }
    }
    return {
      icon: <Gift className="text-bondi-blue-400" size={32} />,
      title: 'Regalo Activo',
      badge: 'Abierto',
      badgeKey: 'active' as const,
      description: 'Las familias pueden unirse'
    }
  }

  const statusInfo = getStatusInfo()
  const priceToShow = gift.final_price || totalPrice
  const pricePerFamily = gift.participantCount > 0
    ? priceToShow / gift.participantCount
    : priceToShow

  return (
    <div className="bg-linear-to-br from-bondi-blue-50 to-bondi-blue-100 rounded-lg p-6 mb-6 border-2 border-bondi-blue-200 dark:bg-bondi-blue-700 dark:border-bondi-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusInfo.icon}
          <div>
            <h3 className="text-xl font-bold text-foreground dark:text-bondi-blue-50">
              {statusInfo.title}
            </h3>
            <p className="text-sm text-muted-foreground dark:text-bondi-blue-200">
              {proposalName}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE_CLASSES[statusInfo.badgeKey]}`}>
          {statusInfo.badge}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-background rounded-lg p-3 dark:bg-bondi-blue-600">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-muted-foreground dark:text-bondi-blue-300" />
            <span className="text-xs text-muted-foreground dark:text-bondi-blue-300">Participantes</span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-bondi-blue-50">
            {gift.participantCount} {gift.participantCount === 1 ? 'familia' : 'familias'}
          </p>
        </div>

        <div className="bg-background rounded-lg p-3 dark:bg-bondi-blue-600">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} className="text-muted-foreground dark:text-bondi-blue-300" />
            <span className="text-xs text-muted-foreground dark:text-bondi-blue-300">
              {gift.purchased_at ? 'Por familia' : 'Precio est.'}
            </span>
          </div>
          <p className="text-lg font-bold text-foreground dark:text-bondi-blue-50">
            {formatPrice(pricePerFamily)}
          </p>
        </div>
      </div>

      {/* Description */}
      {statusInfo.description && (
        <p className="text-sm text-muted-foreground mb-4 dark:text-bondi-blue-200">
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
      <div className="mt-4 p-2 bg-background rounded-lg dark:bg-bondi-blue-600">
        <p className="text-xs text-muted-foreground text-center dark:text-bondi-blue-200">
          Codigo: <code className="font-mono text-muted-foreground dark:text-bondi-blue-200">{gift.share_code}</code>
        </p>
      </div>
    </div>
  )
}
