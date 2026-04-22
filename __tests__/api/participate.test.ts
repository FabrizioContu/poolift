import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  upsert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  neq: vi.fn(() => mockSupabase),
  single: vi.fn(),
  maybeSingle: vi.fn(),
}
vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

const mockServerClient = {
  from: vi.fn(() => mockServerClient),
  select: vi.fn(() => mockServerClient),
  eq: vi.fn(() => mockServerClient),
  single: vi.fn(),
  auth: { getUser: vi.fn() },
}
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

function createMockRequest(url: string, options?: { body?: unknown }): NextRequest {
  const body = options?.body ?? null
  return {
    nextUrl: { searchParams: new URLSearchParams(url.split('?')[1] || '') },
    json: async () => body,
    cookies: { get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn(), has: vi.fn() },
    headers: new Headers(),
    url,
  } as unknown as NextRequest
}

// ─── Group Gift Participant DELETE ────────────────────────────────────────────

describe('DELETE /api/gifts/[id]/participate (group gift)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 400 when familyName is missing from body', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
    const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
      body: { familyId: 'family-abc' },
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

    expect(response.status).toBe(400)
  })

  describe('anonymous path (no user session)', () => {
    beforeEach(() => {
      mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      // Default: gift is open (reached after auth passes)
      mockSupabase.single.mockResolvedValue({
        data: { participation_open: true, purchased_at: null },
        error: null,
      })
    })

    it('returns 403 when familyId is missing', async () => {
      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 403 when familyId resolves to a family with a different name', async () => {
      mockServerClient.single.mockResolvedValueOnce({ data: { name: 'Martínez' }, error: null })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García', familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when familyId resolves to family whose name matches familyName', async () => {
      mockServerClient.single.mockResolvedValueOnce({ data: { name: 'García' }, error: null })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García', familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('authenticated path (user session active)', () => {
    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: { participation_open: true, purchased_at: null },
        error: null,
      })
    })

    it('returns 403 when user family name does not match familyName', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: { name: 'Pérez' }, error: null })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when user family name matches familyName', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: { name: 'García' }, error: null })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('state machine', () => {
    beforeEach(() => {
      mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      mockServerClient.single.mockResolvedValue({ data: { name: 'García' }, error: null })
    })

    it('returns 404 when gift is not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García', familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(404)
    })

    it('returns 400 when participation_open is false', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { participation_open: false, purchased_at: null },
        error: null,
      })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García', familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(400)
    })

    it('returns 400 when gift has purchased_at set', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { participation_open: true, purchased_at: '2026-04-01T10:00:00Z' },
        error: null,
      })

      const { DELETE } = await import('@/app/api/gifts/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/gift-123/participate', {
        body: { familyName: 'García', familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(400)
    })
  })
})

// ─── Direct Gift Participant DELETE ──────────────────────────────────────────

describe('DELETE /api/gifts/direct/[id]/participate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 400 when participantName is missing from body', async () => {
    const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')
    const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
      body: { shareCode: 'correct-code' },
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

    expect(response.status).toBe(400)
  })

  describe('shareCode auth boundary', () => {
    it('returns 404 when gift is not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

      const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        body: { participantName: 'Juan', shareCode: 'any-code' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 when shareCode is missing from body', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { status: 'open', share_code: 'correct-code', organizer_user_id: null },
        error: null,
      })

      const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        body: { participantName: 'Juan' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 403 when shareCode does not match gift.share_code', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { status: 'open', share_code: 'correct-code', organizer_user_id: null },
        error: null,
      })

      const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        body: { participantName: 'Juan', shareCode: 'wrong-code' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when shareCode matches and gift is open', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { status: 'open', share_code: 'correct-code', organizer_user_id: null },
        error: null,
      })

      const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        body: { participantName: 'Juan', shareCode: 'correct-code' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('state machine', () => {
    it('returns 400 when gift status is not open', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { status: 'closed', share_code: 'correct-code', organizer_user_id: null },
        error: null,
      })

      const { DELETE } = await import('@/app/api/gifts/direct/[id]/participate/route')
      const request = createMockRequest('http://localhost/api/gifts/direct/gift-123/participate', {
        body: { participantName: 'Juan', shareCode: 'correct-code' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'gift-123' }) })

      expect(response.status).toBe(400)
    })
  })
})
