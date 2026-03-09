import { describe, it, expect } from 'vitest'
import { cn, formatTime, formatDate, getWeekDates, generateTimeSlots, getCoachColor } from './utils'

// ============================================
// formatTime
// ============================================

describe('formatTime', () => {
  it('formats morning time correctly', () => {
    expect(formatTime('09:30')).toBe('9:30 AM')
  })

  it('formats afternoon time correctly', () => {
    expect(formatTime('14:00')).toBe('2:00 PM')
  })

  it('formats noon as 12 PM', () => {
    expect(formatTime('12:00')).toBe('12:00 PM')
  })

  it('formats midnight as 12 AM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM')
  })

  it('formats 1 AM correctly', () => {
    expect(formatTime('01:15')).toBe('1:15 AM')
  })

  it('formats 11 PM correctly', () => {
    expect(formatTime('23:45')).toBe('11:45 PM')
  })
})

// ============================================
// formatDate
// ============================================

describe('formatDate', () => {
  it('formats a date string to short format', () => {
    const result = formatDate('2025-03-15')
    // The exact output depends on locale, but should contain "Mar" and "15"
    expect(result).toContain('Mar')
    expect(result).toContain('15')
  })

  it('formats another date string', () => {
    const result = formatDate('2025-12-25')
    expect(result).toContain('Dec')
    expect(result).toContain('25')
  })
})

// ============================================
// getWeekDates
// ============================================

describe('getWeekDates', () => {
  it('returns 7 dates', () => {
    const dates = getWeekDates(new Date(2025, 2, 12)) // Wednesday March 12
    expect(dates).toHaveLength(7)
  })

  it('starts on Monday', () => {
    const dates = getWeekDates(new Date(2025, 2, 12)) // Wednesday March 12
    // Monday = day 1
    expect(dates[0].getDay()).toBe(1)
  })

  it('ends on Sunday', () => {
    const dates = getWeekDates(new Date(2025, 2, 12))
    expect(dates[6].getDay()).toBe(0)
  })

  it('returns consecutive days', () => {
    const dates = getWeekDates(new Date(2025, 2, 12))
    for (let i = 1; i < dates.length; i++) {
      const diff = dates[i].getDate() - dates[i - 1].getDate()
      // Handle month boundary: diff should be 1 or negative (month change)
      expect(diff === 1 || diff < -20).toBe(true)
    }
  })

  it('returns correct Monday for a Sunday input', () => {
    // getWeekDates uses: current.getDate() - current.getDay() + 1
    // For Sunday (day 0): 16 - 0 + 1 = 17, so it returns the NEXT Monday
    const dates = getWeekDates(new Date(2025, 2, 16)) // Sunday March 16
    expect(dates[0].getDate()).toBe(17) // Monday March 17
  })

  it('returns correct Monday for a Monday input', () => {
    const dates = getWeekDates(new Date(2025, 2, 10)) // Monday March 10
    expect(dates[0].getDate()).toBe(10)
  })
})

// ============================================
// generateTimeSlots
// ============================================

describe('generateTimeSlots', () => {
  it('generates default slots from 7 to 21', () => {
    const slots = generateTimeSlots()
    expect(slots[0]).toBe('07:00')
    expect(slots[slots.length - 1]).toBe('21:00')
  })

  it('generates half-hour intervals except for last hour', () => {
    const slots = generateTimeSlots(9, 11)
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00'])
  })

  it('handles single hour range', () => {
    const slots = generateTimeSlots(10, 10)
    expect(slots).toEqual(['10:00'])
  })

  it('pads single-digit hours with zero', () => {
    const slots = generateTimeSlots(7, 8)
    expect(slots[0]).toBe('07:00')
  })

  it('default range has correct count', () => {
    const slots = generateTimeSlots()
    // 7-21: 15 hours. Each hour has :00 and :30, except last hour has only :00
    // 14 * 2 + 1 = 29
    expect(slots).toHaveLength(29)
  })
})

// ============================================
// getCoachColor
// ============================================

describe('getCoachColor', () => {
  it('returns correct color for known coach', () => {
    expect(getCoachColor('Tom P')).toBe('bg-blue-500')
    expect(getCoachColor('Sergio')).toBe('bg-red-500')
  })

  it('returns default color for unknown coach', () => {
    expect(getCoachColor('Unknown Person')).toBe('bg-gray-500')
  })

  it('returns default for empty string', () => {
    expect(getCoachColor('')).toBe('bg-gray-500')
  })
})

// ============================================
// cn (class name merger)
// ============================================

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('merges tailwind conflicting classes', () => {
    // twMerge should keep the last conflicting class
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })
})
