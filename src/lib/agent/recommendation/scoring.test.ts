import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  scoreCategoryMatch,
  scoreLevelMatch,
  scoreTravelDistance,
  scoreAvailability,
  scoreEntryDeadline,
  scorePrestige,
  calculateTournamentScore,
  type PlayerProfile,
  type TournamentForScoring,
  type PlayerAvailability,
} from './scoring'

// ============================================
// scoreCategoryMatch
// ============================================

describe('scoreCategoryMatch', () => {
  it('returns full score for exact match', () => {
    const result = scoreCategoryMatch('U14', 'U14')
    expect(result.score).toBe(25)
    expect(result.description).toContain('Exact')
  })

  it('returns 60% for adjacent category', () => {
    const result = scoreCategoryMatch('U14', 'U16')
    expect(result.score).toBe(15) // 25 * 0.6
  })

  it('returns 20% for distant category', () => {
    const result = scoreCategoryMatch('U12', 'Adults')
    expect(result.score).toBe(5) // 25 * 0.2
  })

  it('returns 50% when tournament category is undefined', () => {
    const result = scoreCategoryMatch('U14', undefined)
    expect(result.score).toBe(12.5) // 25 * 0.5
    expect(result.description).toContain('Open')
  })

  it('handles case-insensitive category', () => {
    const result = scoreCategoryMatch('u14', 'U14')
    expect(result.score).toBe(25)
  })
})

// ============================================
// scoreLevelMatch
// ============================================

describe('scoreLevelMatch', () => {
  it('returns 50% when no tournament level specified', () => {
    const result = scoreLevelMatch(8, undefined)
    expect(result.score).toBe(12.5) // 25 * 0.5
  })

  it('returns 50% when no UTR and no level', () => {
    const result = scoreLevelMatch(undefined, undefined)
    expect(result.score).toBe(12.5)
  })

  it('returns full score for perfect level match (UTR 3, Grade 5)', () => {
    // UTR < 4 -> recommended difficulty 1, Grade 5 difficulty = 1
    const result = scoreLevelMatch(3, 'Grade 5')
    expect(result.score).toBe(25)
  })

  it('returns 75% for slightly off level', () => {
    // UTR 5 -> recommended difficulty 2, Grade 3 difficulty = 3, diff = 1
    const result = scoreLevelMatch(5, 'Grade 3')
    expect(result.score).toBe(18.75) // 25 * 0.75
  })

  it('returns 50% for level 2 steps off', () => {
    // UTR 3 -> recommended difficulty 1, Grade 3 difficulty = 3, diff = 2
    const result = scoreLevelMatch(3, 'Grade 3')
    expect(result.score).toBe(12.5) // 25 * 0.5
  })

  it('returns 25% for large level mismatch', () => {
    // UTR 3 -> recommended difficulty 1, ITF difficulty = 7, diff = 6
    const result = scoreLevelMatch(3, 'ITF')
    expect(result.score).toBe(6.25) // 25 * 0.25
  })

  it('handles high UTR correctly', () => {
    // UTR 11 -> recommended difficulty 5, Grade 1 difficulty = 5
    const result = scoreLevelMatch(11, 'Grade 1')
    expect(result.score).toBe(25)
  })
})

// ============================================
// scoreTravelDistance
// ============================================

describe('scoreTravelDistance', () => {
  it('returns full score for local tournaments', () => {
    expect(scoreTravelDistance('proximity').score).toBe(20)
    expect(scoreTravelDistance('local').score).toBe(20)
  })

  it('returns 60% for national tournaments', () => {
    expect(scoreTravelDistance('national').score).toBe(12)
  })

  it('returns 30% for international tournaments', () => {
    expect(scoreTravelDistance('international').score).toBe(6)
  })

  it('returns 50% for unknown type', () => {
    expect(scoreTravelDistance(undefined).score).toBe(10)
    expect(scoreTravelDistance('unknown').score).toBe(10)
  })

  it('is case insensitive', () => {
    expect(scoreTravelDistance('LOCAL').score).toBe(20)
    expect(scoreTravelDistance('National').score).toBe(12)
  })
})

// ============================================
// scoreAvailability
// ============================================

describe('scoreAvailability', () => {
  it('returns full score when player is available', () => {
    const avail: PlayerAvailability[] = [
      { start_date: '2025-03-01', end_date: '2025-03-31', availability_type: 'available' },
    ]
    const result = scoreAvailability('2025-03-10', '2025-03-15', avail)
    expect(result.score).toBe(15)
  })

  it('returns 50% for tentative availability', () => {
    const avail: PlayerAvailability[] = [
      { start_date: '2025-03-01', end_date: '2025-03-31', availability_type: 'tentative' },
    ]
    const result = scoreAvailability('2025-03-10', '2025-03-15', avail)
    expect(result.score).toBe(7.5)
  })

  it('returns 0 when player is unavailable during tournament', () => {
    const avail: PlayerAvailability[] = [
      { start_date: '2025-03-01', end_date: '2025-03-31', availability_type: 'unavailable' },
    ]
    const result = scoreAvailability('2025-03-10', '2025-03-15', avail)
    expect(result.score).toBe(0)
  })

  it('returns 75% when no availability info exists', () => {
    const result = scoreAvailability('2025-03-10', '2025-03-15', [])
    expect(result.score).toBe(11.25) // 15 * 0.75
  })

  it('handles single-day tournament with no end date', () => {
    const avail: PlayerAvailability[] = [
      { start_date: '2025-03-10', end_date: '2025-03-10', availability_type: 'available' },
    ]
    const result = scoreAvailability('2025-03-10', undefined, avail)
    expect(result.score).toBe(15)
  })

  it('returns 25% for partial overlap with unavailable', () => {
    const avail: PlayerAvailability[] = [
      { start_date: '2025-03-12', end_date: '2025-03-18', availability_type: 'unavailable' },
    ]
    // Tournament overlaps but not fully contained
    const result = scoreAvailability('2025-03-10', '2025-03-15', avail)
    expect(result.score).toBe(3.75) // 15 * 0.25
  })
})

// ============================================
// scoreEntryDeadline
// ============================================

describe('scoreEntryDeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-10'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 when deadline has passed', () => {
    const result = scoreEntryDeadline('2025-03-05')
    expect(result.score).toBe(0)
  })

  it('returns 30% when deadline is less than 3 days away', () => {
    const result = scoreEntryDeadline('2025-03-12')
    expect(result.score).toBe(3) // 10 * 0.3
  })

  it('returns 60% when deadline is less than 7 days away', () => {
    const result = scoreEntryDeadline('2025-03-15')
    expect(result.score).toBe(6) // 10 * 0.6
  })

  it('returns 80% when deadline is 1-2 weeks away', () => {
    const result = scoreEntryDeadline('2025-03-20')
    expect(result.score).toBe(8) // 10 * 0.8
  })

  it('returns full score when deadline is > 2 weeks away', () => {
    const result = scoreEntryDeadline('2025-04-15')
    expect(result.score).toBe(10)
  })

  it('returns 50% when no deadline specified', () => {
    const result = scoreEntryDeadline(undefined)
    expect(result.score).toBe(5) // 10 * 0.5
  })
})

// ============================================
// scorePrestige
// ============================================

describe('scorePrestige', () => {
  it('returns higher score for higher level tournaments', () => {
    const itfResult = scorePrestige('ITF')
    const grade5Result = scorePrestige('Grade 5')
    expect(itfResult.score).toBeGreaterThan(grade5Result.score)
  })

  it('returns 50% when no level specified', () => {
    const result = scorePrestige(undefined)
    expect(result.score).toBe(2.5) // 5 * 0.5
  })

  it('boosts score for international tournaments', () => {
    const withoutInternational = scorePrestige('Grade 3')
    const withInternational = scorePrestige('Grade 3', 'international')
    expect(withInternational.score).toBeGreaterThanOrEqual(withoutInternational.score)
  })

  it('caps prestige score at max weight', () => {
    const result = scorePrestige('ITF', 'international')
    expect(result.score).toBeLessThanOrEqual(5)
  })
})

// ============================================
// calculateTournamentScore
// ============================================

describe('calculateTournamentScore', () => {
  const player: PlayerProfile = {
    id: 'p1',
    name: 'Test Player',
    category: 'U14',
    utr_rating: 5,
  }

  const tournament: TournamentForScoring = {
    id: 't1',
    name: 'Test Tournament',
    category: 'U14',
    level: 'Grade 4',
    tournament_type: 'local',
    start_date: '2025-06-01',
    end_date: '2025-06-05',
    entry_deadline: '2025-05-15',
  }

  it('returns a score between 0 and 100', () => {
    const result = calculateTournamentScore(player, tournament)
    expect(result.totalScore).toBeGreaterThanOrEqual(0)
    expect(result.totalScore).toBeLessThanOrEqual(100)
  })

  it('includes all 6 scoring factors', () => {
    const result = calculateTournamentScore(player, tournament)
    expect(result.factors).toHaveProperty('categoryMatch')
    expect(result.factors).toHaveProperty('levelMatch')
    expect(result.factors).toHaveProperty('travelDistance')
    expect(result.factors).toHaveProperty('availability')
    expect(result.factors).toHaveProperty('entryDeadline')
    expect(result.factors).toHaveProperty('prestige')
  })

  it('returns a valid recommendation level', () => {
    const result = calculateTournamentScore(player, tournament)
    expect(['highly_recommended', 'recommended', 'consider', 'not_recommended']).toContain(
      result.recommendation
    )
  })

  it('scores higher for matching categories and levels', () => {
    const mismatchTournament: TournamentForScoring = {
      ...tournament,
      category: 'Adults',
      level: 'ITF',
      tournament_type: 'international',
    }
    const matchResult = calculateTournamentScore(player, tournament)
    const mismatchResult = calculateTournamentScore(player, mismatchTournament)
    expect(matchResult.totalScore).toBeGreaterThan(mismatchResult.totalScore)
  })

  it('considers player availabilities', () => {
    const availabilities: PlayerAvailability[] = [
      { start_date: '2025-06-01', end_date: '2025-06-30', availability_type: 'available' },
    ]
    const unavailabilities: PlayerAvailability[] = [
      { start_date: '2025-06-01', end_date: '2025-06-30', availability_type: 'unavailable' },
    ]
    const availResult = calculateTournamentScore(player, tournament, availabilities)
    const unavailResult = calculateTournamentScore(player, tournament, unavailabilities)
    expect(availResult.totalScore).toBeGreaterThan(unavailResult.totalScore)
  })

  it('each factor score does not exceed max', () => {
    const result = calculateTournamentScore(player, tournament)
    for (const factor of Object.values(result.factors)) {
      expect(factor.score).toBeLessThanOrEqual(factor.maxScore)
      expect(factor.score).toBeGreaterThanOrEqual(0)
    }
  })
})
