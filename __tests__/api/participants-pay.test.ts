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

describe('PUT /api/gifts/[id]/participants/pay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
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
      data: { purchased_at: null },
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
    // Gift found with purchased_at set
    mockSupabase.single.mockResolvedValueOnce({
      data: { purchased_at: '2026-05-01T10:00:00Z' },
      error: null,
    })
    // Participant update returns nothing
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
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
    mockSupabase.single.mockResolvedValueOnce({
      data: { purchased_at: '2026-05-01T10:00:00Z' },
      error: null,
    })
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: true,
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
    mockSupabase.single.mockResolvedValueOnce({
      data: { purchased_at: '2026-05-01T10:00:00Z' },
      error: null,
    })
    mockSupabase.single.mockResolvedValueOnce({ data: updatedParticipant, error: null })

    const { PUT } = await import('@/app/api/gifts/[id]/participants/pay/route')
    const req = createMockRequest('http://localhost/api/gifts/gift-1/participants/pay', {
      familyName: 'Familia García',
      paid: false,
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'gift-1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.participant.paid).toBe(false)
  })
})
