'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Calendar, Users, PartyPopper } from 'lucide-react'

interface BirthdayOption {
  id: string
  child_name: string
  birth_date: string
}

interface FamilyOption {
  id: string
  name: string
}

interface CreatePartyModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  birthdays: BirthdayOption[]
  families?: FamilyOption[]
  onSuccess?: () => void
}

export function CreatePartyModal({
  isOpen,
  onClose,
  groupId,
  birthdays,
  families = [],
  onSuccess
}: CreatePartyModalProps) {
  const [partyDate, setPartyDate] = useState('')
  const [selectedCelebrants, setSelectedCelebrants] = useState<string[]>([])
  const [coordinatorId, setCoordinatorId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCelebrantToggle = (birthdayId: string) => {
    setSelectedCelebrants(prev =>
      prev.includes(birthdayId)
        ? prev.filter(id => id !== birthdayId)
        : [...prev, birthdayId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!partyDate) {
      setError('Selecciona una fecha para la fiesta')
      return
    }

    if (selectedCelebrants.length === 0) {
      setError('Selecciona al menos un celebrante')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          partyDate,
          coordinatorId: coordinatorId || undefined,
          celebrantIds: selectedCelebrants
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear la fiesta')
      }

      // Reset form
      setPartyDate('')
      setSelectedCelebrants([])
      setCoordinatorId('')

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la fiesta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Fiesta">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha de la fiesta */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={18} />
            Fecha de la Fiesta
          </label>
          <input
            type="date"
            value={partyDate}
            onChange={(e) => setPartyDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Selección de celebrantes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <PartyPopper size={18} />
            Celebrantes
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Selecciona los niños que celebrarán en esta fiesta
          </p>

          {birthdays.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No hay cumpleaños registrados en este grupo
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {birthdays.map((birthday) => (
                <label
                  key={birthday.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    selectedCelebrants.includes(birthday.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCelebrants.includes(birthday.id)}
                    onChange={() => handleCelebrantToggle(birthday.id)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {birthday.child_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cumple el {formatBirthDate(birthday.birth_date)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Coordinador (opcional) */}
        {families.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users size={18} />
              Coordinador
              <span className="text-xs text-gray-500 font-normal">(opcional)</span>
            </label>
            <select
              value={coordinatorId}
              onChange={(e) => setCoordinatorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Asignar automáticamente</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Si no seleccionas, se asignará a la familia que menos fiestas haya coordinado
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || selectedCelebrants.length === 0}
            className="flex-1"
          >
            {isSubmitting ? 'Creando...' : 'Crear Fiesta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreatePartyModal
