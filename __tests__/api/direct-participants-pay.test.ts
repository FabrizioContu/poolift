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

function createMockRequest(url: string, body?: unknown): NextRequest {
  return {
    nextUrl: { searchParams: new URLSearchParams(url.split('?')[1] || '') },
    json: async () => body ?? null,
    cookies: { get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn(), has: vi.fn() },
    headers: new Headers(),
    url,
  } as unknown as NextRequest
}

describe('PUT /api/gifts/direct/[id]/participants/pay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 400 when participantName is missing', async () => {
    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { paid: true },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/requeridos/i)
  })

  it('returns 400 when paid is not a boolean', async () => {
    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: 'true' },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/requeridos/i)
  })

  it('returns 404 when gift is not found', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: true },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/no encontrado/i)
  })

  it('returns 409 when gift status is "open"', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: { status: 'open' }, error: null })

    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: true },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toMatch(/comprado/i)
  })

  it('returns 409 when gift status is "closed"', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: { status: 'closed' }, error: null })

    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: true },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(409)
  })

  it('returns 404 when participant is not found', async () => {
    // Gift found and purchased
    mockSupabase.single.mockResolvedValueOnce({ data: { status: 'purchased' }, error: null })
    // Participant update finds nothing
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: true },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/participante no encontrado/i)
  })

  it('returns 200 with updated participant when successful', async () => {
    const updatedParticipant = {
      id: 'dp-1',
      direct_gift_id: 'gift-1',
      participant_name: 'Juan',
      status: 'joined',
      paid: true,
    }
    mockSupabase.single.mockResolvedValueOnce({ data: { status: 'purchased' }, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: true },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.participant).toEqual(updatedParticipant)
    expect(body.participant.paid).toBe(true)
  })

  it('returns 200 when marking participant as unpaid', async () => {
    const updatedParticipant = {
      id: 'dp-1',
      direct_gift_id: 'gift-1',
      participant_name: 'Juan',
      status: 'joined',
      paid: false,
    }
    mockSupabase.single.mockResolvedValueOnce({ data: { status: 'purchased' }, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/direct/[id]/participants/pay/route')
    const req = createMockRequest(
      'http://localhost/api/gifts/direct/gift-1/participants/pay',
      { participantName: 'Juan', paid: false },
    )
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.participant.paid).toBe(false)
  })
})
