import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/components/auth/AuthModal', () => ({
  AuthModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="auth-modal" /> : null,
}))

import { SaveAccessBanner } from '@/components/auth/SaveAccessBanner'
import { useAuth } from '@/lib/auth'

const mockUseAuth = vi.mocked(useAuth)

function authState(overrides: Partial<ReturnType<typeof useAuth>>) {
  return {
    user: null,
    loading: false,
    isAnonymous: true,
    isAuthenticated: false,
    signOut: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAuth>
}

describe('SaveAccessBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('se muestra para usuarios anónimos', () => {
    mockUseAuth.mockReturnValue(authState({ isAnonymous: true }))
    render(<SaveAccessBanner />)
    expect(
      screen.getByText('Crea una cuenta para no perder tu acceso'),
    ).toBeInTheDocument()
  })

  it('no se muestra para usuarios autenticados', () => {
    mockUseAuth.mockReturnValue(
      authState({ isAnonymous: false, isAuthenticated: true }),
    )
    render(<SaveAccessBanner />)
    expect(
      screen.queryByText('Crea una cuenta para no perder tu acceso'),
    ).not.toBeInTheDocument()
  })

  it('no se muestra mientras carga', () => {
    mockUseAuth.mockReturnValue(authState({ loading: true }))
    render(<SaveAccessBanner />)
    expect(
      screen.queryByText('Crea una cuenta para no perder tu acceso'),
    ).not.toBeInTheDocument()
  })

  it('no se muestra si fue descartado previamente', () => {
    localStorage.setItem('poolift_dismissed_account_banner', 'true')
    mockUseAuth.mockReturnValue(authState({ isAnonymous: true }))
    render(<SaveAccessBanner />)
    expect(
      screen.queryByText('Crea una cuenta para no perder tu acceso'),
    ).not.toBeInTheDocument()
  })
})
