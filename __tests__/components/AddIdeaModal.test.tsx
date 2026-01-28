import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddIdeaModal } from '@/components/modals/AddIdeaModal'

const mockCelebrants = [
  { birthday_id: 'b1', birthdays: { id: 'b1', child_name: 'Juan' } },
  { birthday_id: 'b2', birthdays: { id: 'b2', child_name: 'María' } },
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  partyId: 'party-123',
  onSuccess: vi.fn(),
}

describe('AddIdeaModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renderiza correctamente cuando está abierto', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    expect(screen.getByText('Nueva Idea de Regalo')).toBeInTheDocument()
    expect(screen.getByText('Celebrante')).toBeInTheDocument()
    expect(screen.getByText('Nombre del producto')).toBeInTheDocument()
    expect(screen.getByText(/Link del producto/)).toBeInTheDocument()
    expect(screen.getByText(/Precio aproximado/)).toBeInTheDocument()
    expect(screen.getByText(/Comentario/)).toBeInTheDocument()
    expect(screen.getByText('Tu nombre de familia')).toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    render(<AddIdeaModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Nueva Idea de Regalo')).not.toBeInTheDocument()
  })

  it('carga y muestra los celebrantes', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('María')).toBeInTheDocument()
    })
  })

  it('muestra mensaje cuando no hay celebrantes', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: [] }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('No hay celebrantes en esta fiesta')).toBeInTheDocument()
    })
  })

  it('muestra error de validación cuando no se selecciona celebrante', async () => {
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    // El error aparece en un div con clase específica
    const errorDiv = screen.getByText('Selecciona un celebrante', {
      selector: '.bg-red-50',
    })
    expect(errorDiv).toBeInTheDocument()
  })

  it('muestra error de validación cuando nombre producto es muy corto', async () => {
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    // Seleccionar celebrante
    const celebrantSelect = screen.getByRole('combobox')
    await user.selectOptions(celebrantSelect, 'b1')

    // Escribir nombre muy corto
    const productInput = screen.getByPlaceholderText(/LEGO Star Wars/i)
    await user.type(productInput, 'AB')

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    expect(screen.getByText('El nombre del producto debe tener al menos 3 caracteres')).toBeInTheDocument()
  })

  it('muestra error de validación cuando precio es inválido', async () => {
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    // Seleccionar celebrante
    const celebrantSelect = screen.getByRole('combobox')
    await user.selectOptions(celebrantSelect, 'b1')

    // Escribir nombre válido
    const productInput = screen.getByPlaceholderText(/LEGO Star Wars/i)
    await user.type(productInput, 'Juguete de prueba')

    // Escribir precio inválido (0 no es mayor a 0)
    const priceInput = screen.getByPlaceholderText('0.00')
    await user.clear(priceInput)
    await user.type(priceInput, '0')

    // Escribir nombre familia
    const familyInput = screen.getByPlaceholderText(/Familia García/i)
    await user.type(familyInput, 'Familia Test')

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument()
  })

  it('muestra error de validación cuando falta nombre de familia', async () => {
    const user = userEvent.setup()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    // Seleccionar celebrante
    const celebrantSelect = screen.getByRole('combobox')
    await user.selectOptions(celebrantSelect, 'b1')

    // Escribir nombre válido
    const productInput = screen.getByPlaceholderText(/LEGO Star Wars/i)
    await user.type(productInput, 'Juguete de prueba')

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    expect(screen.getByText('El nombre de familia es requerido')).toBeInTheDocument()
  })

  it('envía formulario correctamente con datos válidos', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onClose = vi.fn()

    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ celebrants: mockCelebrants }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ idea: { id: 'idea-1' } }),
      })

    render(<AddIdeaModal {...defaultProps} onSuccess={onSuccess} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    // Seleccionar celebrante
    const celebrantSelect = screen.getByRole('combobox')
    await user.selectOptions(celebrantSelect, 'b1')

    // Llenar formulario
    const productInput = screen.getByPlaceholderText(/LEGO Star Wars/i)
    await user.type(productInput, 'Juguete de prueba')

    const familyInput = screen.getByPlaceholderText(/Familia García/i)
    await user.type(familyInput, 'Familia Test')

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('¡Idea añadida correctamente!')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/ideas', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('maneja errores del servidor correctamente', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ celebrants: mockCelebrants }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Error del servidor' }),
      })

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    // Seleccionar celebrante
    const celebrantSelect = screen.getByRole('combobox')
    await user.selectOptions(celebrantSelect, 'b1')

    // Llenar formulario
    const productInput = screen.getByPlaceholderText(/LEGO Star Wars/i)
    await user.type(productInput, 'Juguete de prueba')

    const familyInput = screen.getByPlaceholderText(/Familia García/i)
    await user.type(familyInput, 'Familia Test')

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument()
    })
  })

  it('llama onClose al hacer clic en Cancelar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} onClose={onClose} />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('tiene el icono Lightbulb', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ celebrants: mockCelebrants }),
    })

    render(<AddIdeaModal {...defaultProps} />)

    expect(screen.getByText('Sugiere una idea para el regalo')).toBeInTheDocument()
  })

  it('muestra estado de carga al cargar celebrantes', () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves to simulate loading
    )

    render(<AddIdeaModal {...defaultProps} />)

    expect(screen.getByText('Cargando celebrantes...')).toBeInTheDocument()
  })

  it('deshabilita campos durante el envío', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ celebrants: mockCelebrants }),
      })
      .mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves to keep submitting state
      )

    render(<AddIdeaModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    // Seleccionar celebrante
    const celebrantSelect = screen.getByRole('combobox')
    await user.selectOptions(celebrantSelect, 'b1')

    // Llenar formulario
    const productInput = screen.getByPlaceholderText(/LEGO Star Wars/i)
    await user.type(productInput, 'Juguete de prueba')

    const familyInput = screen.getByPlaceholderText(/Familia García/i)
    await user.type(familyInput, 'Familia Test')

    const submitButton = screen.getByRole('button', { name: /añadir idea/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument()
    })
  })
})
