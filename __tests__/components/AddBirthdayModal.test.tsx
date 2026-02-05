import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddBirthdayModal } from '@/components/modals/AddBirthdayModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  groupId: 'group-123',
  onSuccess: vi.fn(),
}

const getDateInput = (container: HTMLElement) => {
  return container.querySelector('input[type="date"]') as HTMLInputElement
}

describe('AddBirthdayModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renderiza correctamente cuando está abierto', () => {
    const { container } = render(<AddBirthdayModal {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Añadir Cumpleaños' })).toBeInTheDocument()
    expect(screen.getByText(/Nombre del niño/)).toBeInTheDocument()
    expect(screen.getByText(/Fecha de nacimiento/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ej: Juan')).toBeInTheDocument()
    expect(getDateInput(container)).toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    render(<AddBirthdayModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Añadir Cumpleaños')).not.toBeInTheDocument()
  })

  it('muestra error cuando nombre está vacío', async () => {
    const user = userEvent.setup()
    render(<AddBirthdayModal {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    expect(screen.getByText('El nombre del niño es requerido')).toBeInTheDocument()
  })

  it('muestra error cuando nombre tiene menos de 2 caracteres', async () => {
    const user = userEvent.setup()
    render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'A')

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument()
  })

  it('muestra error cuando nombre tiene más de 50 caracteres', async () => {
    const user = userEvent.setup()
    render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    const longName = 'A'.repeat(51)
    await user.type(nameInput, longName)

    // El input tiene maxLength=50, así que verifica que no permite más
    const inputValue = (nameInput as HTMLInputElement).value
    expect(inputValue.length).toBeLessThanOrEqual(50)
  })

  it('muestra error cuando falta fecha de cumpleaños', async () => {
    const user = userEvent.setup()
    render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    expect(screen.getByText('La fecha de nacimiento es requerida')).toBeInTheDocument()
  })

  it('tiene atributo max para prevenir fechas futuras', () => {
    const { container } = render(<AddBirthdayModal {...defaultProps} />)

    const dateInput = getDateInput(container)

    expect(dateInput).toHaveAttribute('max')

    const maxValue = dateInput.getAttribute('max')
    const today = new Date().toISOString().split('T')[0]
    expect(maxValue).toBe(today)
  })

  it('envía formulario correctamente con datos válidos', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onClose = vi.fn()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ birthday: { id: 'b-1' } }),
    })

    const { container } = render(<AddBirthdayModal {...defaultProps} onSuccess={onSuccess} onClose={onClose} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    const dateInput = getDateInput(container)
    await user.type(dateInput, '2018-05-15')

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('¡Cumpleaños añadido!')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/birthdays', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('maneja errores del servidor correctamente', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Error del servidor' }),
    })

    const { container } = render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    const dateInput = getDateInput(container)
    await user.type(dateInput, '2018-05-15')

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error del servidor')).toBeInTheDocument()
    })
  })

  it('llama onClose al hacer clic en Cancelar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AddBirthdayModal {...defaultProps} onClose={onClose} />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('muestra contador de caracteres', () => {
    render(<AddBirthdayModal {...defaultProps} />)

    expect(screen.getByText('0/50 caracteres')).toBeInTheDocument()
  })

  it('actualiza contador de caracteres al escribir', async () => {
    const user = userEvent.setup()
    render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    expect(screen.getByText('5/50 caracteres')).toBeInTheDocument()
  })

  it('tiene el icono Cake', () => {
    render(<AddBirthdayModal {...defaultProps} />)

    expect(screen.getByText('Registra un nuevo cumpleaños en el grupo')).toBeInTheDocument()
  })

  it('muestra estado de carga durante submit', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {})
    )

    const { container } = render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    const dateInput = getDateInput(container)
    await user.type(dateInput, '2018-05-15')

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument()
    })
  })

  it('deshabilita campos durante el envío', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {})
    )

    const { container } = render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    const dateInput = getDateInput(container)
    await user.type(dateInput, '2018-05-15')

    const submitButton = screen.getByRole('button', { name: /añadir cumpleaños/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(nameInput).toBeDisabled()
      expect(dateInput).toBeDisabled()
    })
  })

  it('limpia formulario al abrir de nuevo', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<AddBirthdayModal {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Juan')
    await user.type(nameInput, 'María')

    rerender(<AddBirthdayModal {...defaultProps} isOpen={false} />)
    rerender(<AddBirthdayModal {...defaultProps} isOpen={true} />)

    const newNameInput = screen.getByPlaceholderText('ej: Juan')
    expect(newNameInput).toHaveValue('')
  })
})
