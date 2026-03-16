import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CoordinatorActions } from '@/app/gifts/[shareCode]/CoordinatorActions'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock CloseParticipationButton
vi.mock('@/components/gifts/CloseParticipationButton', () => ({
  CloseParticipationButton: ({ participantCount }: { participantCount: number }) => (
    <button>Cerrar Participación ({participantCount})</button>
  ),
}))

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

const defaultProps = {
  giftId: 'gift-789',
  shareCode: 'xyz123abc',
  giftName: 'Regalo escuela',
  celebrantNames: ['Profesora Ana'],
  coordinatorId: 'family-coord-id',
  groupId: 'group-001',
  participationOpen: true,
  isPurchased: false,
  participantCount: 3,
  participantNames: ['Familia García', 'Familia López', 'Familia Martínez'],
  totalPrice: 90,
}

// Helper to set up coordinator session in localStorage
function setCoordinatorSession() {
  const sessions = [{ groupId: 'group-001', familyId: 'family-coord-id', familyName: 'Familia García' }]
  localStorage.setItem('poolift_groups', JSON.stringify(sessions))
}

describe('CoordinatorActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Detección de coordinador', () => {
    it('no renderiza nada si no es coordinador', () => {
      const { container } = render(<CoordinatorActions {...defaultProps} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renderiza panel si el usuario es coordinador', () => {
      setCoordinatorSession()
      render(<CoordinatorActions {...defaultProps} />)
      expect(screen.getByText('Panel de Coordinador')).toBeInTheDocument()
    })
  })

  describe('Estado abierto', () => {
    beforeEach(() => setCoordinatorSession())

    it('muestra botón Cerrar Participación cuando está abierta', () => {
      render(<CoordinatorActions {...defaultProps} />)
      expect(screen.getByText(/Cerrar Participación/)).toBeInTheDocument()
    })

    it('muestra botón Finalizar Compra cuando está cerrada', () => {
      render(<CoordinatorActions {...defaultProps} participationOpen={false} />)
      expect(screen.getByRole('link', { name: /Finalizar Compra/i })).toBeInTheDocument()
    })
  })

  describe('Estado comprado', () => {
    beforeEach(() => setCoordinatorSession())

    it('muestra mensaje de finalizado', () => {
      render(<CoordinatorActions {...defaultProps} isPurchased={true} />)
      expect(screen.getByText('El regalo ha sido comprado y finalizado.')).toBeInTheDocument()
    })
  })

  describe('Merge de participantes duplicados', () => {
    beforeEach(() => setCoordinatorSession())

    it('botón fusionar no visible con menos de 2 participantes', () => {
      render(<CoordinatorActions {...defaultProps} participantCount={1} participantNames={['Familia García']} />)
      expect(screen.queryByRole('button', { name: /Fusionar/i })).not.toBeInTheDocument()
    })

    it('botón fusionar visible con 2+ participantes y participación abierta', () => {
      render(<CoordinatorActions {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Fusionar participantes duplicados/i })).toBeInTheDocument()
    })

    it('botón fusionar no visible cuando participación está cerrada', () => {
      render(<CoordinatorActions {...defaultProps} participationOpen={false} />)
      expect(screen.queryByRole('button', { name: /Fusionar/i })).not.toBeInTheDocument()
    })

    it('abre modal de fusión al hacer clic en el botón', async () => {
      const user = userEvent.setup()
      render(<CoordinatorActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Fusionar participantes duplicados/i }))

      expect(screen.getAllByText('Fusionar participantes duplicados').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Mantener')).toBeInTheDocument()
      expect(screen.getByText('Eliminar (duplicado)')).toBeInTheDocument()
    })

    it('muestra advertencia con mismo participante en ambos selects', async () => {
      const user = userEvent.setup()
      render(<CoordinatorActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Fusionar participantes duplicados/i }))

      const selects = screen.getAllByRole('combobox')
      await user.selectOptions(selects[1], 'Familia García')

      expect(screen.getByText('Selecciona dos participantes distintos')).toBeInTheDocument()
    })

    it('botón Fusionar deshabilitado con mismo participante', async () => {
      const user = userEvent.setup()
      render(<CoordinatorActions {...defaultProps} participantNames={['Familia García', 'Familia López']} />)

      await user.click(screen.getByRole('button', { name: /Fusionar participantes duplicados/i }))

      const selects = screen.getAllByRole('combobox')
      await user.selectOptions(selects[1], 'Familia García')

      expect(screen.getByRole('button', { name: 'Fusionar' })).toBeDisabled()
    })

    it('llama al API correcto al confirmar merge', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, kept: 'Familia García', removed: 'Familia López' }),
      })

      render(<CoordinatorActions {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: /Fusionar participantes duplicados/i }))

      await user.click(screen.getByRole('button', { name: 'Fusionar' }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/gifts/gift-789/participants/merge',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('"keep"'),
          })
        )
      })
    })

    it('muestra error del API en el modal', async () => {
      const user = userEvent.setup()
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Participante no encontrado' }),
      })

      render(<CoordinatorActions {...defaultProps} participantNames={['Familia García', 'Familia López']} />)

      await user.click(screen.getByRole('button', { name: /Fusionar participantes duplicados/i }))

      await user.click(screen.getByRole('button', { name: 'Fusionar' }))

      await waitFor(() => {
        expect(screen.getByText('Participante no encontrado')).toBeInTheDocument()
      })
    })
  })
})
