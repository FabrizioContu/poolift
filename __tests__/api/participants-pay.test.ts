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

// Server client mock — overridden per test for auth scenarios
const mockServerClient = {
  ...mockSupabase,
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

// Shorthand: gift found with coordinator, not yet purchased
function mockGiftWithCoordinator(coordinatorId = 'family-coord-id') {
  mockSupabase.single.mockResolvedValueOnce({
    data: { purchased_at: '2026-05-01T10:00:00Z', party: { coordinator_id: coordinatorId } },
    error: null,
  })
}

describe('PUT /api/gifts/[id]/participants/pay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Default: anonymous caller
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('returns 400 when familyName is missing', async () => {
    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      paid: true,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/requeridos/i)
  })

  it('returns 400 when paid is not a boolean', async () => {
    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: 'yes',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/requeridos/i)
  })

  it('returns 404 when gift is not found', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/no encontrado/i)
  })

  it('returns 409 when gift purchased_at is null', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { purchased_at: null, party: { coordinator_id: 'family-coord-id' } },
      error: null,
    })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/comprado/i)
  })

  it('returns 404 when participant is not found', async () => {
    // Gift found with purchased_at set; anonymous caller with matching familyId
    mockSupabase.single.mockResolvedValueOnce({
      data: { purchased_at: '2026-05-01T10:00:00Z', party: { coordinator_id: 'family-coord-id' } },
      error: null,
    })
    // Participant update returns nothing
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/participante no encontrado/i)
  })

  it('returns 200 with updated participant when marking as paid', async () => {
    const updatedParticipant = {
      id: 'p-1',
      gift_id: 'gift-1',
      family_name: 'Familia García',
      status: 'joined',
      paid: true,
    }
    mockGiftWithCoordinator()
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.participant).toEqual(updatedParticipant)
    expect(body.participant.paid).toBe(true)
  })

  it('returns 200 with updated participant when marking as unpaid', async () => {
    const updatedParticipant = {
      id: 'p-1',
      gift_id: 'gift-1',
      family_name: 'Familia García',
      status: 'joined',
      paid: false,
    }
    mockGiftWithCoordinator()
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: false,
      familyId: 'family-coord-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.participant.paid).toBe(false)
  })

  // Authorization tests

  it('returns 403 when anonymous and familyId is missing', async () => {
    mockGiftWithCoordinator()

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 403 when anonymous and familyId does not match coordinator', async () => {
    mockGiftWithCoordinator('family-coord-id')

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
      familyId: 'family-other-id',
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns 200 when anonymous and familyId matches coordinator', async () => {
    mockGiftWithCoordinator('family-coord-id')
    const updatedParticipant = { id: 'p-1', family_name: 'Familia García', paid: true }
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
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
    mockGiftWithCoordinator('family-coord-id')
    // coordFamily lookup returns a different user_id
    mockServerClient.single.mockResolvedValueOnce({ data: { user_id: 'user-coordinator' }, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
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
    mockGiftWithCoordinator('family-coord-id')
    // coordFamily lookup returns matching user_id
    mockServerClient.single.mockResolvedValueOnce({ data: { user_id: 'user-coordinator' }, error: null })
    const updatedParticipant = { id: 'p-1', family_name: 'Familia García', paid: true }
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
  })
})
