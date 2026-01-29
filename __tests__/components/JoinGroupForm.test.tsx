import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JoinGroupForm } from '@/components/groups/JoinGroupForm'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const defaultProps = {
  groupId: 'group-123',
  groupName: 'Clase 2B',
  inviteCode: 'ABC123XYZ456',
}

describe('JoinGroupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('renderiza correctamente', () => {
    render(<JoinGroupForm {...defaultProps} />)

    expect(screen.getByText('Únete a Clase 2B')).toBeInTheDocument()
    expect(screen.getByText(/Nombre de tu familia/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ej: Familia García')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /unirse al grupo/i })).toBeInTheDocument()
  })

  it('muestra error cuando nombre está vacío', async () => {
    const user = userEvent.setup()
    render(<JoinGroupForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument()
    })
  })

  it('muestra error cuando nombre tiene menos de 2 caracteres', async () => {
    const user = userEvent.setup()
    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    await user.type(nameInput, 'A')

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument()
    })
  })

  it('no permite más de 50 caracteres', async () => {
    const user = userEvent.setup()
    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    const longName = 'A'.repeat(60)
    await user.type(nameInput, longName)

    const inputValue = (nameInput as HTMLInputElement).value
    expect(inputValue.length).toBeLessThanOrEqual(50)
  })

  it('envía formulario correctamente con datos válidos', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ family: { id: 'f-1' } }),
    })

    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    await user.type(nameInput, 'Familia López')

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('¡Te has unido al grupo!')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/families', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.groupId).toBe('group-123')
    expect(body.familyName).toBe('Familia López')
  })

  it('maneja errores del servidor correctamente', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Ya existe una familia con ese nombre' }),
    })

    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    await user.type(nameInput, 'Familia López')

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Ya existe una familia con ese nombre')).toBeInTheDocument()
    })
  })

  it('muestra estado de carga durante submit', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: unknown) => void

    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    await user.type(nameInput, 'Familia López')

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Uniéndose...')).toBeInTheDocument()
    })

    // Clean up
    resolvePromise!({ ok: true, json: () => Promise.resolve({ family: { id: 'f-1' } }) })
  })

  it('deshabilita input durante el envío', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: unknown) => void

    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    await user.type(nameInput, 'Familia López')

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(nameInput).toBeDisabled()
    })

    // Clean up
    resolvePromise!({ ok: true, json: () => Promise.resolve({ family: { id: 'f-1' } }) })
  })

  it('muestra mensaje de éxito con redirección', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ family: { id: 'f-1' } }),
    })

    render(<JoinGroupForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('ej: Familia García')
    await user.type(nameInput, 'Familia López')

    const submitButton = screen.getByRole('button', { name: /unirse al grupo/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('¡Te has unido al grupo!')).toBeInTheDocument()
      expect(screen.getByText('Redirigiendo al dashboard...')).toBeInTheDocument()
    })
  })

  it('muestra el nombre del grupo en el título', () => {
    render(<JoinGroupForm groupId="g-1" groupName="Los Tigres" inviteCode="TIGERS123" />)

    expect(screen.getByText('Únete a Los Tigres')).toBeInTheDocument()
  })

  it('tiene icono de usuarios', () => {
    render(<JoinGroupForm {...defaultProps} />)

    expect(screen.getByText(/Introduce el nombre de tu familia/)).toBeInTheDocument()
  })
})
