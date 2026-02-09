'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cake, PartyPopper, Gift, Check, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import dynamic from 'next/dynamic'

const AddBirthdayModal = dynamic(() => import('@/components/modals/AddBirthdayModal'))

interface OnboardingGuideProps {
  groupId: string
  birthdayCount: number
  partyCount: number
}

interface Step {
  number: number
  title: string
  description: string
  icon: React.ElementType
  status: 'completed' | 'active' | 'locked'
}

export function OnboardingGuide({ groupId, birthdayCount, partyCount }: OnboardingGuideProps) {
  const [showBirthdayModal, setShowBirthdayModal] = useState(false)
  const router = useRouter()

  const steps: Step[] = [
    {
      number: 1,
      title: 'Registra los cumpleaños',
      description: birthdayCount === 0
        ? 'Añade los niños del grupo con su fecha de nacimiento.'
        : `${birthdayCount} ${birthdayCount === 1 ? 'cumpleaños registrado' : 'cumpleaños registrados'}. Puedes seguir añadiendo más.`,
      icon: Cake,
      status: birthdayCount > 0 ? 'completed' : 'active',
    },
    {
      number: 2,
      title: 'Crea la primera fiesta',
      description: 'Elige los niños que celebran y la fecha de la fiesta.',
      icon: PartyPopper,
      status: birthdayCount === 0 ? 'locked' : partyCount > 0 ? 'completed' : 'active',
    },
    {
      number: 3,
      title: 'Coordina el regalo',
      description: 'Propón regalos, vota y coordina la compra entre familias.',
      icon: Gift,
      status: partyCount === 0 ? 'locked' : 'active',
    },
  ]

  const handleBirthdaySuccess = () => {
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Grupo creado! ¿Qué sigue?
        </h2>
        <p className="text-gray-600">
          Sigue estos pasos para organizar la primera fiesta.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <StepCard
            key={step.number}
            step={step}
            onAction={
              step.number === 1 && step.status !== 'locked'
                ? () => setShowBirthdayModal(true)
                : undefined
            }
          />
        ))}
      </div>

      {showBirthdayModal && (
        <AddBirthdayModal
          isOpen={showBirthdayModal}
          onClose={() => setShowBirthdayModal(false)}
          groupId={groupId}
          onSuccess={handleBirthdaySuccess}
        />
      )}
    </div>
  )
}

function StepCard({ step, onAction }: { step: Step; onAction?: () => void }) {
  const Icon = step.icon

  const isCompleted = step.status === 'completed'
  const isActive = step.status === 'active'
  const isLocked = step.status === 'locked'

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-lg border transition
        ${isActive ? 'border-blue-300 bg-blue-50' : ''}
        ${isCompleted ? 'border-green-200 bg-green-50' : ''}
        ${isLocked ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
      `}
    >
      {/* Step indicator */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isCompleted ? 'bg-green-500 text-white' : ''}
          ${isActive ? 'bg-blue-500 text-white' : ''}
          ${isLocked ? 'bg-gray-200 text-gray-400' : ''}
        `}
      >
        {isCompleted ? (
          <Check size={20} />
        ) : (
          <Icon size={20} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
          {step.title}
        </h3>
        <p className={`text-sm mt-0.5 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {step.description}
        </p>

        {/* CTA for active steps */}
        {isActive && step.number === 1 && onAction && (
          <Button onClick={onAction} className="mt-3 flex items-center gap-2">
            <Plus size={16} />
            Añadir Cumpleaños
          </Button>
        )}

        {isCompleted && step.number === 1 && onAction && (
          <button
            onClick={onAction}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
          >
            Añadir otro
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
