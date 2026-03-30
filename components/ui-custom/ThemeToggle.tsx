'use client'

import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`p-1.5 rounded transition text-gray-700 hover:bg-gray-100 dark:text-bondi-blue-200 dark:hover:bg-bondi-blue-700 ${className}`}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
