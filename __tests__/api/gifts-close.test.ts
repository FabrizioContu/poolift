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
  notifyParticipantsClosed: vi.fn().mockResolvedValue(undefined),
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

// A valid gift with open participation, one joined participant, and a coordinator
function mockValidGift(coordinatorId = 'family-coord-id') {
  mockSupabase.single.mockResolvedValueOnce({
    data: {
      id: 'gift-1',
      share_code: 'abc123',
      participation_open: true,
      purchased_at: null,
      proposal: { total_price: 100, name: 'Nintendo Switch' },
      participants: [{ id: 'p-1', email: 'test@example.com', status: 'joined' }],
      party: {
        coordinator_id: coordinatorId,
        party_date: '2026-07-01',
        party_celebrants: [],
      },
    },
    error: null,
  })
}

describe('PUT /api/gifts/[id]/close', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  // Existing behavior preserved

  it('returns 404 for unknown gift', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-x/close', {
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-x' }) })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/no encontrado/i)
  })

  it('returns 400 when participation already closed', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: 'gift-1',
        share_code: 'abc123',
        participation_open: false,
        purchased_at: null,
        proposal: null,
        participants: [],
        party: { coordinator_id: 'family-coord-id', party_date: null, party_celebrants: [] },
      },
      error: null,
    })

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/close', {
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/cerrada/i)
  })

  // Authorization tests

  it('returns 403 when anonymous and familyId is missing', async () => {
    mockValidGift()

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/close')
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 403 when anonymous and familyId does not match coordinator', async () => {
    mockValidGift('family-coord-id')

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/close', {
      familyId: 'family-wrong-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 200 when anonymous and familyId matches coordinator', async () => {
    mockValidGift('family-coord-id')
    // update success
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'gift-1', participation_open: false },
      error: null,
    })

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/close', {
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
  })

  it('returns 403 when authenticated user is not the coordinator family user_id', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-other' } },
      error: null,
    })
    mockValidGift('family-coord-id')
    mockServerClient.single.mockResolvedValueOnce({ data: { user_id: 'user-coordinator' }, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/close')
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
    mockValidGift('family-coord-id')
    mockServerClient.single.mockResolvedValueOnce({ data: { user_id: 'user-coordinator' }, error: null })
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'gift-1', participation_open: false },
      error: null,
    })

    const { PUT } = await import('@/app/api/gifts/[id]/close/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/close')
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
  })
})
