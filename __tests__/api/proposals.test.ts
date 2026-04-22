import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'
import { validateProposalDelete } from '@/lib/validators'

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
  validateProposalDelete: vi.fn().mockResolvedValue({ canDelete: true }),
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

// Helper: set up the 2-call serverClient.single chain for anonymous auth (proposal → party)
function setupAnonProposalChain() {
  mockServerClient.single
    .mockResolvedValueOnce({ data: { party_id: 'party-111' }, error: null })
    .mockResolvedValueOnce({ data: { coordinator_id: 'family-coord' }, error: null })
}

// Helper: set up the 3-call serverClient.single chain for auth path (proposal → party → families)
function setupAuthProposalChain(coordFamilyUserId: string) {
  mockServerClient.single
    .mockResolvedValueOnce({ data: { party_id: 'party-111' }, error: null })
    .mockResolvedValueOnce({ data: { coordinator_id: 'family-coord' }, error: null })
    .mockResolvedValueOnce({ data: { user_id: coordFamilyUserId }, error: null })
}

describe('DELETE /api/proposals/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('anonymous path (no user session)', () => {
    beforeEach(() => {
      mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    })

    it('returns 403 when familyId is missing from body', async () => {
      setupAnonProposalChain()

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(403)
    })

    it('returns 403 when familyId does not match coordinator_id', async () => {
      setupAnonProposalChain()

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', {
        body: { familyId: 'family-WRONG' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when familyId matches coordinator_id', async () => {
      setupAnonProposalChain()

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', {
        body: { familyId: 'family-coord' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  describe('authenticated path (user session active)', () => {
    it('returns 403 when user does not own the coordinator family', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      setupAuthProposalChain('user-OTHER')

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when user owns the coordinator family', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      setupAuthProposalChain('user-xyz')

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('proposal not found', () => {
    it('skips auth check and proceeds when proposal is null', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
      mockServerClient.single.mockResolvedValueOnce({ data: null, error: null })

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', { body: {} })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(200)
    })
  })

  describe('state machine — validateProposalDelete', () => {
    it('returns 400 when validateProposalDelete throws', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
      setupAnonProposalChain()
      vi.mocked(validateProposalDelete).mockRejectedValueOnce(new Error('Tiene votos registrados'))

      const { DELETE } = await import('@/app/api/proposals/[id]/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1', {
        body: { familyId: 'family-coord' },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Tiene votos registrados')
    })
  })
})

describe('PUT /api/proposals/[id]/select', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('anonymous path (no user session)', () => {
    beforeEach(() => {
      mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
    })

    it('returns 403 when familyId is missing from body', async () => {
      setupAnonProposalChain()

      const { PUT } = await import('@/app/api/proposals/[id]/select/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1/select', { body: {} })
      const response = await PUT(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(403)
    })

    it('returns 403 when familyId does not match coordinator_id', async () => {
      setupAnonProposalChain()

      const { PUT } = await import('@/app/api/proposals/[id]/select/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1/select', {
        body: { familyId: 'family-WRONG' },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 and returns selected proposal', async () => {
      setupAnonProposalChain()
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'prop-1', party_id: 'party-111', is_selected: true },
        error: null,
      })

      const { PUT } = await import('@/app/api/proposals/[id]/select/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1/select', {
        body: { familyId: 'family-coord' },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.proposal.is_selected).toBe(true)
    })
  })

  describe('authenticated path (user session active)', () => {
    it('returns 403 when user does not own the coordinator family', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      setupAuthProposalChain('user-OTHER')

      const { PUT } = await import('@/app/api/proposals/[id]/select/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1/select', { body: {} })
      const response = await PUT(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(403)
    })

    it('returns 200 when user owns the coordinator family', async () => {
      mockServerClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-xyz' } }, error: null })
      setupAuthProposalChain('user-xyz')
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'prop-1', party_id: 'party-111', is_selected: true },
        error: null,
      })

      const { PUT } = await import('@/app/api/proposals/[id]/select/route')
      const request = createMockRequest('http://localhost/api/proposals/prop-1/select', { body: {} })
      const response = await PUT(request, { params: Promise.resolve({ id: 'prop-1' }) })

      expect(response.status).toBe(200)
    })
  })
})
