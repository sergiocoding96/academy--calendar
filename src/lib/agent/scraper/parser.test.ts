import { describe, it, expect } from 'vitest'
import {
  parseDate,
  normalizeCategory,
  normalizeSurface,
  generateTournamentId,
} from './parser'

// ============================================
// parseDate
// ============================================

describe('parseDate', () => {
  it('parses YYYY-MM-DD format', () => {
    expect(parseDate('2025-03-15')).toBe('2025-03-15')
  })

  it('parses DD/MM/YYYY format (European)', () => {
    expect(parseDate('15/03/2025')).toBe('2025-03-15')
  })

  it('parses DD.MM.YYYY format', () => {
    expect(parseDate('15.03.2025')).toBe('2025-03-15')
  })

  it('parses "Month DD, YYYY" format', () => {
    expect(parseDate('March 15, 2025')).toBe('2025-03-15')
  })

  it('parses "DD Month YYYY" format', () => {
    expect(parseDate('15 March 2025')).toBe('2025-03-15')
  })

  it('parses abbreviated month names', () => {
    expect(parseDate('Mar 15, 2025')).toBe('2025-03-15')
    expect(parseDate('15 Mar 2025')).toBe('2025-03-15')
  })

  it('returns null for null input', () => {
    expect(parseDate(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(parseDate(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseDate('')).toBeNull()
  })

  it('returns null for whitespace only', () => {
    expect(parseDate('   ')).toBeNull()
  })

  it('handles single digit day/month in DD/MM/YYYY', () => {
    expect(parseDate('5/3/2025')).toBe('2025-03-05')
  })

  it('handles dates at year boundaries', () => {
    expect(parseDate('December 31, 2025')).toBe('2025-12-31')
    expect(parseDate('January 1, 2026')).toBe('2026-01-01')
  })
})

// ============================================
// normalizeCategory
// ============================================

describe('normalizeCategory', () => {
  it('normalizes standard U-categories', () => {
    expect(normalizeCategory('u12')).toBe('U12')
    expect(normalizeCategory('U14')).toBe('U14')
    expect(normalizeCategory('u16')).toBe('U16')
    expect(normalizeCategory('u18')).toBe('U18')
  })

  it('normalizes hyphenated categories', () => {
    expect(normalizeCategory('U-12')).toBe('U12')
    expect(normalizeCategory('u-14')).toBe('U14')
  })

  it('normalizes "under X" format', () => {
    expect(normalizeCategory('under 12')).toBe('U12')
    expect(normalizeCategory('Under 16')).toBe('U16')
  })

  it('normalizes "X & under" format', () => {
    expect(normalizeCategory('12 & under')).toBe('U12')
    expect(normalizeCategory('14 & under')).toBe('U14')
  })

  it('normalizes "Xu" format', () => {
    expect(normalizeCategory('12u')).toBe('U12')
    expect(normalizeCategory('18u')).toBe('U18')
  })

  it('normalizes adult categories', () => {
    expect(normalizeCategory('men')).toBe('Open')
    expect(normalizeCategory('women')).toBe('Open')
    expect(normalizeCategory('open')).toBe('Open')
    expect(normalizeCategory('pro')).toBe('Open')
    expect(normalizeCategory('professional')).toBe('Open')
  })

  it('normalizes senior categories', () => {
    expect(normalizeCategory('senior')).toBe('Senior')
    expect(normalizeCategory('seniors')).toBe('Senior')
    expect(normalizeCategory('35+')).toBe('Senior')
  })

  it('returns null for null/undefined input', () => {
    expect(normalizeCategory(null)).toBeNull()
    expect(normalizeCategory(undefined)).toBeNull()
  })

  it('returns original string for unknown categories', () => {
    expect(normalizeCategory('Special')).toBe('Special')
  })

  it('trims whitespace', () => {
    expect(normalizeCategory('  u14  ')).toBe('U14')
  })
})

// ============================================
// normalizeSurface
// ============================================

describe('normalizeSurface', () => {
  it('normalizes hard court variants', () => {
    expect(normalizeSurface('hard')).toBe('Hard')
    expect(normalizeSurface('hardcourt')).toBe('Hard')
    expect(normalizeSurface('hard court')).toBe('Hard')
  })

  it('normalizes clay variants', () => {
    expect(normalizeSurface('clay')).toBe('Clay')
    expect(normalizeSurface('red clay')).toBe('Clay')
    expect(normalizeSurface('terre battue')).toBe('Clay')
  })

  it('normalizes grass variants', () => {
    expect(normalizeSurface('grass')).toBe('Grass')
    expect(normalizeSurface('lawn')).toBe('Grass')
  })

  it('normalizes indoor variants', () => {
    expect(normalizeSurface('indoor')).toBe('Indoor Hard')
    expect(normalizeSurface('indoor hard')).toBe('Indoor Hard')
  })

  it('normalizes carpet', () => {
    expect(normalizeSurface('carpet')).toBe('Carpet')
    expect(normalizeSurface('indoor carpet')).toBe('Carpet')
  })

  it('returns null for null/undefined', () => {
    expect(normalizeSurface(null)).toBeNull()
    expect(normalizeSurface(undefined)).toBeNull()
  })

  it('returns original for unknown surfaces', () => {
    expect(normalizeSurface('Artificial')).toBe('Artificial')
  })

  it('is case insensitive', () => {
    expect(normalizeSurface('HARD')).toBe('Hard')
    expect(normalizeSurface('Clay')).toBe('Clay')
  })
})

// ============================================
// generateTournamentId
// ============================================

describe('generateTournamentId', () => {
  it('generates an ID starting with scraped_', () => {
    const id = generateTournamentId('Test', '2025-03-15', 'Madrid')
    expect(id).toMatch(/^scraped_[0-9a-f]+$/)
  })

  it('generates consistent IDs for same input', () => {
    const id1 = generateTournamentId('Tournament A', '2025-03-15', 'Barcelona')
    const id2 = generateTournamentId('Tournament A', '2025-03-15', 'Barcelona')
    expect(id1).toBe(id2)
  })

  it('generates different IDs for different inputs', () => {
    const id1 = generateTournamentId('Tournament A', '2025-03-15', 'Barcelona')
    const id2 = generateTournamentId('Tournament B', '2025-03-15', 'Barcelona')
    expect(id1).not.toBe(id2)
  })

  it('handles null start date', () => {
    const id = generateTournamentId('Test', null, 'Madrid')
    expect(id).toMatch(/^scraped_/)
  })

  it('handles null location', () => {
    const id = generateTournamentId('Test', '2025-03-15', null)
    expect(id).toMatch(/^scraped_/)
  })

  it('handles both null values', () => {
    const id = generateTournamentId('Test', null, null)
    expect(id).toMatch(/^scraped_/)
  })
})
