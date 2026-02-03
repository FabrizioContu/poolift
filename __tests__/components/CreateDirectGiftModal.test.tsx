import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateDirectGiftModal } from '@/components/modals/CreateDirectGiftModal'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
}

describe('CreateDirectGiftModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renderiza correctamente cuando esta abierto', () => {
    render(<CreateDirectGiftModal {...defaultProps} />)

    expect(screen.getByText('Regalo Directo')).toBeInTheDocument()
    expect(screen.getByText('Para quien es el regalo? *')).toBeInTheDocument()
    expect(screen.getByText('Tipo de ocasion *')).toBeInTheDocument()
    expect(screen.getByText('Que regalo propones? (opcional)')).toBeInTheDocument()
    expect(screen.getByText('Precio estimado (opcional)')).toBeInTheDocument()
    expect(screen.getByText('Tu nombre *')).toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    render(<CreateDirectGiftModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Regalo Directo')).not.toBeInTheDocument()
  })

  it('muestra el select de ocasion con opciones', () => {
    render(<CreateDirectGiftModal {...defaultProps} />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    // Check select has options (checking by value since emojis may render differently)
    const options = within(select).getAllByRole('option')
    expect(options.length).toBe(6) // 6 occasion types
  })

  it('llama onClose cuando se hace clic en Cancelar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<CreateDirectGiftModal isOpen={true} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('valida campos requeridos - nombre destinatario vacio', async () => {
    render(<CreateDirectGiftModal {...defaultProps} />)

    const recipientInput = screen.getByPlaceholderText(
      'ej: Laura (despedida) / Ana y Pedro (boda)'
    )
    expect(recipientInput).toBeRequired()
  })

  it('valida campos requeridos - nombre organizador vacio', async () => {
    render(<CreateDirectGiftModal {...defaultProps} />)

    const organizerInput = screen.getByPlaceholderText('ej: Maria')
    expect(organizerInput).toBeRequired()
  })

  it('envia formulario correctamente con datos validos', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      id: 'gift-123',
      share_code: 'abc123xyz',
      recipient_name: 'Laura',
      occasion: 'farewell',
      organizer_name: 'Maria',
    }

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<CreateDirectGiftModal {...defaultProps} />)

    // Fill form
    await user.type(
      screen.getByPlaceholderText('ej: Laura (despedida) / Ana y Pedro (boda)'),
      'Laura'
    )
    await user.selectOptions(screen.getByRole('combobox'), 'farewell')
    await user.type(
      screen.getByPlaceholderText('ej: Experiencia spa, vale Amazon...'),
      'Vale Amazon 50'
    )
    await user.type(screen.getByPlaceholderText('50'), '50')
    await user.type(screen.getByPlaceholderText('ej: Maria'), 'Maria')

    // Submit
    await user.click(screen.getByRole('button', { name: 'Crear Regalo' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/gifts/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: 'Laura',
          occasion: 'farewell',
          giftIdea: 'Vale Amazon 50',
          estimatedPrice: 50,
          organizerName: 'Maria',
        }),
      })
    })
  })

  it('muestra pantalla de exito despues de crear regalo', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      id: 'gift-123',
      share_code: 'abc123xyz456',
      recipient_name: 'Laura',
    }

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<CreateDirectGiftModal {...defaultProps} />)

    // Fill required fields
    await user.type(
      screen.getByPlaceholderText('ej: Laura (despedida) / Ana y Pedro (boda)'),
      'Laura'
    )
    await user.type(screen.getByPlaceholderText('ej: Maria'), 'Maria')

    // Submit
    await user.click(screen.getByRole('button', { name: 'Crear Regalo' }))

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Regalo Creado!')).toBeInTheDocument()
    })

    // Check share code is displayed
    expect(screen.getByText('abc123xyz456')).toBeInTheDocument()
    expect(screen.getByText('Copiar Link')).toBeInTheDocument()
    expect(screen.getByText('Compartir por WhatsApp')).toBeInTheDocument()
  })

  it('maneja errores del servidor correctamente', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Error del servidor' }),
    })

    render(<CreateDirectGiftModal {...defaultProps} />)

    // Fill required fields
    await user.type(
      screen.getByPlaceholderText('ej: Laura (despedida) / Ana y Pedro (boda)'),
      'Laura'
    )
    await user.type(screen.getByPlaceholderText('ej: Maria'), 'Maria')

    // Submit
    await user.click(screen.getByRole('button', { name: 'Crear Regalo' }))

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument()
    })
  })

  it('muestra estado de carga durante submit', async () => {
    const user = userEvent.setup()

    // Slow response
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ share_code: 'abc123' }),
              }),
            100
          )
        )
    )

    render(<CreateDirectGiftModal {...defaultProps} />)

    // Fill required fields
    await user.type(
      screen.getByPlaceholderText('ej: Laura (despedida) / Ana y Pedro (boda)'),
      'Laura'
    )
    await user.type(screen.getByPlaceholderText('ej: Maria'), 'Maria')

    // Submit
    await user.click(screen.getByRole('button', { name: 'Crear Regalo' }))

    // Should show loading state
    expect(screen.getByText('Creando...')).toBeInTheDocument()
  })

  it('permite cambiar el tipo de ocasion', async () => {
    const user = userEvent.setup()

    render(<CreateDirectGiftModal {...defaultProps} />)

    const select = screen.getByRole('combobox')

    // Change to wedding
    await user.selectOptions(select, 'wedding')
    expect(select).toHaveValue('wedding')

    // Change to graduation
    await user.selectOptions(select, 'graduation')
    expect(select).toHaveValue('graduation')
  })

  it('acepta precio decimal', async () => {
    const user = userEvent.setup()
    const mockResponse = { share_code: 'abc123' }

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<CreateDirectGiftModal {...defaultProps} />)

    // Fill form with decimal price
    await user.type(
      screen.getByPlaceholderText('ej: Laura (despedida) / Ana y Pedro (boda)'),
      'Test'
    )
    await user.type(screen.getByPlaceholderText('50'), '49.99')
    await user.type(screen.getByPlaceholderText('ej: Maria'), 'Maria')

    await user.click(screen.getByRole('button', { name: 'Crear Regalo' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
      const callBody = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      )
      expect(callBody.estimatedPrice).toBe(49.99)
    })
  })

  it('envia null para campos opcionales vacios', async () => {
    const user = userEvent.setup()
    const mockResponse = { share_code: 'abc123' }

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<CreateDirectGiftModal {...defaultProps} />)

    // Only fill required fields
    await user.type(
      screen.getByPlaceholderText('ej: Laura (despedida) / Ana y Pedro (boda)'),
      'Laura'
    )
    await user.type(screen.getByPlaceholderText('ej: Maria'), 'Maria')

    await user.click(screen.getByRole('button', { name: 'Crear Regalo' }))

    await waitFor(() => {
      const callBody = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      )
      expect(callBody.giftIdea).toBeNull()
      expect(callBody.estimatedPrice).toBeNull()
    })
  })
})
