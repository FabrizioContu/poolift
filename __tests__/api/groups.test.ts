import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { validateGroupDelete } from '@/lib/validators'

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

vi.mock('@/lib/validators', () => ({
  validateGroupDelete: vi.fn().mockResolvedValue({ canDelete: true, warnings: [] }),
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

describe('DELETE /api/groups/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('anonymous path (no user session)', () => {
    beforeEach(() => {
      mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      // Default: verify query finds nothing (group deleted successfully)
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
    })

    it('returns 403 when familyId is missing from body', async () => {
      mockServerClient.single.mockResolvedValueOnce({ data: { id: 'family-abc', user_id: null }, error: null })

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 403 when familyId does not match creatorFamily.id', async () => {
      mockServerClient.single.mockResolvedValueOnce({ data: { id: 'family-abc', user_id: null }, error: null })

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', {
        body: { familyId: 'family-WRONG' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when familyId matches creatorFamily.id', async () => {
      mockServerClient.single.mockResolvedValueOnce({ data: { id: 'family-abc', user_id: null }, error: null })

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', {
        body: { familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('authenticated path (user session active)', () => {
    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })
    })

    it('returns 403 when logged-in user does not own the creator family', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: { id: 'family-abc', user_id: 'user-OTHER' }, error: null })

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when logged-in user owns the creator family', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: { id: 'family-abc', user_id: 'user-xyz' }, error: null })

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('no creator family found (orphaned group)', () => {
    it('skips auth check and proceeds to delete', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: null, error: null })
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('state machine — validateGroupDelete', () => {
    it('returns 400 when validateGroupDelete throws', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: { id: 'family-abc', user_id: null }, error: null })
      vi.mocked(validateGroupDelete).mockRejectedValueOnce(new Error('Hay fiestas activas'))

      const { DELETE } = await import('@/app/api/groups/[id]/route')
      const request = createMockRequest('http://localhost/api/groups/group-123', {
        body: { familyId: 'family-abc' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'group-123' }) })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Hay fiestas activas')
    })
  })
})
