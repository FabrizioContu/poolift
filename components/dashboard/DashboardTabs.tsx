'use client'

import { Calendar, Cake, PartyPopper } from 'lucide-react'
import { Tabs } from '@/components/ui/Tabs'
import { PartyCard } from '@/components/cards/PartyCard'
import { BirthdayList } from '@/components/birthdays/BirthdayList'
import { EmptyState } from '@/components/ui/EmptyState'

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
  const tabs = [
    {
      id: 'parties',
      label: (
        <span className="flex items-center gap-2">
          <Calendar size={18} />
          Fiestas ({parties.length})
        </span>
      ),
    },
    {
      id: 'birthdays',
      label: (
        <span className="flex items-center gap-2">
          <Cake size={18} />
          Cumpleanos ({birthdays.length})
        </span>
      ),
    },
  ]

  return (
    <Tabs tabs={tabs} defaultTab="parties">
      {(activeTab) => (
        <>
          {activeTab === 'parties' && (
            <div className="grid gap-4">
              {parties.length === 0 ? (
                <EmptyState
                  icon={PartyPopper}
                  title="No hay fiestas programadas"
                  description="Usa el botón «Crear Fiesta» para organizar la primera celebración."
                />
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
        </>
      )}
    </Tabs>
  )
}
