import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ──────────────────────────────────────────────
// Navigation mocks
// ──────────────────────────────────────────────

const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

// ──────────────────────────────────────────────
// Auth + storage mocks
// ──────────────────────────────────────────────

const mockAddGroupToSession = vi.fn()
const mockAddGroup = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('@/lib/auth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
  addGroupToSession: (...args: unknown[]) => mockAddGroupToSession(...args),
}))

vi.mock('@/lib/storage', () => ({
  anonymousStorage: {
    addGroup: (...args: unknown[]) => mockAddGroup(...args),
  },
}))

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const successPayload = {
  family: {
    id: 'fam-1',
    name: 'Familia García',
    group_id: 'grp-1',
    share_code: 'abc123xy',
    is_creator: false,
  },
  group: {
    id: 'grp-1',
    name: 'Clase 2B',
    invite_code: 'invite123',
  },
}

async function renderJoinPage() {
  const { default: JoinPage } = await import('@/app/join/page')
  return render(<JoinPage />)
}

// ──────────────────────────────────────────────
// Suite — invite tab (default)
// ──────────────────────────────────────────────

describe('JoinPage — invite tab (default)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockSearchParams = new URLSearchParams()
    mockUseAuth.mockReturnValue({ user: null, loading: false })
  })

  it('renders invite tab by default', async () => {
    await renderJoinPage()

    // Tab button for invite should be visible (active)
    expect(screen.getByRole('button', { name: 'Código de invitación' })).toBeInTheDocument()
    // The input inside the invite tab
    expect(screen.getByPlaceholderText('ej: abc123xyz')).toBeInTheDocument()
    // The submit button
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
  })

  it('navigates to /join/[code] on valid invite code submit', async () => {
    const user = userEvent.setup()
    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xyz'), 'abc123xyz')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(mockPush).toHaveBeenCalledWith('/join/abc123xyz')
  })

  it('shows error when invite code is empty', async () => {
    const user = userEvent.setup()
    await renderJoinPage()

    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('El código de invitación es requerido')).toBeInTheDocument()
    })
  })

  it('shows error when invite code is too short', async () => {
    const user = userEvent.setup()
    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xyz'), 'abc')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    await waitFor(() => {
      expect(screen.getByText('El código debe tener entre 6 y 12 caracteres')).toBeInTheDocument()
    })
  })
})

// ──────────────────────────────────────────────
// Suite — familia tab
// ──────────────────────────────────────────────

describe('JoinPage — familia tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockSearchParams = new URLSearchParams()
    mockUseAuth.mockReturnValue({ user: null, loading: false })
  })

  it('renders familia tab when ?tab=familia is in URL', async () => {
    mockSearchParams = new URLSearchParams('tab=familia')
    await renderJoinPage()

    // Heading is unique with role
    expect(screen.getByRole('heading', { name: 'Recuperar Acceso' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Código de familia/)).toBeInTheDocument()
  })

  it('switches to familia tab when clicking the tab button', async () => {
    const user = userEvent.setup()
    await renderJoinPage()

    await user.click(screen.getByRole('button', { name: 'Código de familia' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Recuperar Acceso' })).toBeInTheDocument()
    })
  })

  it('shows error when family code is empty', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')
    await renderJoinPage()

    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('El código de familia es requerido')).toBeInTheDocument()
    })
  })

  it('shows error when family code contains invalid characters', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')
    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'abc-123!')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(
        screen.getByText('El código solo puede contener letras y números'),
      ).toBeInTheDocument()
    })
  })

  it('fetches GET /api/families/share/[code] and redirects on success', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    })

    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'abc123xy')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/families/share/abc123xy')
      expect(mockAddGroup).toHaveBeenCalledWith('grp-1')
      expect(mockAddGroupToSession).toHaveBeenCalledWith({
        groupId: 'grp-1',
        groupName: 'Clase 2B',
        familyId: 'fam-1',
        familyName: 'Familia García',
        isCreator: false,
        inviteCode: 'invite123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard/grp-1')
    })
  })

  it('shows API error message when family code is invalid', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Código de familia no válido' }),
    })

    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'badcode')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Código de familia no válido')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows generic error on network failure', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'abc123xy')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Error al verificar el código. Intentalo de nuevo.'),
      ).toBeInTheDocument()
    })
  })

  it('shows loading state ("Verificando...") while fetching', async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')

    let resolvePromise!: (v: unknown) => void
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => { resolvePromise = resolve }),
    )

    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'abc123xy')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(screen.getByText('Verificando...')).toBeInTheDocument()
    })

    // clean up
    resolvePromise({ ok: false, json: () => Promise.resolve({ error: 'x' }) })
  })

  it('also calls POST to link user_id when user is authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' }, loading: false })

    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')

    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successPayload),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'abc123xy')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/grp-1')
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/families/share/abc123xy', { method: 'POST' })
  })

  it('does NOT call POST when user is anonymous', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })

    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('tab=familia')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    })

    await renderJoinPage()

    await user.type(screen.getByPlaceholderText('ej: abc123xy'), 'abc123xy')
    await user.click(screen.getByRole('button', { name: /recuperar acceso/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/grp-1')
    })

    const postCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([, opts]) => opts?.method === 'POST',
    )
    expect(postCalls).toHaveLength(0)
  })
})
