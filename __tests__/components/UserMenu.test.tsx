import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSignOut = vi.fn()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/components/auth/AuthModal', () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal" /> : null,
}))

import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/lib/auth'

const mockUseAuth = vi.mocked(useAuth)

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({ error: null })
  })

  it('muestra skeleton mientras carga', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      isAnonymous: true,
      isAuthenticated: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
    })

    render(<UserMenu />)
    // El skeleton es un div con animate-pulse, no tiene texto visible
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  describe('usuario anónimo', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAnonymous: true,
        isAuthenticated: false,
        signOut: mockSignOut,
        signIn: vi.fn(),
        signUp: vi.fn(),
      })
    })

    it('muestra botón "Entrar"', () => {
      render(<UserMenu />)
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    it('abre AuthModal al hacer click en "Entrar"', async () => {
      const user = userEvent.setup()
      render(<UserMenu />)

      await user.click(screen.getByRole('button', { name: /entrar/i }))

      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    })
  })

  describe('usuario autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          email: 'maria@example.com',
          user_metadata: { name: 'Maria' },
        } as never,
        loading: false,
        isAnonymous: false,
        isAuthenticated: true,
        signOut: mockSignOut,
        signIn: vi.fn(),
        signUp: vi.fn(),
      })
    })

    it('muestra la inicial del usuario en el avatar', () => {
      render(<UserMenu />)
      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('muestra el nombre del usuario al abrir el dropdown', async () => {
      const user = userEvent.setup()
      render(<UserMenu />)

      await user.click(screen.getByRole('button', { name: /maria/i }))

      expect(screen.getByText('maria@example.com')).toBeInTheDocument()
    })

    it('llama signOut al hacer click en "Cerrar sesión"', async () => {
      const user = userEvent.setup()
      render(<UserMenu />)

      // Abrir dropdown
      await user.click(screen.getByRole('button', { name: /maria/i }))

      // Click en cerrar sesión
      await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledOnce()
      })
    })

    it('usa email como nombre cuando no hay user_metadata.name', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-2',
          email: 'test@example.com',
          user_metadata: {},
        } as never,
        loading: false,
        isAnonymous: false,
        isAuthenticated: true,
        signOut: mockSignOut,
        signIn: vi.fn(),
        signUp: vi.fn(),
      })

      render(<UserMenu />)
      // La inicial viene del email
      expect(screen.getByText('T')).toBeInTheDocument()
    })
  })
})
