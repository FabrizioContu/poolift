import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteCodeModal } from '@/components/modals/InviteCodeModal'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  inviteCode: 'abc123xyz456',
  groupId: 'group-123',
  groupName: 'Clase 2B',
}

describe('InviteCodeModal', () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined)
  const mockWindowOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    })

    // Mock window.open
    vi.stubGlobal('open', mockWindowOpen)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renderiza correctamente cuando está abierto', () => {
    render(<InviteCodeModal {...defaultProps} />)

    expect(screen.getByText('¡Grupo Creado!')).toBeInTheDocument()
    expect(screen.getByText('abc123xyz456')).toBeInTheDocument()
    expect(screen.getByText(/Clase 2B/)).toBeInTheDocument()
  })

  it('no renderiza cuando isOpen es false', () => {
    render(<InviteCodeModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('¡Grupo Creado!')).not.toBeInTheDocument()
  })

  it('muestra el código de invitación destacado', () => {
    render(<InviteCodeModal {...defaultProps} />)

    const codeElement = screen.getByText('abc123xyz456')
    expect(codeElement).toHaveClass('font-mono')
    expect(codeElement).toHaveClass('text-3xl')
  })

  it('copia el código al portapapeles', async () => {
    const user = userEvent.setup()
    render(<InviteCodeModal {...defaultProps} />)

    const copyCodeButton = screen.getByText('Copiar Código')
    await user.click(copyCodeButton)

    await waitFor(() => {
      expect(screen.getByText('¡Código copiado!')).toBeInTheDocument()
    })
  })

  it('copia el link al portapapeles', async () => {
    const user = userEvent.setup()
    render(<InviteCodeModal {...defaultProps} />)

    const copyLinkButton = screen.getByText('Copiar Link')
    await user.click(copyLinkButton)

    await waitFor(() => {
      expect(screen.getByText('¡Link copiado!')).toBeInTheDocument()
    })
  })

  it('abre WhatsApp con mensaje correcto', async () => {
    const user = userEvent.setup()
    render(<InviteCodeModal {...defaultProps} />)

    const whatsAppButton = screen.getByText('Compartir en WhatsApp')
    await user.click(whatsAppButton)

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank'
    )
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('Clase%202B'),
      '_blank'
    )
  })

  it('navega al dashboard al hacer clic en el botón', async () => {
    const user = userEvent.setup()
    render(<InviteCodeModal {...defaultProps} />)

    const dashboardButton = screen.getByText('Ir al Dashboard')
    await user.click(dashboardButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard/group-123')
  })

  it('muestra mensaje de compartir con familias', () => {
    render(<InviteCodeModal {...defaultProps} />)

    expect(screen.getByText(/Comparte el código con las familias del grupo/)).toBeInTheDocument()
  })

  it('tiene todos los botones de acción', () => {
    render(<InviteCodeModal {...defaultProps} />)

    expect(screen.getByText('Copiar Código')).toBeInTheDocument()
    expect(screen.getByText('Copiar Link')).toBeInTheDocument()
    expect(screen.getByText('Compartir en WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Ir al Dashboard')).toBeInTheDocument()
  })
})
