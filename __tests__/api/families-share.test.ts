import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

// ──────────────────────────────────────────────
// Supabase mocks (shared singleton + server client)
// ──────────────────────────────────────────────

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  is: vi.fn(() => mockSupabase),
  single: vi.fn(),
}
vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }))

const mockServerClient = {
  auth: { getUser: vi.fn() },
}
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

// ──────────────────────────────────────────────
// Helper — minimal NextRequest stub
// ──────────────────────────────────────────────

function createMockRequest(url: string): NextRequest {
  return {
    nextUrl: { searchParams: new URLSearchParams() },
    json: async () => ({}),
    cookies: { get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn(), has: vi.fn() },
    headers: new Headers(),
    url,
  } as unknown as NextRequest
}

// ──────────────────────────────────────────────
// GET /api/families/share/[shareCode]
// ──────────────────────────────────────────────

describe('GET /api/families/share/[shareCode]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 200 with family and group when share code is valid', async () => {
    const family = {
      id: 'fam-1',
      name: 'Familia García',
      group_id: 'grp-1',
      share_code: 'abc123xy',
      is_creator: false,
    }
    const group = { id: 'grp-1', name: 'Clase 2B', invite_code: 'invite123' }

    // first .single() → family; second .single() → group
    mockSupabase.single
      .mockResolvedValueOnce({ data: family, error: null })
      .mockResolvedValueOnce({ data: group, error: null })

    const { GET } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await GET(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'abc123xy' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.family).toEqual(family)
    expect(body.group).toEqual(group)
  })

  it('returns 404 when share code is not found', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No rows found' },
    })

    const { GET } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await GET(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'notexist' }),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Código de familia no válido')
  })

  it('returns 404 when family is found but group lookup fails', async () => {
    const family = {
      id: 'fam-1',
      name: 'Familia García',
      group_id: 'grp-orphan',
      share_code: 'abc123xy',
      is_creator: false,
    }

    mockSupabase.single
      .mockResolvedValueOnce({ data: family, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'No group found' } })

    const { GET } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await GET(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'abc123xy' }),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Grupo no encontrado')
  })
})

// ──────────────────────────────────────────────
// POST /api/families/share/[shareCode]
// ──────────────────────────────────────────────

describe('POST /api/families/share/[shareCode]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
    })

    const { POST } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await POST(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'abc123xy' }),
    })

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('No autenticado')
  })

  it('links user_id to family when family.user_id is null and user is authenticated', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    })

    // family lookup → user_id is null (not yet linked)
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'fam-1', user_id: null },
      error: null,
    })

    const { POST } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await POST(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'abc123xy' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)

    // update chain should have been called
    expect(mockSupabase.update).toHaveBeenCalledWith({ user_id: 'user-123' })
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'fam-1')
    expect(mockSupabase.is).toHaveBeenCalledWith('user_id', null)
  })

  it('returns 200 without updating when family.user_id is already set (idempotent)', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    })

    // family already has a user_id → should NOT call update
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'fam-1', user_id: 'user-already-linked' },
      error: null,
    })

    const { POST } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await POST(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'abc123xy' }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(mockSupabase.update).not.toHaveBeenCalled()
  })

  it('returns 404 when share code is invalid', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    })

    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No rows found' },
    })

    const { POST } = await import('@/app/api/families/share/[shareCode]/route')
    const response = await POST(createMockRequest('http://localhost'), {
      params: Promise.resolve({ shareCode: 'badcode' }),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Código no válido')
  })
})
