import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock auth functions
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()

vi.mock('@/lib/auth', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
}))

// Mock migrate
const mockMigrateAnonData = vi.fn()

vi.mock('@/lib/migrate', () => ({
  migrateAnonData: (...args: unknown[]) => mockMigrateAnonData(...args),
}))

// Mock Supabase client
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  }),
}))

import { AuthModal } from '@/components/auth/AuthModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
}

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMigrateAnonData.mockResolvedValue(undefined)
  })

  // --- Rendering ---

  it('renders nothing when isOpen is false', () => {
    render(<AuthModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
  })

  it('renders modal with login tab active by default', () => {
    render(<AuthModal {...defaultProps} />)

    expect(screen.getByText('Iniciar sesion')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument()
    // Should not show name field (login tab)
    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument()
  })

  it('renders modal with register tab when defaultTab="register"', () => {
    render(<AuthModal {...defaultProps} defaultTab="register" />)

    // Register tab shows name field (login tab does not)
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument()
  })

  it('shows headline and subheadline when provided', () => {
    render(
      <AuthModal
        {...defaultProps}
        headline="Test headline"
        subheadline="Test subheadline"
      />
    )

    expect(screen.getByText('Test headline')).toBeInTheDocument()
    expect(screen.getByText('Test subheadline')).toBeInTheDocument()
  })

  it('does not show headline area when not provided', () => {
    render(<AuthModal {...defaultProps} />)
    expect(screen.queryByText('Test headline')).not.toBeInTheDocument()
  })

  // --- Tab navigation ---

  it('switches to register tab when "Crear cuenta" is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal {...defaultProps} />)

    // Click on the tab button "Crear cuenta" (not the modal title)
    const tabs = screen.getAllByText('Crear cuenta')
    await user.click(tabs[0])

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
  })

  it('switches to login tab when "Entrar" is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal {...defaultProps} defaultTab="register" />)

    const tabs = screen.getAllByText('Entrar')
    await user.click(tabs[0])

    expect(screen.queryByLabelText(/nombre/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('clears error when switching tabs', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })

    render(<AuthModal {...defaultProps} />)

    // Trigger a login error
    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Entrar')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Email o contrasena incorrectos')
      ).toBeInTheDocument()
    })

    // Switch tab
    const tabButtons = screen.getAllByText('Crear cuenta')
    await user.click(tabButtons[0])

    expect(
      screen.queryByText('Email o contrasena incorrectos')
    ).not.toBeInTheDocument()
  })

  // --- Login form ---

  it('shows validation error for empty email on login submit', async () => {
    const user = userEvent.setup()
    render(<AuthModal {...defaultProps} />)

    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Entrar')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })
  })

  it('calls signIn with correct data on valid login submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ data: { session: {} }, error: null })

    render(<AuthModal {...defaultProps} />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Entrar')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123')
    })
  })

  it('shows loading state during login submission', async () => {
    const user = userEvent.setup()
    // Keep the promise pending
    mockSignIn.mockReturnValue(new Promise(() => {}))

    render(<AuthModal {...defaultProps} />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Entrar')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Entrando...')).toBeInTheDocument()
    })
  })

  it('shows error alert on login failure', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })

    render(<AuthModal {...defaultProps} />)

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'wrongpassword')

    const submitButtons = screen.getAllByText('Entrar')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Email o contrasena incorrectos')
      ).toBeInTheDocument()
    })
  })

  it('calls migrateAnonData and onSuccess after successful login', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    mockSignIn.mockResolvedValue({ data: { session: {} }, error: null })

    render(
      <AuthModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Entrar')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMigrateAnonData).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  // --- Register form ---

  it('shows name, email, and password fields on register tab', async () => {
    const user = userEvent.setup()
    render(<AuthModal {...defaultProps} />)

    const tabs = screen.getAllByText('Crear cuenta')
    await user.click(tabs[0])

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument()
  })

  it('calls signUp with correct data on valid register submission', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'u1' }, session: {} },
      error: null,
    })

    render(<AuthModal {...defaultProps} defaultTab="register" />)

    await user.type(screen.getByLabelText(/nombre/i), 'Maria')
    await user.type(screen.getByLabelText(/email/i), 'maria@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Crear cuenta')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'maria@test.com',
        'password123',
        'Maria'
      )
    })
  })

  it('shows email confirmation view when email verification needed', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    })

    render(<AuthModal {...defaultProps} defaultTab="register" />)

    await user.type(screen.getByLabelText(/nombre/i), 'Maria')
    await user.type(screen.getByLabelText(/email/i), 'maria@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Crear cuenta')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Revisa tu email')).toBeInTheDocument()
      expect(
        screen.getByText(/enlace de confirmacion/i)
      ).toBeInTheDocument()
    })
  })

  it('calls migrateAnonData and onSuccess on auto-confirmed registration', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'u1' }, session: { access_token: 'tok' } },
      error: null,
    })

    render(
      <AuthModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        defaultTab="register"
      />
    )

    await user.type(screen.getByLabelText(/nombre/i), 'Maria')
    await user.type(screen.getByLabelText(/email/i), 'maria@test.com')
    await user.type(screen.getByLabelText(/contrasena/i), 'password123')

    const submitButtons = screen.getAllByText('Crear cuenta')
    const submitButton = submitButtons.find(
      (el) => el.tagName === 'BUTTON' && el.getAttribute('type') === 'submit'
    )!
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMigrateAnonData).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  // --- Google OAuth ---

  it('shows Google button on login tab', () => {
    render(<AuthModal {...defaultProps} />)
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('calls signInWithOAuth with google provider when clicked', async () => {
    const user = userEvent.setup()
    mockSignInWithOAuth.mockResolvedValue({ error: null })

    render(<AuthModal {...defaultProps} />)

    await user.click(screen.getByText('Continuar con Google'))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      )
    })
  })

  // --- Modal behavior ---

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByLabelText('Cerrar'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
