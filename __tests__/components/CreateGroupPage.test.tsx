import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  addGroupToSession: vi.fn(),
}))

// Mock storage
vi.mock('@/lib/storage', () => ({
  anonymousStorage: {
    addGroup: vi.fn(),
  },
}))

// Mock the InviteCodeModal
vi.mock('@/components/modals/InviteCodeModal', () => ({
  default: ({ isOpen, onClose, inviteCode, groupName }: {
    isOpen: boolean
    onClose: () => void
    inviteCode: string
    groupName: string
  }) =>
    isOpen ? (
      <div data-testid="invite-modal">
        <p>Invite Code: {inviteCode}</p>
        <p>Group: {groupName}</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

// Import after mocks
import CreateGroupPage from '@/app/create-group/page'

describe('CreateGroupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('Step 1: Group Type Selection', () => {
    it('renderiza la seleccion de tipo de grupo por defecto', () => {
      render(<CreateGroupPage />)

      expect(screen.getByRole('heading', { name: 'Crear Grupo' })).toBeInTheDocument()
      expect(screen.getByText('Que tipo de grupo es?')).toBeInTheDocument()

      // All type options should be visible
      expect(screen.getByText('Clase')).toBeInTheDocument()
      expect(screen.getByText('Amigos')).toBeInTheDocument()
      expect(screen.getByText('Familia')).toBeInTheDocument()
      expect(screen.getByText('Trabajo')).toBeInTheDocument()
      expect(screen.getByText('Otro')).toBeInTheDocument()
    })

    it('muestra descripciones de cada tipo', () => {
      render(<CreateGroupPage />)

      expect(screen.getByText('Colegio, guardería, instituto')).toBeInTheDocument()
      expect(screen.getByText('Grupo de amigos, comunidad')).toBeInTheDocument()
      expect(screen.getByText('Primos, tíos, abuelos...')).toBeInTheDocument()
      expect(screen.getByText('Compañeros, departamento')).toBeInTheDocument()
      expect(screen.getByText('Club, equipo, vecinos...')).toBeInTheDocument()
    })

    it('muestra iconos para cada tipo', () => {
      render(<CreateGroupPage />)

      expect(screen.getByText('🎒')).toBeInTheDocument()
      expect(screen.getByText('👥')).toBeInTheDocument()
      expect(screen.getByText('👨‍👩‍👧‍👦')).toBeInTheDocument()
      expect(screen.getByText('💼')).toBeInTheDocument()
      expect(screen.getByText('✨')).toBeInTheDocument()
    })

    it('muestra link a regalo directo', () => {
      render(<CreateGroupPage />)

      expect(screen.getByText('Solo necesitas un regalo puntual?')).toBeInTheDocument()
      expect(screen.getByText('Regalo directo')).toBeInTheDocument()
    })

    it('avanza al paso 2 al seleccionar tipo Clase', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))

      // Should show step 2
      expect(screen.getByText('Configura tu grupo de clase')).toBeInTheDocument()
      expect(screen.getByText(/Como se llama la clase/)).toBeInTheDocument()
    })

    it('avanza al paso 2 al seleccionar tipo Amigos', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Amigos'))

      expect(screen.getByText('Configura tu grupo de amigos')).toBeInTheDocument()
      expect(screen.getByText(/Como se llama el grupo\?/)).toBeInTheDocument()
    })

    it('avanza al paso 2 al seleccionar tipo Familia', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Familia'))

      expect(screen.getByText('Configura tu grupo de familia')).toBeInTheDocument()
      expect(screen.getByText(/Como se llama el grupo familiar/)).toBeInTheDocument()
    })

    it('avanza al paso 2 al seleccionar tipo Trabajo', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Trabajo'))

      expect(screen.getByText('Configura tu grupo de trabajo')).toBeInTheDocument()
      expect(screen.getByText(/Como se llama el equipo/)).toBeInTheDocument()
    })
  })

  describe('Step 2: Group Details', () => {
    it('muestra ejemplos especificos para tipo Clase', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))

      expect(screen.getByText('Ejemplos de nombres:')).toBeInTheDocument()
      expect(screen.getByText('2°B Primaria')).toBeInTheDocument()
      expect(screen.getByText('Girasoles guardería')).toBeInTheDocument()
    })

    it('muestra ejemplos especificos para tipo Amigos', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Amigos'))

      expect(screen.getByText('Los inseparables')).toBeInTheDocument()
      expect(screen.getByText('Grupo running')).toBeInTheDocument()
    })

    it('muestra label adaptativo para representante en tipo Clase', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))

      expect(screen.getByText(/Tu nombre \(representante\)/)).toBeInTheDocument()
    })

    it('muestra label simple para nombre en tipo Amigos', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Amigos'))

      // Use regex to match just "Tu nombre" without the asterisk in a separate span
      const labels = screen.getAllByText(/Tu nombre/)
      expect(labels.length).toBeGreaterThan(0)
    })

    it('permite volver al paso 1 con boton Atras', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      // Go to step 2
      await user.click(screen.getByText('Clase'))
      expect(screen.getByText('Configura tu grupo de clase')).toBeInTheDocument()

      // Go back to step 1
      await user.click(screen.getByText('Atras'))
      expect(screen.getByText('Que tipo de grupo es?')).toBeInTheDocument()
    })

    it('valida nombre de grupo minimo 3 caracteres', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))

      // Fill with short name
      await user.type(
        screen.getByPlaceholderText('ej: 2B Primaria / Girasoles guarderia'),
        'AB'
      )
      await user.type(
        screen.getByPlaceholderText('ej: Familia Garcia'),
        'Test Family'
      )

      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      expect(
        screen.getByText('El nombre del grupo debe tener al menos 3 caracteres')
      ).toBeInTheDocument()
    })

    it('valida nombre de usuario minimo 2 caracteres', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))

      // Fill group name but short user name
      await user.type(
        screen.getByPlaceholderText('ej: 2B Primaria / Girasoles guarderia'),
        'Clase Test'
      )
      await user.type(screen.getByPlaceholderText('ej: Familia Garcia'), 'A')

      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      expect(
        screen.getByText('Tu nombre debe tener al menos 2 caracteres')
      ).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('envia formulario con tipo de grupo', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        group: {
          id: 'group-123',
          name: 'Test Class',
          invite_code: 'abc123',
        },
        family: {
          id: 'family-123',
          name: 'Test Family',
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      render(<CreateGroupPage />)

      // Select type
      await user.click(screen.getByText('Clase'))

      // Fill form
      await user.type(
        screen.getByPlaceholderText('ej: 2B Primaria / Girasoles guarderia'),
        'Test Class'
      )
      await user.type(
        screen.getByPlaceholderText('ej: Familia Garcia'),
        'Test Family'
      )

      // Submit
      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Class',
            familyName: 'Test Family',
            type: 'class',
          }),
        })
      })
    })

    it('envia tipo friends cuando se selecciona Amigos', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        group: { id: 'g1', name: 'Friends', invite_code: 'abc' },
        family: { id: 'f1', name: 'Me' },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      render(<CreateGroupPage />)

      await user.click(screen.getByText('Amigos'))
      await user.type(
        screen.getByPlaceholderText('ej: Los inseparables / Grupo running'),
        'My Friends'
      )
      await user.type(screen.getByPlaceholderText('ej: Carlos'), 'Carlos')

      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      await waitFor(() => {
        const callBody = JSON.parse(
          (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
        )
        expect(callBody.type).toBe('friends')
      })
    })

    it('muestra modal de invitacion despues de crear grupo', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        group: {
          id: 'group-123',
          name: 'Test Class',
          invite_code: 'invite123',
        },
        family: {
          id: 'family-123',
          name: 'Test Family',
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))
      await user.type(
        screen.getByPlaceholderText('ej: 2B Primaria / Girasoles guarderia'),
        'Test Class'
      )
      await user.type(
        screen.getByPlaceholderText('ej: Familia Garcia'),
        'Test Family'
      )

      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      await waitFor(() => {
        expect(screen.getByTestId('invite-modal')).toBeInTheDocument()
        expect(screen.getByText('Invite Code: invite123')).toBeInTheDocument()
        expect(screen.getByText('Group: Test Class')).toBeInTheDocument()
      })
    })

    it('muestra estado de carga durante submit', async () => {
      const user = userEvent.setup()

      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      group: { id: 'g1', name: 'Test', invite_code: 'abc' },
                      family: { id: 'f1', name: 'Fam' },
                    }),
                }),
              100
            )
          )
      )

      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))
      await user.type(
        screen.getByPlaceholderText('ej: 2B Primaria / Girasoles guarderia'),
        'Test Class'
      )
      await user.type(
        screen.getByPlaceholderText('ej: Familia Garcia'),
        'Test Family'
      )

      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      expect(screen.getByText('Creando...')).toBeInTheDocument()
    })

    it('maneja errores del servidor', async () => {
      const user = userEvent.setup()

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Error del servidor' }),
      })

      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))
      await user.type(
        screen.getByPlaceholderText('ej: 2B Primaria / Girasoles guarderia'),
        'Test Class'
      )
      await user.type(
        screen.getByPlaceholderText('ej: Familia Garcia'),
        'Test Family'
      )

      await user.click(screen.getByRole('button', { name: 'Crear Grupo' }))

      await waitFor(() => {
        expect(screen.getByText('Error del servidor')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('tiene link para volver al inicio', () => {
      render(<CreateGroupPage />)

      expect(screen.getByText('Volver al inicio')).toBeInTheDocument()
    })

    it('tiene link para unirse a grupo existente en paso 2', async () => {
      const user = userEvent.setup()
      render(<CreateGroupPage />)

      await user.click(screen.getByText('Clase'))

      expect(screen.getByText('Ya tienes un codigo de invitacion?')).toBeInTheDocument()
      expect(screen.getByText('Unirse a grupo')).toBeInTheDocument()
    })
  })
})
