'use client'

import { useState } from 'react'
import { Calendar, Cake } from 'lucide-react'
import { PartyCard } from '@/components/cards/PartyCard'
import { BirthdayList } from '@/components/birthdays/BirthdayList'

interface Party {
  id: string
  group_id: string
  party_date: string
  coordinator: { name: string } | null
  party_celebrants: Array<{
    birthdays: { child_name: string }
  }>
}

interface Birthday {
  id: string
  child_name: string
  birth_date: string
  nextPartyDate: string | null
}

interface DashboardTabsProps {
  parties: Party[]
  birthdays: Birthday[]
  groupId: string
}

export function DashboardTabs({ parties, birthdays, groupId }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'parties' | 'birthdays'>('parties')

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('parties')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'parties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar size={18} />
            Fiestas ({parties.length})
          </button>

          <button
            onClick={() => setActiveTab('birthdays')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'birthdays'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cake size={18} />
            Cumpleanos ({birthdays.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'parties' && (
        <div className="grid gap-4">
          {parties.length === 0 ? (
            <p className="text-gray-700 text-center py-8">
              No hay fiestas programadas. Crea la primera fiesta del grupo.
            </p>
          ) : (
            parties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))
          )}
        </div>
      )}

      {activeTab === 'birthdays' && (
        <BirthdayList birthdays={birthdays} groupId={groupId} />
      )}
    </div>
  )
}
