import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui-custom/Button'

describe('Button', () => {
  it('renderiza correctamente', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('aplica la variante primary por defecto', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByText('Primary')).toBeInTheDocument()
  })

  it('aplica la variante secondary', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()
  })

  it('aplica la variante danger', () => {
    render(<Button variant="danger">Danger</Button>)
    expect(screen.getByText('Danger')).toBeInTheDocument()
  })
})
