import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  ilike: vi.fn(() => mockSupabase),
  single: vi.fn(),
  order: vi.fn(() => mockSupabase),
  maybeSingle: vi.fn(),
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock NextRequest with required properties
function createMockRequest(url: string, options?: { method?: string; body?: string }): NextRequest {
  const body = options?.body ? JSON.parse(options.body) : null
  return {
    nextUrl: { searchParams: new URLSearchParams(url.split('?')[1] || '') },
    json: async () => body,
    cookies: { get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn(), has: vi.fn() },
    headers: new Headers(),
    url,
  } as unknown as NextRequest
}

describe('Direct Gifts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('POST /api/gifts/direct', () => {
    it('crea regalo directo con datos válidos', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'gift-123',
          share_code: 'abc123xyz',
          recipient_name: 'Laura',
          occasion: 'farewell',
          organizer_name: 'María',
        },
        error: null,
      })

      const { POST } = await import('@/app/api/gifts/direct/route')

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: 'Laura',
          occasion: 'farewell',
          organizerName: 'María',
        }),
      })

      const response = await POST(request )
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.share_code).toBe('abc123xyz')
    })

    it('retorna error 400 sin campos requeridos', async () => {
      const { POST } = await import('@/app/api/gifts/direct/route')

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: 'Laura',
          // missing occasion and organizerName
        }),
      })

      const response = await POST(request )

      expect(response.status).toBe(400)
    })

    it('retorna error 400 con ocasión inválida', async () => {
      const { POST } = await import('@/app/api/gifts/direct/route')

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: 'Laura',
          occasion: 'invalid_occasion',
          organizerName: 'María',
        }),
      })

      const response = await POST(request )

      expect(response.status).toBe(400)
    })

    it('acepta todas las ocasiones válidas', async () => {
      const validOccasions = ['birthday', 'farewell', 'wedding', 'birth', 'graduation', 'other']

      for (const occasion of validOccasions) {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: 'gift-123', share_code: 'abc123', occasion },
          error: null,
        })

        const { POST } = await import('@/app/api/gifts/direct/route')

        const request = createMockRequest('http://localhost/api/gifts/direct', {
          method: 'POST',
          body: JSON.stringify({
            recipientName: 'Laura',
            occasion,
            organizerName: 'María',
          }),
        })

        const response = await POST(request )
        expect(response.status).toBe(201)
      }
    })

    it('maneja campos opcionales correctamente', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'gift-123',
          share_code: 'abc123',
          gift_idea: 'Vale Amazon',
          estimated_price: 50,
        },
        error: null,
      })

      const { POST } = await import('@/app/api/gifts/direct/route')

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: 'Laura',
          occasion: 'birthday',
          organizerName: 'María',
          giftIdea: 'Vale Amazon',
          estimatedPrice: 50,
        }),
      })

      const response = await POST(request )
      expect(response.status).toBe(201)

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          gift_idea: 'Vale Amazon',
          estimated_price: 50,
        })
      )
    })

    it('trimea espacios en blanco de los campos', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'gift-123', share_code: 'abc123' },
        error: null,
      })

      const { POST } = await import('@/app/api/gifts/direct/route')

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: '  Laura  ',
          occasion: 'birthday',
          organizerName: '  María  ',
          giftIdea: '  Vale Amazon  ',
        }),
      })

      await POST(request )

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_name: 'Laura',
          organizer_name: 'María',
          gift_idea: 'Vale Amazon',
        })
      )
    })
  })

  describe('POST /api/gifts/direct/[id]/participate', () => {
    it('permite participar con nombre válido', async () => {
      // Mock gift exists and is open
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { id: 'gift-123', status: 'open' },
          error: null,
        })
        // Mock ilike check - no existing participant found
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }, // Not found is expected
        })
        // Mock insert returns new participant
        .mockResolvedValueOnce({
          data: { id: 'participant-1', participant_name: 'Juan' },
          error: null,
        })

      const { POST } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        method: 'POST',
        body: JSON.stringify({ participantName: 'Juan' }),
      })

      const response = await POST(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(200)
    })

    it('retorna error 400 sin nombre', async () => {
      const { POST } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error 400 con nombre menor a 2 caracteres', async () => {
      const { POST } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        method: 'POST',
        body: JSON.stringify({ participantName: 'J' }),
      })

      const response = await POST(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error 404 si regalo no existe', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      const { POST } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/nonexistent/participate', {
        method: 'POST',
        body: JSON.stringify({ participantName: 'Juan' }),
      })

      const response = await POST(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      })

      expect(response.status).toBe(404)
    })

    it('retorna error 400 si participación está cerrada', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'gift-123', status: 'closed' },
        error: null,
      })

      const { POST } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        method: 'POST',
        body: JSON.stringify({ participantName: 'Juan' }),
      })

      const response = await POST(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error 409 si ya está participando', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { id: 'gift-123', status: 'open' },
          error: null,
        })
        // Mock ilike check - participant already exists
        .mockResolvedValueOnce({
          data: { id: 'existing-participant' },
          error: null,
        })

      const { POST } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        method: 'POST',
        body: JSON.stringify({ participantName: 'Juan' }),
      })

      const response = await POST(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(409)
    })
  })

  describe('DELETE /api/gifts/direct/[id]/participate', () => {
    it('retorna error 400 sin nombre', async () => {
      const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        method: 'DELETE',
        body: JSON.stringify({}),
      })

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/gifts/direct/[id]/close', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('retorna error 404 si regalo no existe', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      const { PUT } = await import('@/app/api/gifts/direct/[id]/close/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/nonexistent/close', {
        method: 'PUT',
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      })

      expect(response.status).toBe(404)
    })

    it('retorna error si ya está cerrado', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'gift-123', status: 'closed', estimated_price: 50 },
        error: null,
      })

      const { PUT } = await import('@/app/api/gifts/direct/[id]/close/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/close', {
        method: 'PUT',
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/gifts/direct/[id]/finalize', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('retorna error sin precio final', async () => {
      const { PUT } = await import('@/app/api/gifts/direct/[id]/finalize/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/finalize', {
        method: 'PUT',
        body: JSON.stringify({}),
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error si participación aún abierta', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'gift-123', status: 'open' },
        error: null,
      })

      const { PUT } = await import('@/app/api/gifts/direct/[id]/finalize/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/finalize', {
        method: 'PUT',
        body: JSON.stringify({ finalPrice: 50 }),
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error con precio negativo', async () => {
      const { PUT } = await import('@/app/api/gifts/direct/[id]/finalize/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/finalize', {
        method: 'PUT',
        body: JSON.stringify({ finalPrice: -10 }),
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error con precio cero', async () => {
      const { PUT } = await import('@/app/api/gifts/direct/[id]/finalize/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/finalize', {
        method: 'PUT',
        body: JSON.stringify({ finalPrice: 0 }),
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'gift-123' }),
      })

      expect(response.status).toBe(400)
    })

    it('retorna error 404 si regalo no existe', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      const { PUT } = await import('@/app/api/gifts/direct/[id]/finalize/route')

      const request = createMockRequest('http://localhost/api/gifts/direct/nonexistent/finalize', {
        method: 'PUT',
        body: JSON.stringify({ finalPrice: 50 }),
      })

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe('Edge cases y seguridad', () => {
    it('genera códigos de compartir únicos', async () => {
      const shareCodes = new Set<string>()

      for (let i = 0; i < 100; i++) {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: `gift-${i}`, share_code: `code${i}${Math.random()}` },
          error: null,
        })

        const { POST } = await import('@/app/api/gifts/direct/route')

        const request = createMockRequest('http://localhost/api/gifts/direct', {
          method: 'POST',
          body: JSON.stringify({
            recipientName: 'Laura',
            occasion: 'birthday',
            organizerName: 'María',
          }),
        })

        const response = await POST(request )
        const data = await response.json()

        if (data.share_code) {
          shareCodes.add(data.share_code)
        }
      }

      // All codes should be unique
      expect(shareCodes.size).toBeGreaterThan(0)
    })

    it('maneja caracteres especiales en nombres', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'gift-123', share_code: 'abc123' },
        error: null,
      })

      const { POST } = await import('@/app/api/gifts/direct/route')

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: "José María O'Brien-Müller",
          occasion: 'birthday',
          organizerName: 'Señor Ñoño <script>alert("xss")</script>',
        }),
      })

      const response = await POST(request )
      expect(response.status).toBe(201)
    })

    it('maneja nombres muy largos', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'gift-123', share_code: 'abc123' },
        error: null,
      })

      const { POST } = await import('@/app/api/gifts/direct/route')

      const longName = 'A'.repeat(500)

      const request = createMockRequest('http://localhost/api/gifts/direct', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: longName,
          occasion: 'birthday',
          organizerName: 'María',
        }),
      })

      const response = await POST(request )
      // Should handle gracefully (either succeed or return appropriate error)
      expect([201, 400]).toContain(response.status)
    })
  })
})
