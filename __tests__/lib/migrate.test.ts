import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/storage', () => ({
  anonymousStorage: {
    getMigrationData: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  getGroupSessions: vi.fn(),
  getDirectGiftSessions: vi.fn(),
  clearAllSessions: vi.fn(),
}))

const mockGetUser = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  }),
}))

import { collectMigrationData, migrateAnonData } from '@/lib/migrate'
import { anonymousStorage } from '@/lib/storage'
import { getGroupSessions, getDirectGiftSessions, clearAllSessions } from '@/lib/auth'

const mockGetMigrationData = anonymousStorage.getMigrationData as ReturnType<typeof vi.fn>
const mockClear = anonymousStorage.clear as ReturnType<typeof vi.fn>
const mockGetGroupSessionsFn = getGroupSessions as ReturnType<typeof vi.fn>
const mockGetDirectGiftSessionsFn = getDirectGiftSessions as ReturnType<typeof vi.fn>
const mockClearAllSessionsFn = clearAllSessions as ReturnType<typeof vi.fn>

function setupNoData() {
  mockGetMigrationData.mockReturnValue({
    groups: [],
    userName: null,
    familyId: null,
  })
  mockGetGroupSessionsFn.mockReturnValue([])
  mockGetDirectGiftSessionsFn.mockReturnValue([])
}

function mockFetchSuccess() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
}

function mockFetchFailure() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
}

describe('collectMigrationData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when no anonymous data exists', () => {
    setupNoData()
    expect(collectMigrationData()).toBeNull()
  })

  it('returns data when groups exist in anonymousStorage', () => {
    mockGetMigrationData.mockReturnValue({
      groups: ['group-1'],
      userName: 'Maria',
      familyId: 'family-1',
    })
    mockGetGroupSessionsFn.mockReturnValue([])
    mockGetDirectGiftSessionsFn.mockReturnValue([])

    const result = collectMigrationData()
    expect(result).not.toBeNull()
    expect(result!.groups).toEqual(['group-1'])
    expect(result!.userName).toBe('Maria')
    expect(result!.familyId).toBe('family-1')
  })

  it('returns data when group sessions exist', () => {
    mockGetMigrationData.mockReturnValue({
      groups: [],
      userName: null,
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([
      {
        groupId: 'g1',
        groupName: 'Clase 2B',
        familyId: 'f1',
        familyName: 'Garcia',
        isCreator: true,
        inviteCode: 'abc123',
        joinedAt: '2026-01-01',
      },
    ])
    mockGetDirectGiftSessionsFn.mockReturnValue([])

    const result = collectMigrationData()
    expect(result).not.toBeNull()
    expect(result!.groupSessions).toHaveLength(1)
    expect(result!.groupSessions[0].groupName).toBe('Clase 2B')
  })

  it('returns data when direct gift sessions exist', () => {
    mockGetMigrationData.mockReturnValue({
      groups: [],
      userName: null,
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([])
    mockGetDirectGiftSessionsFn.mockReturnValue([
      {
        shareCode: 'xyz789',
        recipientName: 'Juan',
        occasion: 'birthday',
        organizerName: 'Maria',
        createdAt: '2026-01-01',
      },
    ])

    const result = collectMigrationData()
    expect(result).not.toBeNull()
    expect(result!.directGiftSessions).toHaveLength(1)
  })

  it('includes all data sources in returned object', () => {
    mockGetMigrationData.mockReturnValue({
      groups: ['g1', 'g2'],
      userName: 'Carlos',
      familyId: 'f1',
    })
    mockGetGroupSessionsFn.mockReturnValue([
      {
        groupId: 'g1',
        groupName: 'Clase 2B',
        familyId: 'f1',
        familyName: 'Garcia',
        isCreator: true,
        inviteCode: 'abc',
        joinedAt: '2026-01-01',
      },
    ])
    mockGetDirectGiftSessionsFn.mockReturnValue([
      {
        shareCode: 'xyz',
        recipientName: 'Ana',
        occasion: 'birthday',
        organizerName: 'Carlos',
        createdAt: '2026-01-01',
      },
    ])

    const result = collectMigrationData()
    expect(result).toEqual({
      groups: ['g1', 'g2'],
      userName: 'Carlos',
      familyId: 'f1',
      groupSessions: expect.arrayContaining([
        expect.objectContaining({ groupId: 'g1' }),
      ]),
      directGiftSessions: expect.arrayContaining([
        expect.objectContaining({ shareCode: 'xyz' }),
      ]),
    })
  })
})

describe('migrateAnonData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    setupNoData()
  })

  it('does nothing when no anonymous data exists', async () => {
    await migrateAnonData()

    expect(mockGetUser).not.toHaveBeenCalled()
    expect(mockUpdateUser).not.toHaveBeenCalled()
    expect(mockClear).not.toHaveBeenCalled()
    expect(mockClearAllSessionsFn).not.toHaveBeenCalled()
  })

  it('updates user_metadata with anonymous name if user has no name', async () => {
    mockGetMigrationData.mockReturnValue({
      groups: ['g1'],
      userName: 'Maria',
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([])
    mockGetDirectGiftSessionsFn.mockReturnValue([])
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', user_metadata: {} } },
    })
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    mockFetchSuccess()

    await migrateAnonData()

    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { name: 'Maria' },
    })
  })

  it('does not overwrite existing user name', async () => {
    mockGetMigrationData.mockReturnValue({
      groups: ['g1'],
      userName: 'Maria',
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([])
    mockGetDirectGiftSessionsFn.mockReturnValue([])
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1', user_metadata: { name: 'Carlos' } } },
    })
    mockFetchSuccess()

    await migrateAnonData()

    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('calls link endpoint with family IDs from group sessions', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    mockGetMigrationData.mockReturnValue({
      groups: [],
      userName: null,
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([
      {
        groupId: 'g1',
        groupName: 'Clase 2B',
        familyId: 'f1',
        familyName: 'Garcia',
        isCreator: false,
        inviteCode: 'abc',
        joinedAt: '2026-01-01',
      },
      {
        groupId: 'g2',
        groupName: 'Clase 3A',
        familyId: 'f2',
        familyName: 'Lopez',
        isCreator: true,
        inviteCode: 'def',
        joinedAt: '2026-01-02',
      },
    ])
    mockGetDirectGiftSessionsFn.mockReturnValue([])

    await migrateAnonData()

    expect(mockFetch).toHaveBeenCalledWith('/api/families/link', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyIds: ['f1', 'f2'] }),
    })
  })

  it('clears localStorage after successful migration', async () => {
    mockFetchSuccess()
    mockGetMigrationData.mockReturnValue({
      groups: ['g1'],
      userName: null,
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([
      {
        groupId: 'g1',
        groupName: 'Clase 2B',
        familyId: 'f1',
        familyName: 'Garcia',
        isCreator: false,
        inviteCode: 'abc',
        joinedAt: '2026-01-01',
      },
    ])
    mockGetDirectGiftSessionsFn.mockReturnValue([])

    await migrateAnonData()

    expect(mockClear).toHaveBeenCalled()
    expect(mockClearAllSessionsFn).toHaveBeenCalled()
  })

  it('clears localStorage even when no family IDs to link', async () => {
    // Only has anonymousStorage groups, no groupSessions → no family IDs
    mockGetMigrationData.mockReturnValue({
      groups: ['g1'],
      userName: null,
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([])
    mockGetDirectGiftSessionsFn.mockReturnValue([])

    await migrateAnonData()

    expect(mockClear).toHaveBeenCalled()
    expect(mockClearAllSessionsFn).toHaveBeenCalled()
  })

  it('does not clear localStorage if link endpoint fails', async () => {
    mockFetchFailure()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockGetMigrationData.mockReturnValue({
      groups: [],
      userName: null,
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([
      {
        groupId: 'g1',
        groupName: 'Clase 2B',
        familyId: 'f1',
        familyName: 'Garcia',
        isCreator: false,
        inviteCode: 'abc',
        joinedAt: '2026-01-01',
      },
    ])
    mockGetDirectGiftSessionsFn.mockReturnValue([])

    await migrateAnonData()

    expect(mockClear).not.toHaveBeenCalled()
    expect(mockClearAllSessionsFn).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('still migrates name even if user_metadata update fails', async () => {
    mockGetMigrationData.mockReturnValue({
      groups: ['g1'],
      userName: 'Maria',
      familyId: null,
    })
    mockGetGroupSessionsFn.mockReturnValue([])
    mockGetDirectGiftSessionsFn.mockReturnValue([])
    mockGetUser.mockRejectedValue(new Error('network error'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Should not throw
    await expect(migrateAnonData()).resolves.toBeUndefined()

    consoleSpy.mockRestore()
  })
})
