import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PartyInviteButton } from '@/components/parties/PartyInviteButton'

const defaultProps = {
  celebrantNames: ['Juan', 'Gina'],
  partyDate: '10 de octubre de 2026',
  groupName: 'Clase 2B',
  inviteCode: 'ABC123XYZ456',
}

describe('PartyInviteButton', () => {
  let openSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    openSpy = vi.fn()
    window.open = openSpy as unknown as typeof window.open
  })

  it('abre WhatsApp con el código de invitación y los celebrantes (variant full)', async () => {
    const user = userEvent.setup()
    render(<PartyInviteButton {...defaultProps} variant="full" />)

    const button = screen.getByRole('button', { name: /invitar por whatsapp/i })
    await user.click(button)

    expect(openSpy).toHaveBeenCalledTimes(1)
    const [url, target] = openSpy.mock.calls[0]
    expect(target).toBe('_blank')
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/)

    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('ABC123XYZ456')
    expect(decoded).toContain('Juan')
    expect(decoded).toContain('Gina')
    expect(decoded).toContain('Clase 2B')
    expect(decoded).toContain('/join/ABC123XYZ456')
  })

  it('renderiza variant icon con label accesible', async () => {
    const user = userEvent.setup()
    render(<PartyInviteButton {...defaultProps} variant="icon" />)

    const button = screen.getByRole('button', { name: /invitar por whatsapp/i })
    await user.click(button)

    expect(openSpy).toHaveBeenCalledTimes(1)
  })
})
