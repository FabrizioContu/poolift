import { Cake, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BirthdayCardProps {
  birthday: {
    id: string
    child_name: string
    birth_date: string
    nextPartyDate: string | null
  }
}

export function BirthdayCard({ birthday }: BirthdayCardProps) {
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
    <div className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Cake className="text-pink-500" size={24} />
            <h3 className="text-lg font-bold text-foreground">{birthday.child_name}</h3>
            <span className="text-sm text-muted-foreground">({age} anos)</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {formatDate(birthday.birth_date)}
            </div>
          </div>

          {daysUntil <= 30 ? (
            <p className="text-sm text-primary font-medium">
              Cumple en {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
            </p>
          ) : birthday.nextPartyDate ? (
            <p className="text-sm text-primary">
              Proxima fiesta: {formatDate(birthday.nextPartyDate)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin fiesta programada
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
