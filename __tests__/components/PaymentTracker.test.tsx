import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DirectGiftPaymentTracker,
  GroupGiftPaymentTracker,
} from '@/app/gifts/[shareCode]/PaymentTracker'

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: null }),
  getGroupSession: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/hooks/useIsCoordinator', () => ({
  useIsCoordinator: vi.fn(),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { useIsCoordinator } from '@/lib/hooks/useIsCoordinator'

const mockUseIsCoordinator = vi.mocked(useIsCoordinator)

function makeDirectParticipants(
  overrides: Partial<{ id: string; participant_name: string; joined_at: string; paid: boolean }>[],
) {
  return overrides.map((o, i) => ({
    id: `p-${i + 1}`,
    participant_name: `Participante ${i + 1}`,
    joined_at: '2026-05-01T10:00:00Z',
    paid: false,
    ...o,
  }))
}

function makeGroupParticipants(
  overrides: Partial<{ id: string; family_name: string; joined_at: string; paid: boolean }>[],
) {
  return overrides.map((o, i) => ({
    id: `p-${i + 1}`,
    family_name: `Familia ${i + 1}`,
    joined_at: '2026-05-01T10:00:00Z',
    paid: false,
    ...o,
  }))
}

// ─── DirectGiftPaymentTracker ─────────────────────────────────────────────────

describe('DirectGiftPaymentTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('when isPurchased is false', () => {
    it('shows join date instead of badges', () => {
      const participants = makeDirectParticipants([
        { participant_name: 'Juan', joined_at: '2026-05-01T10:00:00Z', paid: false },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={false}
        />,
      )

      // Should show the join date formatted in es-ES locale
      // The date 2026-05-01 in es-ES is "1/5/2026"
      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.queryByText('Pagado')).not.toBeInTheDocument()
      expect(screen.queryByText('Pendiente')).not.toBeInTheDocument()
    })

    it('does not show payment summary', () => {
      const participants = makeDirectParticipants([{ paid: false }, { paid: true }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={false}
        />,
      )

      expect(screen.queryByText(/han pagado/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/ha pagado/i)).not.toBeInTheDocument()
    })

    it('does not show toggle buttons', () => {
      localStorage.setItem('direct_gift_gift-1_organizer', 'true')
      const participants = makeDirectParticipants([{ paid: false }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={false}
        />,
      )

      expect(screen.queryByRole('button', { name: /marcar pagado/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /desmarcar/i })).not.toBeInTheDocument()
    })
  })

  describe('when isPurchased is true', () => {
    it('shows Pendiente badge for unpaid participant', () => {
      const participants = makeDirectParticipants([
        { participant_name: 'Juan', paid: false },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('shows Pagado badge for paid participant', () => {
      const participants = makeDirectParticipants([
        { participant_name: 'Ana', paid: true },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      expect(screen.getByText('Pagado')).toBeInTheDocument()
    })

    it('shows correct payment summary for multiple participants', () => {
      const participants = makeDirectParticipants([
        { paid: true },
        { paid: false },
        { paid: true },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      expect(screen.getByText('2 de 3 han pagado')).toBeInTheDocument()
    })

    it('shows singular "ha pagado" when there is only 1 participant', () => {
      const participants = makeDirectParticipants([{ paid: true }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      expect(screen.getByText('1 de 1 ha pagado')).toBeInTheDocument()
    })

    it('shows "0 de N han pagado" when nobody has paid', () => {
      const participants = makeDirectParticipants([
        { paid: false },
        { paid: false },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      expect(screen.getByText('0 de 2 han pagado')).toBeInTheDocument()
    })
  })

  describe('organizer detection via localStorage', () => {
    it('does not show toggle buttons when not organizer', () => {
      const participants = makeDirectParticipants([{ paid: false }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      expect(screen.queryByRole('button', { name: /marcar pagado/i })).not.toBeInTheDocument()
    })

    it('shows toggle buttons when organizer flag is in localStorage', async () => {
      localStorage.setItem('direct_gift_gift-1_organizer', 'true')
      const participants = makeDirectParticipants([{ paid: false }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /marcar pagado/i })).toBeInTheDocument()
      })
    })

    it('shows Desmarcar for a paid participant when organizer', async () => {
      localStorage.setItem('direct_gift_gift-1_organizer', 'true')
      const participants = makeDirectParticipants([{ paid: true }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /desmarcar/i })).toBeInTheDocument()
      })
    })
  })

  describe('toggle interactions', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-1_organizer', 'true')
    })

    it('clicking toggle on unpaid calls PUT with paid:true and badge updates to Pagado', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true })

      const participants = makeDirectParticipants([
        { participant_name: 'Juan', paid: false },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /marcar pagado/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /marcar pagado/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/direct/gift-1/participants/pay',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participantName: 'Juan', paid: true }),
          }),
        )
        expect(screen.getByText('Pagado')).toBeInTheDocument()
      })
    })

    it('clicking toggle on paid participant calls PUT with paid:false and badge updates to Pendiente', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true })

      const participants = makeDirectParticipants([
        { participant_name: 'Ana', paid: true },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /desmarcar/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /desmarcar/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/direct/gift-1/participants/pay',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ participantName: 'Ana', paid: false }),
          }),
        )
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
      })
    })

    it('reverts optimistic badge to original state on fetch error', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false })

      const participants = makeDirectParticipants([
        { participant_name: 'Juan', paid: false },
      ])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /marcar pagado/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /marcar pagado/i }))

      // After fetch resolves with ok:false, badge should revert to Pendiente
      await waitFor(() => {
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
        // Toggle button shows the unpaid state again
        expect(screen.getByRole('button', { name: /marcar pagado/i })).toBeInTheDocument()
      })
    })

    it('shows loading indicator "..." while fetch is in progress', async () => {
      const user = userEvent.setup()
      let resolveRequest!: (value: unknown) => void
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => { resolveRequest = resolve }),
      )

      const participants = makeDirectParticipants([{ participant_name: 'Juan', paid: false }])
      render(
        <DirectGiftPaymentTracker
          giftId="gift-1"
          participants={participants}
          isPurchased={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /marcar pagado/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /marcar pagado/i }))

      expect(screen.getByText('...')).toBeInTheDocument()

      resolveRequest({ ok: true })
    })
  })
})

// ─── GroupGiftPaymentTracker ──────────────────────────────────────────────────

describe('GroupGiftPaymentTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
    mockUseIsCoordinator.mockReturnValue(false)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('does not show toggle buttons when useIsCoordinator returns false', () => {
    mockUseIsCoordinator.mockReturnValue(false)
    const participants = makeGroupParticipants([{ paid: false }])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    expect(screen.queryByRole('button', { name: /marcar pagado/i })).not.toBeInTheDocument()
  })

  it('shows toggle buttons when useIsCoordinator returns true', () => {
    mockUseIsCoordinator.mockReturnValue(true)
    const participants = makeGroupParticipants([{ paid: false }])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    expect(screen.getByRole('button', { name: /marcar pagado/i })).toBeInTheDocument()
  })

  it('passes coordinatorId and groupId to useIsCoordinator hook', () => {
    mockUseIsCoordinator.mockReturnValue(false)
    const participants = makeGroupParticipants([])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-99"
        groupId="group-42"
      />,
    )

    expect(mockUseIsCoordinator).toHaveBeenCalledWith('coord-99', 'group-42')
  })

  it('toggle calls correct API path /api/gifts/[giftId]/participants/pay', async () => {
    mockUseIsCoordinator.mockReturnValue(true)
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true })

    const participants = makeGroupParticipants([{ family_name: 'Familia García', paid: false }])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    await user.click(screen.getByRole('button', { name: /marcar pagado/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/gifts/gift-2/participants/pay',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ familyName: 'Familia García', paid: true }),
        }),
      )
    })
  })

  it('shows Pagado and Pendiente badges for respective participants', () => {
    mockUseIsCoordinator.mockReturnValue(false)
    const participants = makeGroupParticipants([
      { family_name: 'Familia García', paid: true },
      { family_name: 'Familia López', paid: false },
    ])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('shows correct summary "1 de 2 han pagado"', () => {
    mockUseIsCoordinator.mockReturnValue(false)
    const participants = makeGroupParticipants([{ paid: true }, { paid: false }])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    expect(screen.getByText('1 de 2 han pagado')).toBeInTheDocument()
  })

  it('toggle on paid participant updates badge to Pendiente', async () => {
    mockUseIsCoordinator.mockReturnValue(true)
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true })

    const participants = makeGroupParticipants([{ family_name: 'Familia García', paid: true }])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    await user.click(screen.getByRole('button', { name: /desmarcar/i }))

    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })
  })

  it('reverts badge on fetch error', async () => {
    mockUseIsCoordinator.mockReturnValue(true)
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false })

    const participants = makeGroupParticipants([{ family_name: 'Familia García', paid: false }])
    render(
      <GroupGiftPaymentTracker
        giftId="gift-2"
        participants={participants}
        isPurchased={true}
        coordinatorId="coord-1"
        groupId="group-1"
      />,
    )

    await user.click(screen.getByRole('button', { name: /marcar pagado/i }))

    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })
  })

  it('handles null coordinatorId gracefully', () => {
    mockUseIsCoordinator.mockReturnValue(false)
    const participants = makeGroupParticipants([{ paid: false }])

    expect(() =>
      render(
        <GroupGiftPaymentTracker
          giftId="gift-2"
          participants={participants}
          isPurchased={true}
          coordinatorId={null}
          groupId="group-1"
        />,
      ),
    ).not.toThrow()
  })
})
