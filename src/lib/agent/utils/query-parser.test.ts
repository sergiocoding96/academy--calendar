import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseDateExpression,
  parseCategory,
  parseTournamentType,
  parseLocation,
  parseLevel,
  parseQuery,
} from './query-parser'

// Fix the current date for deterministic tests
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-03-10T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

// ============================================
// parseDateExpression
// ============================================

describe('parseDateExpression', () => {
  it('parses "today"', () => {
    const result = parseDateExpression('today')
    expect(result).toEqual({ date_from: '2025-03-10', date_to: '2025-03-10' })
  })

  it('parses "tomorrow"', () => {
    const result = parseDateExpression('tomorrow')
    expect(result).toEqual({ date_from: '2025-03-11', date_to: '2025-03-11' })
  })

  it('parses "this week" starting on Monday', () => {
    const result = parseDateExpression('this week')
    expect(result).not.toBeNull()
    expect(result!.date_from).toBe('2025-03-10') // Monday
    expect(result!.date_to).toBe('2025-03-16') // Sunday
  })

  it('parses "next week"', () => {
    const result = parseDateExpression('next week')
    expect(result).not.toBeNull()
    expect(result!.date_from).toBe('2025-03-17') // Next Monday
    expect(result!.date_to).toBe('2025-03-23') // Next Sunday
  })

  it('parses "this month"', () => {
    const result = parseDateExpression('this month')
    expect(result).toEqual({ date_from: '2025-03-01', date_to: '2025-03-31' })
  })

  it('parses "next month"', () => {
    const result = parseDateExpression('next month')
    expect(result).toEqual({ date_from: '2025-04-01', date_to: '2025-04-30' })
  })

  it('parses "next month" across year boundary', () => {
    vi.setSystemTime(new Date('2025-12-15'))
    const result = parseDateExpression('next month')
    expect(result).toEqual({ date_from: '2026-01-01', date_to: '2026-01-31' })
  })

  it('parses "in 7 days"', () => {
    const result = parseDateExpression('in 7 days')
    expect(result).toEqual({ date_from: '2025-03-10', date_to: '2025-03-17' })
  })

  it('parses "next 14 days"', () => {
    const result = parseDateExpression('next 14 days')
    expect(result).toEqual({ date_from: '2025-03-10', date_to: '2025-03-24' })
  })

  it('parses month name "January"', () => {
    const result = parseDateExpression('January')
    expect(result).toEqual({ date_from: '2025-01-01', date_to: '2025-01-31' })
  })

  it('parses month name with year "March 2026"', () => {
    const result = parseDateExpression('March 2026')
    expect(result).toEqual({ date_from: '2026-03-01', date_to: '2026-03-31' })
  })

  it('parses abbreviated month "Sep"', () => {
    const result = parseDateExpression('Sep')
    expect(result).toEqual({ date_from: '2025-09-01', date_to: '2025-09-30' })
  })

  it('parses quarter Q1', () => {
    const result = parseDateExpression('Q1')
    expect(result).toEqual({ date_from: '2025-01-01', date_to: '2025-03-31' })
  })

  it('parses quarter Q3 2026', () => {
    const result = parseDateExpression('Q3 2026')
    expect(result).toEqual({ date_from: '2026-07-01', date_to: '2026-09-30' })
  })

  it('parses year "2025"', () => {
    const result = parseDateExpression('2025')
    expect(result).toEqual({ date_from: '2025-01-01', date_to: '2025-12-31' })
  })

  it('parses "upcoming"', () => {
    const result = parseDateExpression('upcoming')
    expect(result).not.toBeNull()
    expect(result!.date_from).toBe('2025-03-10')
    expect(result!.date_to).toBe('2025-06-10')
  })

  it('parses "future"', () => {
    const result = parseDateExpression('future')
    expect(result).not.toBeNull()
    expect(result!.date_from).toBe('2025-03-10')
  })

  it('returns null for unrecognized expressions', () => {
    expect(parseDateExpression('something random')).toBeNull()
  })
})

// ============================================
// parseCategory
// ============================================

describe('parseCategory', () => {
  it('parses U12 variants', () => {
    expect(parseCategory('U12 tournaments')).toBe('U12')
    expect(parseCategory('under 12 events')).toBe('U12')
    expect(parseCategory('12 and under')).toBe('U12')
  })

  it('parses U14', () => {
    expect(parseCategory('Show me U14 tournaments')).toBe('U14')
  })

  it('parses U16', () => {
    expect(parseCategory('U16 in Barcelona')).toBe('U16')
  })

  it('parses U18 and junior', () => {
    expect(parseCategory('U18 grade 3')).toBe('U18')
    expect(parseCategory('junior tournaments')).toBe('U18')
  })

  it('parses adult/open/senior', () => {
    expect(parseCategory('adult tournaments')).toBe('Adults')
    expect(parseCategory('open category')).toBe('Adults')
    expect(parseCategory('senior events')).toBe('Adults')
  })

  it('returns null for no category', () => {
    expect(parseCategory('tournaments in Madrid')).toBeNull()
  })
})

// ============================================
// parseTournamentType
// ============================================

describe('parseTournamentType', () => {
  it('parses local/proximity', () => {
    expect(parseTournamentType('local tournaments')).toBe('proximity')
    expect(parseTournamentType('nearby events')).toBe('proximity')
    expect(parseTournamentType('close tournaments')).toBe('proximity')
  })

  it('parses national', () => {
    expect(parseTournamentType('national championship')).toBe('national')
  })

  it('parses international', () => {
    expect(parseTournamentType('international tournaments')).toBe('international')
    expect(parseTournamentType('overseas events')).toBe('international')
    expect(parseTournamentType('tournaments abroad')).toBe('international')
  })

  it('returns null for no type', () => {
    expect(parseTournamentType('U14 tournaments')).toBeNull()
  })
})

// ============================================
// parseLocation
// ============================================

describe('parseLocation', () => {
  it('extracts location from "in City" pattern', () => {
    expect(parseLocation('tournaments in Barcelona')).toBe('Barcelona')
  })

  it('extracts location from "at City" pattern', () => {
    expect(parseLocation('events at Madrid')).toBe('Madrid')
  })

  it('recognizes Spanish cities', () => {
    expect(parseLocation('I need valencia tournaments')).toBe('Valencia')
    expect(parseLocation('seville events')).toBe('Seville')
    expect(parseLocation('tournaments malaga')).toBe('Malaga')
  })

  it('recognizes Spain via preposition pattern', () => {
    // The regex uses 'i' flag so "in spain" matches the preposition pattern,
    // returning the raw captured text without capitalization
    expect(parseLocation('tournaments in spain')).toBe('spain')
  })

  it('returns null when no location found', () => {
    expect(parseLocation('U14 grade 3 tournaments')).toBeNull()
  })
})

// ============================================
// parseLevel
// ============================================

describe('parseLevel', () => {
  it('parses Grade levels', () => {
    expect(parseLevel('Grade 1 tournaments')).toBe('Grade 1')
    expect(parseLevel('grade 3 events')).toBe('Grade 3')
    expect(parseLevel('grade 5 local')).toBe('Grade 5')
  })

  it('parses abbreviated grade levels', () => {
    expect(parseLevel('G1 tournaments')).toBe('Grade 1')
    expect(parseLevel('g3 events')).toBe('Grade 3')
  })

  it('parses level N format', () => {
    expect(parseLevel('level 2 events')).toBe('Grade 2')
  })

  it('parses ITF', () => {
    expect(parseLevel('ITF World Tennis Tour')).toBe('ITF')
  })

  it('parses Tennis Europe', () => {
    expect(parseLevel('Tennis Europe circuit')).toBe('Tennis Europe')
    expect(parseLevel('TE events')).toBe('Tennis Europe')
  })

  it('returns null for no level', () => {
    expect(parseLevel('U14 tournaments in Madrid')).toBeNull()
  })
})

// ============================================
// parseQuery (full integration)
// ============================================

describe('parseQuery', () => {
  it('parses a complex query with category, level, type, and location', () => {
    // parseDateExpression uses exact matches like "next month", so it won't
    // extract dates from a longer sentence. The location regex captures from
    // "in" to end-of-string, including trailing text.
    const result = parseQuery('U14 Grade 3 international tournaments in Barcelona')
    expect(result.category).toBe('U14')
    expect(result.level).toBe('Grade 3')
    expect(result.tournament_type).toBe('international')
    expect(result.location).toBe('Barcelona')
  })

  it('parses date expression when it matches the full text', () => {
    const result = parseQuery('next month')
    expect(result.date_from).toBe('2025-04-01')
    expect(result.date_to).toBe('2025-04-30')
  })

  it('parses a simple query', () => {
    const result = parseQuery('U16 tournaments')
    expect(result.category).toBe('U16')
    expect(result.level).toBeUndefined()
    expect(result.location).toBeUndefined()
  })

  it('parses date-only query', () => {
    const result = parseQuery('this month')
    expect(result.date_from).toBe('2025-03-01')
    expect(result.date_to).toBe('2025-03-31')
  })

  it('returns empty object for unrecognized query', () => {
    const result = parseQuery('hello world')
    expect(result).toEqual({})
  })

  it('parses location-only query', () => {
    const result = parseQuery('tournaments in Madrid')
    expect(result.location).toBe('Madrid')
  })
})
