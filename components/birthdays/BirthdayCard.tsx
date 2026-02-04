'use client'

import { useState } from 'react'
import { Cake, Calendar, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'

const AddIdeaModal = dynamic(() => import('@/components/modals/AddIdeaModal'))

interface BirthdayCardProps {
  birthday: {
    id: string
    child_name: string
    birth_date: string
    ideaCount: number
    nextPartyDate: string | null
  }
  groupId: string
}

export function BirthdayCard({ birthday, groupId }: BirthdayCardProps) {
  const [showAddIdea, setShowAddIdea] = useState(false)

  const birthDate = new Date(birthday.birth_date)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()

  // Calculate days until next birthday
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1)
  }
  const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Cake className="text-pink-500" size={24} />
            <h3 className="text-lg font-bold">{birthday.child_name}</h3>
            <span className="text-sm text-gray-700">({age} anos)</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {formatDate(birthday.birth_date)}
            </div>

            <div className="flex items-center gap-1">
              <Lightbulb size={16} />
              {birthday.ideaCount} {birthday.ideaCount === 1 ? 'idea' : 'ideas'}
            </div>
          </div>

          {daysUntil <= 30 ? (
            <p className="text-sm text-orange-600 font-medium">
              Cumple en {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
            </p>
          ) : birthday.nextPartyDate ? (
            <p className="text-sm text-blue-600">
              Proxima fiesta: {formatDate(birthday.nextPartyDate)}
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Sin fiesta programada
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setShowAddIdea(true)}
            variant="primary"
            className="text-sm px-3 py-1.5"
          >
            <Lightbulb size={16} className="mr-1" />
            Anadir Idea
          </Button>
        </div>
      </div>

      {showAddIdea && (
        <AddIdeaModal
          isOpen={showAddIdea}
          onClose={() => setShowAddIdea(false)}
          partyId=""
          preSelectedBirthdayId={birthday.id}
          preSelectedBirthdayName={birthday.child_name}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
