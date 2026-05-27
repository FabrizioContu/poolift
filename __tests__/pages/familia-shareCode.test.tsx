import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

// ──────────────────────────────────────────────
// Navigation mocks
// ──────────────────────────────────────────────

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ shareCode: 'abc123xy' }),
  useSearchParams: () => new URLSearchParams(),
}))

// ──────────────────────────────────────────────
// Auth + storage mocks
// ──────────────────────────────────────────────

const mockAddGroupToSession = vi.fn()
const mockAddGroup = vi.fn()
const mockUseAuth = vi.fn().mockReturnValue({ user: null, loading: false })

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
// Shared fixture
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

async function renderPage() {
  const { default: FamiliaShareCodePage } = await import('@/app/familia/[shareCode]/page')
  return render(<FamiliaShareCodePage />)
}

// ──────────────────────────────────────────────
// Suite — real timers (most tests)
// ──────────────────────────────────────────────

describe('FamiliaShareCodePage — real timers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockUseAuth.mockReturnValue({ user: null, loading: false })
  })

  it('shows loading state initially', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {}), // never resolves
    )

    await renderPage()

    expect(screen.getByText('Verificando tu código...')).toBeInTheDocument()
  })

  it('calls anonymousStorage.addGroup and addGroupToSession on success', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    })

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('¡Acceso restaurado!')).toBeInTheDocument()
    })

    expect(mockAddGroup).toHaveBeenCalledWith('grp-1')
    expect(mockAddGroupToSession).toHaveBeenCalledWith({
      groupId: 'grp-1',
      groupName: 'Clase 2B',
      familyId: 'fam-1',
      familyName: 'Familia García',
      isCreator: false,
      inviteCode: 'invite123',
    })
  })

  it('shows success UI with "Acceso restaurado" and dashboard link', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    })

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('¡Acceso restaurado!')).toBeInTheDocument()
      expect(screen.getByText('Redirigiendo al dashboard...')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: 'Ir ahora' })).toHaveAttribute(
      'href',
      '/dashboard/grp-1',
    )
  })

  it('shows error state with "Código inválido" heading and retry link on API failure', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Código de familia no válido' }),
    })

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('Código inválido')).toBeInTheDocument()
      expect(screen.getByText('Código de familia no válido')).toBeInTheDocument()
    })

    expect(
      screen.getByRole('link', { name: 'Intentar con otro código' }),
    ).toHaveAttribute('href', '/join?tab=familia')
  })

  it('shows "Código inválido" heading when API returns no error field', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    })

    await renderPage()

    await waitFor(() => {
      // The h1 and the <p> both say "Código inválido" when no error field is provided
      const matches = screen.getAllByText('Código inválido')
      expect(matches.length).toBeGreaterThanOrEqual(1)
      // Specifically the heading
      expect(screen.getByRole('heading', { name: 'Código inválido' })).toBeInTheDocument()
    })
  })

  it('shows error state when fetch throws (network error)', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error'),
    )

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('Código inválido')).toBeInTheDocument()
      expect(
        screen.getByText('Error al verificar el código. Intentalo de nuevo.'),
      ).toBeInTheDocument()
    })
  })

  it('also calls POST to link user_id when user is authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-123' }, loading: false })

    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successPayload),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('¡Acceso restaurado!')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/families/share/abc123xy', { method: 'POST' })
  })

  it('does NOT call POST when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    })

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('¡Acceso restaurado!')).toBeInTheDocument()
    })

    const postCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([, opts]) => opts?.method === 'POST',
    )
    expect(postCalls).toHaveLength(0)
  })
})

// ──────────────────────────────────────────────
// Suite — redirect timing (spies on setTimeout)
// ──────────────────────────────────────────────

describe('FamiliaShareCodePage — redirect timing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockUseAuth.mockReturnValue({ user: null, loading: false })
  })

  it('calls router.push after success (via real timer — waits > 1500ms)', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(successPayload),
    })

    await renderPage()

    await waitFor(() => {
      expect(screen.getByText('¡Acceso restaurado!')).toBeInTheDocument()
    })

    // router.push is called inside a 1500ms setTimeout.
    // Wait up to 2500ms for it to fire.
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/grp-1')
      },
      { timeout: 2500 },
    )
  })
})
