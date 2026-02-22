import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({ isAnonymous: true, user: null, loading: false, isAuthenticated: false })),
}))

vi.mock('@/components/auth/AuthModal', () => ({
  AuthModal: () => null,
}))

import { GroupHeader } from '@/components/groups/GroupHeader'

const defaultProps = {
  groupName: 'Cumpleaños Clase 2B',
  inviteCode: 'ABC123',
  familyCount: 5,
}

describe('GroupHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el nombre del grupo', () => {
    render(<GroupHeader {...defaultProps} />)
    expect(screen.getByText('Cumpleaños Clase 2B')).toBeInTheDocument()
  })

  it('muestra el número de familias en plural', () => {
    render(<GroupHeader {...defaultProps} />)
    expect(screen.getByText('5 familias')).toBeInTheDocument()
  })

  it('muestra el número de familias en singular', () => {
    render(<GroupHeader {...defaultProps} familyCount={1} />)
    expect(screen.getByText('1 familia')).toBeInTheDocument()
  })

  it('muestra el código de invitación', () => {
    render(<GroupHeader {...defaultProps} />)
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('muestra el botón de invitar familias', () => {
    render(<GroupHeader {...defaultProps} />)
    expect(screen.getByRole('button', { name: /invitar familias/i })).toBeInTheDocument()
  })

  it('muestra feedback al hacer clic en el código', async () => {
    const user = userEvent.setup()
    render(<GroupHeader {...defaultProps} />)

    const codeButton = screen.getByTitle('Copiar código')
    await user.click(codeButton)

    await waitFor(() => {
      expect(screen.getByText('¡Copiado!')).toBeInTheDocument()
    })
  })

  it('muestra feedback al hacer clic en Invitar Familias', async () => {
    const user = userEvent.setup()
    render(<GroupHeader {...defaultProps} />)

    const inviteButton = screen.getByRole('button', { name: /invitar familias/i })
    await user.click(inviteButton)

    await waitFor(() => {
      expect(screen.getByText('¡Link copiado!')).toBeInTheDocument()
    })
  })

  it('tiene el icono de usuarios', () => {
    const { container } = render(<GroupHeader {...defaultProps} />)
    const usersIcon = container.querySelector('svg')
    expect(usersIcon).toBeInTheDocument()
  })

  it('tiene borde inferior para separación visual', () => {
    const { container } = render(<GroupHeader {...defaultProps} />)
    const headerDiv = container.firstChild
    expect(headerDiv).toHaveClass('border-b')
  })

  it('muestra 0 familias correctamente', () => {
    render(<GroupHeader {...defaultProps} familyCount={0} />)
    expect(screen.getByText('0 familias')).toBeInTheDocument()
  })

  it('el botón de código es clickeable', () => {
    render(<GroupHeader {...defaultProps} />)
    const codeButton = screen.getByTitle('Copiar código')
    expect(codeButton).toBeEnabled()
  })

  it('el botón de invitar es clickeable', () => {
    render(<GroupHeader {...defaultProps} />)
    const inviteButton = screen.getByRole('button', { name: /invitar familias/i })
    expect(inviteButton).toBeEnabled()
  })
})
