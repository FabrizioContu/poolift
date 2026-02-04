'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { UserPlus, UserMinus, CheckCircle } from 'lucide-react'

interface DirectGiftParticipationProps {
  giftId: string
  shareCode: string
  status: string
}

export function DirectGiftParticipation({
  giftId,
  shareCode,
  status
}: DirectGiftParticipationProps) {
  const [participantName, setParticipantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  const isOpen = status === 'open'

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`direct_gift_${giftId}_participant`)
    if (saved) {
      setParticipantName(saved)
      setJoined(true)
    }
  }, [giftId])

  const handleJoin = async () => {
    if (!participantName.trim()) {
      setError('Ingresa tu nombre')
      return
    }

    if (participantName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName: participantName.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al apuntarse')
        return
      }

      setJoined(true)
      localStorage.setItem(`direct_gift_${giftId}_participant`, participantName.trim())
      window.location.reload()
    } catch {
      setError('Error al apuntarse')
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/participate`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al salirse')
        return
      }

      setJoined(false)
      setParticipantName('')
      localStorage.removeItem(`direct_gift_${giftId}_participant`)
      window.location.reload()
    } catch {
      setError('Error al salirse')
    } finally {
      setLoading(false)
    }
  }

  // Show closed message if participation is closed
  if (!isOpen) {
    if (joined) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Estás participando</h3>
            <p className="text-gray-600">
              Como: <strong>{participantName}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              La participación está cerrada
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-gray-100 rounded-2xl p-6 text-center">
        <p className="text-gray-600">
          La participación está cerrada
        </p>
      </div>
    )
  }

  // Show joined state
  if (joined) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Estás apuntado!</h3>
          <p className="text-gray-600 mb-6">
            Como: <strong>{participantName}</strong>
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <Button
            onClick={handleLeave}
            disabled={loading}
            variant="secondary"
            className="text-red-600 hover:bg-red-50"
          >
            <UserMinus size={18} className="mr-2" />
            {loading ? 'Saliendo...' : 'Salirme del regalo'}
          </Button>
        </div>
      </div>
    )
  }

  // Show join form
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4 text-center">
        Apúntate al Regalo
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu nombre
          </label>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="ej: María, Juan García..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleJoin()
              }
            }}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button
          onClick={handleJoin}
          disabled={loading || !participantName.trim()}
          className="w-full py-3 bg-green-600 hover:bg-green-700"
        >
          <UserPlus size={20} className="mr-2" />
          {loading ? 'Apuntando...' : 'Apuntarme'}
        </Button>
      </div>
    </div>
  )
}
