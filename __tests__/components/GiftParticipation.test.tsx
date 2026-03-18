import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GiftParticipation } from '@/app/gifts/[shareCode]/GiftParticipation'

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

const defaultProps = {
  giftId: 'gift-456',
  participationOpen: true,
  isPurchased: false,
  coordinatorName: null,
  groupId: null,
  participants: [],
}

describe('GiftParticipation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Estado inicial - participación abierta', () => {
    it('renderiza formulario cuando participación está abierta', () => {
      render(<GiftParticipation {...defaultProps} />)

      expect(screen.getByText('Apúntate al Regalo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('ej: Familia García')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Apuntarme/i })).toBeInTheDocument()
    })

    it('botón deshabilitado con nombre vacío', () => {
      render(<GiftParticipation {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Apuntarme/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /No voy a participar/i })).toBeDisabled()
    })

    it('botones habilitados con nombre válido', async () => {
      const user = userEvent.setup()
      render(<GiftParticipation {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('ej: Familia García'), 'Familia García')

      expect(screen.getByRole('button', { name: /Apuntarme/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /No voy a participar/i })).not.toBeDisabled()
    })
  })

  describe('Proceso de apuntarse', () => {
    it('llama API y guarda en localStorage al apuntarse', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ participant: { id: '1' } }),
      })

      render(<GiftParticipation {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('ej: Familia García'), 'Familia García')
      await user.click(screen.getByRole('button', { name: /Apuntarme/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/gift-456/participate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ familyName: 'Familia García' }),
          })
        )
        expect(localStorage.getItem('gift_gift-456_family')).toBe(
          JSON.stringify({ name: 'Familia García', status: 'joined' })
        )
      })
    })
  })

  describe('Estado ya apuntado', () => {
    beforeEach(() => {
      localStorage.setItem(
        'gift_gift-456_family',
        JSON.stringify({ name: 'Familia García', status: 'joined' })
      )
    })

    it('muestra estado apuntado desde localStorage (JSON)', () => {
      render(<GiftParticipation {...defaultProps} />)

      expect(screen.getByText('¡Estás apuntado!')).toBeInTheDocument()
      expect(screen.getByText('Familia García')).toBeInTheDocument()
    })

    it('muestra botones Salirme y Ya no puedo participar', () => {
      render(<GiftParticipation {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Salirme del regalo/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ya no puedo participar/i })).toBeInTheDocument()
    })
  })

  describe('Compat: localStorage legacy string', () => {
    beforeEach(() => {
      // Legacy format — plain string
      localStorage.setItem('gift_gift-456_family', 'Familia García')
    })

    it('lee correctamente el formato antiguo (string plano)', () => {
      render(<GiftParticipation {...defaultProps} />)

      expect(screen.getByText('¡Estás apuntado!')).toBeInTheDocument()
      expect(screen.getByText('Familia García')).toBeInTheDocument()
    })
  })

  describe('Participación cerrada', () => {
    it('muestra mensaje de cerrado', () => {
      render(<GiftParticipation {...defaultProps} participationOpen={false} />)

      expect(screen.getByText('La participación está cerrada')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Apuntarme/i })).not.toBeInTheDocument()
    })
  })

  describe('Flujo de declinar', () => {
    it('llama API con declined:true y muestra estado declinado', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ participant: { id: '1', status: 'declined' } }),
      })

      render(<GiftParticipation {...defaultProps} />)

      await user.type(screen.getByPlaceholderText('ej: Familia García'), 'Familia Pérez')
      await user.click(screen.getByRole('button', { name: /No voy a participar/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/gift-456/participate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ familyName: 'Familia Pérez', declined: true }),
          })
        )
        expect(localStorage.getItem('gift_gift-456_family')).toBe(
          JSON.stringify({ name: 'Familia Pérez', status: 'declined' })
        )
        expect(screen.getByText('No vas a participar')).toBeInTheDocument()
      })
    })

    it('muestra estado declinado desde localStorage', () => {
      localStorage.setItem(
        'gift_gift-456_family',
        JSON.stringify({ name: 'Familia Pérez', status: 'declined' })
      )

      render(<GiftParticipation {...defaultProps} />)

      expect(screen.getByText('No vas a participar')).toBeInTheDocument()
      expect(screen.getByText('Familia Pérez')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cambié de opinión — Unirme/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Quitar mi respuesta/i })).toBeInTheDocument()
    })

    it('desde estado declinado, Cambié de opinión llama API con joined y recarga', async () => {
      localStorage.setItem(
        'gift_gift-456_family',
        JSON.stringify({ name: 'Familia Pérez', status: 'declined' })
      )
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ participant: { id: '1', status: 'joined' } }),
      })

      render(<GiftParticipation {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cambié de opinión — Unirme/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/gift-456/participate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ familyName: 'Familia Pérez' }),
          })
        )
        expect(mockReload).toHaveBeenCalled()
      })
    })

    it('desde estado unido, Ya no puedo participar cambia a declinado sin recargar', async () => {
      localStorage.setItem(
        'gift_gift-456_family',
        JSON.stringify({ name: 'Familia García', status: 'joined' })
      )
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ participant: { id: '1', status: 'declined' } }),
      })

      render(<GiftParticipation {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Ya no puedo participar/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/gift-456/participate',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ familyName: 'Familia García', declined: true }),
          })
        )
        expect(screen.getByText('No vas a participar')).toBeInTheDocument()
      })
      expect(mockReload).not.toHaveBeenCalled()
    })
  })

  describe('Detección "ya representado"', () => {
    const participantsWithFamilies = [
      { id: 'p-1', family_name: 'Familia García', status: 'joined' as const },
      { id: 'p-2', family_name: 'Familia López', status: 'joined' as const },
    ]

    it('muestra links "Soy de esta familia" cuando hay participantes joined', () => {
      render(<GiftParticipation {...defaultProps} participants={participantsWithFamilies} />)

      expect(screen.getByText('¿Tu familia ya está apuntada?')).toBeInTheDocument()
      expect(screen.getByText('Soy de Familia García →')).toBeInTheDocument()
      expect(screen.getByText('Soy de Familia López →')).toBeInTheDocument()
    })

    it('no muestra links de participantes declinados', () => {
      const mixed = [
        { id: 'p-1', family_name: 'Familia García', status: 'joined' as const },
        { id: 'p-2', family_name: 'Familia López', status: 'declined' as const },
      ]
      render(<GiftParticipation {...defaultProps} participants={mixed} />)

      expect(screen.getByText('Soy de Familia García →')).toBeInTheDocument()
      expect(screen.queryByText('Soy de Familia López →')).not.toBeInTheDocument()
    })

    it('no muestra links si no hay participantes', () => {
      render(<GiftParticipation {...defaultProps} participants={[]} />)

      expect(screen.queryByText('¿Tu familia ya está apuntada?')).not.toBeInTheDocument()
    })

    it('click en "Soy de esta familia" muestra banner de representación', async () => {
      const user = userEvent.setup()
      render(<GiftParticipation {...defaultProps} participants={participantsWithFamilies} />)

      await user.click(screen.getByText('Soy de Familia García →'))

      expect(screen.getByText('Tu familia ya está representada')).toBeInTheDocument()
      expect(screen.getByText('Familia García')).toBeInTheDocument()
      expect(screen.getByText('No necesitas apuntarte de nuevo')).toBeInTheDocument()
    })

    it('click guarda en localStorage y oculta el form', async () => {
      const user = userEvent.setup()
      render(<GiftParticipation {...defaultProps} participants={participantsWithFamilies} />)

      await user.click(screen.getByText('Soy de Familia García →'))

      expect(localStorage.getItem('gift_gift-456_represented_by')).toBe('Familia García')
      expect(screen.queryByRole('button', { name: /Apuntarme/i })).not.toBeInTheDocument()
    })

    it('muestra banner si localStorage ya tiene represented_by en mount', () => {
      localStorage.setItem('gift_gift-456_represented_by', 'Familia García')

      render(<GiftParticipation {...defaultProps} participants={participantsWithFamilies} />)

      expect(screen.getByText('Tu familia ya está representada')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Apuntarme/i })).not.toBeInTheDocument()
    })

    it('no muestra links si el usuario ya está unido', () => {
      localStorage.setItem(
        'gift_gift-456_family',
        JSON.stringify({ name: 'Familia García', status: 'joined' })
      )

      render(<GiftParticipation {...defaultProps} participants={participantsWithFamilies} />)

      expect(screen.queryByText('¿Tu familia ya está apuntada?')).not.toBeInTheDocument()
      expect(screen.getByText('¡Estás apuntado!')).toBeInTheDocument()
    })
  })
})
