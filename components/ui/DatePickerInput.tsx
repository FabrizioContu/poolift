'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import 'react-day-picker/style.css'

interface DatePickerInputProps {
  value: string
  onChange: (value: string) => void
  /** Disable dates before this date (YYYY-MM-DD) */
  min?: string
  /** Disable dates after this date (YYYY-MM-DD) */
  max?: string
  placeholder?: string
  disabled?: boolean
  /** Show year+month dropdowns for easy navigation (e.g. for birth dates) */
  showDropdownNav?: boolean
  /** Earliest selectable year when showDropdownNav is true */
  fromYear?: number
  /** Latest selectable year when showDropdownNav is true */
  toYear?: number
}

export function DatePickerInput({
  value,
  onChange,
  min,
  max,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  showDropdownNav = false,
  fromYear,
  toYear,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selected = value ? parseISO(value) : undefined

  const displayValue = selected
    ? format(selected, "d 'de' MMMM yyyy", { locale: es })
    : null

  const disabledDays = [
    ...(min ? [{ before: new Date(min + 'T00:00:00') }] : []),
    ...(max ? [{ after: new Date(max + 'T00:00:00') }] : []),
  ]

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'))
      setIsOpen(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const startMonth = showDropdownNav
    ? new Date(fromYear ?? currentYear - 20, 0)
    : undefined
  const endMonth = showDropdownNav
    ? new Date(toYear ?? currentYear, 11)
    : undefined

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={[
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg text-left transition text-sm',
          disabled
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white border-gray-300 hover:border-blue-400',
          isOpen ? 'ring-2 ring-blue-500 border-transparent' : '',
          !displayValue ? 'text-gray-400' : 'text-gray-900',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{displayValue ?? placeholder}</span>
        <CalendarIcon size={16} className="text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="mt-1.5 border border-gray-200 rounded-lg shadow-md bg-white overflow-hidden">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? (max ? new Date(max) : min ? new Date(min) : undefined)}
            disabled={disabledDays.length > 0 ? disabledDays : undefined}
            locale={es}
            captionLayout={showDropdownNav ? 'dropdown' : 'label'}
            startMonth={startMonth}
            endMonth={endMonth}
            reverseYears
            classNames={{
              root: 'p-3 w-full box-border',
              months: 'w-full',
              month: 'w-full',
              month_caption: 'flex items-center justify-between px-1 mb-3',
              caption_label: showDropdownNav ? 'hidden' : 'font-semibold text-gray-800 text-sm capitalize',
              dropdowns: 'flex items-center gap-1',
              dropdown:
                'border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-800 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize',
              nav: 'flex items-center gap-1',
              button_previous:
                'p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600',
              button_next:
                'p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600',
              month_grid: 'w-full table-fixed border-collapse',
              weekdays: '',
              weekday:
                'text-center text-xs font-medium text-gray-500 capitalize pb-1',
              weeks: '',
              week: '',
              day: 'text-center p-0.5',
              day_button:
                'w-full h-9 flex items-center justify-center rounded-lg text-sm transition hover:bg-blue-50 hover:text-blue-600',
              today: 'font-bold text-blue-500',
              selected:
                'bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:text-white',
              outside: 'text-gray-300 opacity-50',
              disabled:
                'text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
              chevron: 'fill-gray-500',
            }}
          />
        </div>
      )}
    </div>
  )
}
