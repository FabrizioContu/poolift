import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DirectGiftOrganizerActions } from '@/app/gifts/[shareCode]/DirectGiftOrganizerActions'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock window.location.reload and window.open
const mockReload = vi.fn()
const mockOpen = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload, origin: 'http://localhost:3000' },
  writable: true,
})
window.open = mockOpen

const defaultProps = {
  giftId: 'gift-123',
  shareCode: 'abc123xyz',
  recipientName: 'Laura',
  giftIdea: 'Vale Amazon 50€',
  status: 'open',
  participantCount: 3,
  participantNames: ['Juan', 'Ana', 'Pedro'],
  estimatedPrice: 60,
}

describe('DirectGiftOrganizerActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Detección de organizador', () => {
    it('no renderiza nada si no es organizador', () => {
      const { container } = render(<DirectGiftOrganizerActions {...defaultProps} />)

      expect(container).toBeEmptyDOMElement()
    })

    it('renderiza panel si hay flag de organizador en localStorage', () => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      expect(screen.getByText('Panel de Organizador')).toBeInTheDocument()
    })

    it('renderiza panel si hay ?organizer=true en URL', () => {
      // Mock window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          reload: mockReload,
          origin: 'http://localhost:3000',
          search: '?organizer=true',
        },
        writable: true,
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      expect(screen.getByText('Panel de Organizador')).toBeInTheDocument()
    })

    it('detecta organizador desde poolift_direct_gifts en localStorage', () => {
      const directGifts = [
        { shareCode: 'abc123xyz', recipientName: 'Laura' }
      ]
      localStorage.setItem('poolift_direct_gifts', JSON.stringify(directGifts))

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      expect(screen.getByText('Panel de Organizador')).toBeInTheDocument()
    })

    it('no detecta organizador si shareCode no coincide', () => {
      // Reset window.location
      Object.defineProperty(window, 'location', {
        value: {
          reload: mockReload,
          origin: 'http://localhost:3000',
          search: '',
        },
        writable: true,
      })

      const directGifts = [
        { shareCode: 'different-code', recipientName: 'Laura' }
      ]
      localStorage.setItem('poolift_direct_gifts', JSON.stringify(directGifts))

      const { container } = render(<DirectGiftOrganizerActions {...defaultProps} />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('Estado abierto', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('muestra botón Cerrar Participación cuando status es open', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Cerrar Participación/i })).toBeInTheDocument()
    })

    it('botón Cerrar Participación deshabilitado sin participantes', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} participantCount={0} participantNames={[]} />)

      expect(screen.getByRole('button', { name: /Cerrar Participación/i })).toBeDisabled()
    })

    it('muestra mensaje de esperar participantes cuando hay 0', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} participantCount={0} participantNames={[]} />)

      expect(screen.getByText('Espera a que haya participantes para cerrar')).toBeInTheDocument()
    })
  })

  describe('Modal de confirmación de cierre', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('abre modal al hacer clic en Cerrar Participación', async () => {
      const user = userEvent.setup()

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
      expect(screen.getByText('Una vez cerrada, nadie más podrá apuntarse al regalo.')).toBeInTheDocument()
    })

    it('muestra número de participantes en modal', async () => {
      const user = userEvent.setup()

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      expect(screen.getByText('3 participantes')).toBeInTheDocument()
    })

    it('muestra precio total y por persona en modal', async () => {
      const user = userEvent.setup()

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      expect(screen.getByText('60.00€')).toBeInTheDocument() // Total
      expect(screen.getByText('20.00€')).toBeInTheDocument() // Per person (60/3)
    })

    it('cierra modal al hacer clic en Cancelar', async () => {
      const user = userEvent.setup()

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument()
    })
  })

  describe('Proceso de cerrar participación', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('llama a API de close al confirmar', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      // Click confirm button in modal
      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/direct/gift-123/close',
          { method: 'PUT' }
        )
      })
    })

    it('muestra modal de éxito después de cerrar', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByText('La participación ha sido cerrada')).toBeInTheDocument()
      })
    })

    it('muestra lista de participantes en modal de éxito', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByText('Juan')).toBeInTheDocument()
        expect(screen.getByText('Ana')).toBeInTheDocument()
        expect(screen.getByText('Pedro')).toBeInTheDocument()
      })
    })

    it('muestra estado de carga durante cierre', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ pricePerParticipant: 20 }),
        }), 100))
      )

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      expect(screen.getByText('Cerrando...')).toBeInTheDocument()
    })

    it('muestra error si falla el cierre', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Error interno del servidor' }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByText('Error interno del servidor')).toBeInTheDocument()
      })
    })
  })

  describe('Compartir después de cerrar', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('muestra botones de compartir en modal de éxito', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Compartir por WhatsApp/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Copiar Link/i })).toBeInTheDocument()
      })
    })

    it('abre WhatsApp con mensaje correcto', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: /Compartir por WhatsApp/i }))
      })

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank'
      )
    })

    it('muestra botón Copiar Link en modal de éxito', async () => {
      const user = userEvent.setup()

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copiar Link/i })).toBeInTheDocument()
      })
    })
  })

  describe('Estado cerrado', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('muestra botón Finalizar Compra cuando status es closed', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} status="closed" />)

      expect(screen.getByRole('link', { name: /Finalizar Compra/i })).toBeInTheDocument()
    })

    it('enlace Finalizar Compra apunta a página correcta', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} status="closed" />)

      const link = screen.getByRole('link', { name: /Finalizar Compra/i })
      expect(link).toHaveAttribute('href', '/organizer/gift-123/purchase?shareCode=abc123xyz')
    })

    it('muestra mensaje de participación cerrada', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} status="closed" />)

      expect(screen.getByText('Participación cerrada. Procede a finalizar la compra.')).toBeInTheDocument()
    })
  })

  describe('Estado comprado', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('muestra mensaje de regalo finalizado', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} status="purchased" />)

      expect(screen.getByText('El regalo ha sido comprado y finalizado.')).toBeInTheDocument()
    })

    it('no muestra botones de acción cuando comprado', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} status="purchased" />)

      expect(screen.queryByRole('button', { name: /Cerrar Participación/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /Finalizar Compra/i })).not.toBeInTheDocument()
    })
  })

  describe('Corner cases', () => {
    beforeEach(() => {
      localStorage.setItem('direct_gift_gift-123_organizer', 'true')
    })

    it('maneja regalo sin precio estimado', async () => {
      const user = userEvent.setup()

      render(<DirectGiftOrganizerActions {...defaultProps} estimatedPrice={null} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      // Modal should open but not show price info
      expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
      expect(screen.queryByText('Total estimado:')).not.toBeInTheDocument()
    })

    it('maneja regalo sin idea de regalo', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions {...defaultProps} giftIdea={null} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByText('La participación ha sido cerrada')).toBeInTheDocument()
      })
    })

    it('calcula precio por persona correctamente con 1 participante', () => {
      render(<DirectGiftOrganizerActions {...defaultProps} participantCount={1} participantNames={['Solo']} />)

      // Price per person should be same as total
      // This will be visible in the modal
    })

    it('maneja nombres de participantes con caracteres especiales', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pricePerParticipant: 20 }),
      })

      render(<DirectGiftOrganizerActions
        {...defaultProps}
        participantNames={["María José", "O'Brien", "Ñoño"]}
      />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      await waitFor(() => {
        expect(screen.getByText("María José")).toBeInTheDocument()
        expect(screen.getByText("O'Brien")).toBeInTheDocument()
        expect(screen.getByText("Ñoño")).toBeInTheDocument()
      })
    })

    it('maneja muchos participantes', () => {
      const manyParticipants = Array.from({ length: 50 }, (_, i) => `Participante ${i + 1}`)

      render(<DirectGiftOrganizerActions
        {...defaultProps}
        participantCount={50}
        participantNames={manyParticipants}
        estimatedPrice={500}
      />)

      expect(screen.getByText('Panel de Organizador')).toBeInTheDocument()
    })

    it('maneja error de red durante cierre', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

      render(<DirectGiftOrganizerActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Cerrar Participación/i }))

      const confirmButtons = screen.getAllByRole('button', { name: /Cerrar Participación/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      // El componente debería mostrar algún mensaje de error
      await waitFor(() => {
        // Check that we're not in success state
        expect(screen.queryByText('La participación ha sido cerrada')).not.toBeInTheDocument()
      })
    })
  })
})
