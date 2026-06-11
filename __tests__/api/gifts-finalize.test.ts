import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
}
vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

vi.mock('@/lib/email', () => ({
  notifyParticipantsFinalized: vi.fn().mockResolvedValue(undefined),
}))

const mockServerClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: vi.fn(() => mockServerClient),
  select: vi.fn(() => mockServerClient),
  eq: vi.fn(() => mockServerClient),
  single: vi.fn(),
}
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

function createMockRequest(url: string, body?: unknown): NextRequest {
  return {
    nextUrl: { searchParams: new URLSearchParams(url.split('?')[1] || '') },
    json: async () => body ?? null,
    cookies: { get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn(), has: vi.fn() },
    headers: new Headers(),
    url,
  } as unknown as NextRequest
}

// A valid gift context with a coordinator
function mockGiftContext(coordinatorId = 'family-coord-id') {
  mockSupabase.single.mockResolvedValueOnce({
    data: {
      share_code: 'abc123',
      proposal: { name: 'Nintendo Switch' },
      participants: [{ email: 'test@example.com', status: 'joined' }],
      party: {
        coordinator_id: coordinatorId,
        party_date: '2026-07-01',
        party_celebrants: [],
      },
    },
    error: null,
  })
}

describe('PUT /api/gifts/[id]/finalize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  // Price validation tests

  it('returns 400 when finalPrice is missing', async () => {
    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      coordinatorComment: 'ok',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/precio final requerido/i)
  })

  it('returns 400 when finalPrice is negative', async () => {
    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: -50,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/precio final requerido/i)
  })

  it('returns 400 when finalPrice is a string', async () => {
    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 'abc',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/precio final requerido/i)
  })

  it('returns 400 when finalPrice is zero', async () => {
    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 0,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/precio final requerido/i)
  })

  // Authorization tests

  it('returns 403 when anonymous and familyId is missing', async () => {
    mockGiftContext()

    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 99.99,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 403 when anonymous and familyId does not match coordinator', async () => {
    mockGiftContext('family-coord-id')

    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 99.99,
      familyId: 'family-wrong-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 200 when anonymous and familyId matches coordinator', async () => {
    mockGiftContext('family-coord-id')
    const updatedGift = { id: 'gift-1', final_price: 99.99, purchased_at: '2026-06-11' }
    mockSupabase.single.mockResolvedValueOnce({ data: updatedGift, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 99.99,
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.gift).toEqual(updatedGift)
  })

  it('returns 403 when authenticated user is not the coordinator family user_id', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-other' } },
      error: null,
    })
    mockGiftContext('family-coord-id')
    mockServerClient.single.mockResolvedValueOnce({ data: { user_id: 'user-coordinator' }, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 99.99,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 200 when authenticated user matches coordinator family user_id', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-coordinator' } },
      error: null,
    })
    mockGiftContext('family-coord-id')
    mockServerClient.single.mockResolvedValueOnce({ data: { user_id: 'user-coordinator' }, error: null })
    const updatedGift = { id: 'gift-1', final_price: 99.99, purchased_at: '2026-06-11' }
    mockSupabase.single.mockResolvedValueOnce({ data: updatedGift, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/finalize/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/finalize', {
      finalPrice: 99.99,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
  })
})
