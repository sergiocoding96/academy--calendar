import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UserProfile } from '@/types/database'

// Mock React's cache (used at module level in auth/index.ts)
vi.mock('react', () => ({
  cache: (fn: unknown) => fn,
}))

// Mock next/navigation (used by requireAuth/requireRole/signOut)
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock the Supabase server client
const mockMaybeSingle = vi.fn()
const mockEq2 = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
const mockEq1 = vi.fn(() => ({ eq: mockEq2 }))
const mockSelect = vi.fn(() => ({ eq: mockEq1 }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}))

// Import after mocking
import { canAccessPlayer } from './index'

// ============================================
// Helper to build a mock UserProfile
// ============================================

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-1',
    created_at: '2025-01-01T00:00:00Z',
    email: 'test@test.com',
    full_name: 'Test User',
    role: 'player',
    player_id: null,
    coach_id: null,
    avatar_url: null,
    ...overrides,
  }
}

// ============================================
// canAccessPlayer
// ============================================

describe('canAccessPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('admin can access any player', async () => {
    const admin = makeProfile({ role: 'admin' })
    const result = await canAccessPlayer(admin, 'any-player-id')
    expect(result).toBe(true)
    // Should not query the database
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('player can access themselves (matching player_id)', async () => {
    const player = makeProfile({
      role: 'player',
      player_id: 'player-123',
    })
    const result = await canAccessPlayer(player, 'player-123')
    expect(result).toBe(true)
  })

  it('player cannot access another player', async () => {
    const player = makeProfile({
      role: 'player',
      player_id: 'player-123',
    })
    const result = await canAccessPlayer(player, 'player-456')
    expect(result).toBe(false)
  })

  it('player with null player_id cannot access any player', async () => {
    const player = makeProfile({
      role: 'player',
      player_id: null,
    })
    const result = await canAccessPlayer(player, 'player-123')
    expect(result).toBe(false)
  })

  it('coach with assignment can access assigned player', async () => {
    const coach = makeProfile({
      role: 'coach',
      coach_id: 'coach-1',
    })

    mockMaybeSingle.mockResolvedValue({ data: { id: 'assignment-1' } })

    const result = await canAccessPlayer(coach, 'player-123')
    expect(result).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('player_coach_assignments')
    expect(mockSelect).toHaveBeenCalledWith('id')
    expect(mockEq1).toHaveBeenCalledWith('player_id', 'player-123')
    expect(mockEq2).toHaveBeenCalledWith('coach_id', 'coach-1')
  })

  it('coach without assignment cannot access unassigned player', async () => {
    const coach = makeProfile({
      role: 'coach',
      coach_id: 'coach-1',
    })

    mockMaybeSingle.mockResolvedValue({ data: null })

    const result = await canAccessPlayer(coach, 'player-999')
    expect(result).toBe(false)
  })

  it('coach with null coach_id returns false', async () => {
    const coach = makeProfile({
      role: 'coach',
      coach_id: null,
    })
    const result = await canAccessPlayer(coach, 'player-123')
    expect(result).toBe(false)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('unknown role returns false', async () => {
    const unknown = makeProfile({
      role: 'manager' as UserProfile['role'],
    })
    const result = await canAccessPlayer(unknown, 'player-123')
    expect(result).toBe(false)
  })
})
