'use client'

import { useState } from 'react'
import { BirthdayCard } from './BirthdayCard'
import { Button } from '@/components/ui/Button'
import { Plus, Cake } from 'lucide-react'
import dynamic from 'next/dynamic'

const AddBirthdayModal = dynamic(() => import('@/components/modals/AddBirthdayModal'))

interface Birthday {
  id: string
  child_name: string
  birth_date: string
  ideaCount: number
  nextPartyDate: string | null
}

interface BirthdayListProps {
  birthdays: Birthday[]
  groupId: string
}

export function BirthdayList({ birthdays, groupId }: BirthdayListProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  if (birthdays.length === 0) {
    return (
      <div className="text-center py-12">
        <Cake className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-4">
          No hay cumpleanos registrados todavia
        </p>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Anadir Primer Cumpleanos
        </Button>

        {showAddModal && (
          <AddBirthdayModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            groupId={groupId}
            onSuccess={() => window.location.reload()}
          />
        )}
      </div>
    )
  }

  // Sort birthdays by upcoming date
  const sortedBirthdays = [...birthdays].sort((a, b) => {
    const today = new Date()
    const dateA = new Date(a.birth_date)
    const dateB = new Date(b.birth_date)

    // Calculate next birthday for each
    const nextA = new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate())
    const nextB = new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate())

    if (nextA < today) nextA.setFullYear(today.getFullYear() + 1)
    if (nextB < today) nextB.setFullYear(today.getFullYear() + 1)

    return nextA.getTime() - nextB.getTime()
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          Cumpleanos del Grupo ({birthdays.length})
        </h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Anadir Cumpleanos
        </Button>
      </div>

      <div className="space-y-4">
        {sortedBirthdays.map(birthday => (
          <BirthdayCard
            key={birthday.id}
            birthday={birthday}
            groupId={groupId}
          />
        ))}
      </div>

      {showAddModal && (
        <AddBirthdayModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          groupId={groupId}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
