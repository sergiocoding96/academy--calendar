import { describe, it, expect } from 'vitest'
import {
  formatTime,
  unwrap,
  buildSlackMessage,
  buildWeeklyMessage,
  type SessionRow,
} from './message-builder'

// ============================================
// Helper to build a minimal SessionRow
// ============================================

function makeSession(overrides: Partial<SessionRow> = {}): SessionRow {
  return {
    id: 'sess-1',
    date: '2025-03-15',
    start_time: '09:00',
    end_time: '10:00',
    session_type: 'on_court',
    notes: null,
    court: { name: 'Court 1' },
    coach: { name: 'Tom P' },
    session_players: [],
    ...overrides,
  }
}

// ============================================
// formatTime
// ============================================

describe('formatTime (daily-digest)', () => {
  it('formats morning time', () => {
    expect(formatTime('09:30')).toBe('9:30 AM')
  })

  it('formats afternoon time', () => {
    expect(formatTime('14:00')).toBe('2:00 PM')
  })

  it('formats noon as 12 PM', () => {
    expect(formatTime('12:00')).toBe('12:00 PM')
  })

  it('formats midnight as 12 AM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM')
  })

  it('returns raw string for non-numeric input', () => {
    expect(formatTime('abc')).toBe('abc')
  })

  it('handles hour-only (no minutes)', () => {
    expect(formatTime('15')).toBe('3:00 PM')
  })

  it('formats 11 PM correctly', () => {
    expect(formatTime('23:45')).toBe('11:45 PM')
  })
})

// ============================================
// unwrap
// ============================================

describe('unwrap', () => {
  it('returns the object when given an object', () => {
    const obj = { name: 'Court 1' }
    expect(unwrap(obj)).toBe(obj)
  })

  it('returns first element when given an array', () => {
    expect(unwrap([{ name: 'A' }, { name: 'B' }])).toEqual({ name: 'A' })
  })

  it('returns null when given an empty array', () => {
    expect(unwrap([])).toBeNull()
  })

  it('returns null when given null', () => {
    expect(unwrap(null)).toBeNull()
  })
})

// ============================================
// buildSlackMessage
// ============================================

describe('buildSlackMessage', () => {
  it('shows empty-day message when 0 sessions', () => {
    const msg = buildSlackMessage('2025-03-15', [])
    expect(msg).toContain('Daily Schedule')
    expect(msg).toContain('No sessions scheduled for today')
    expect(msg).toContain(':beach_with_umbrella:')
  })

  it('shows active sessions with court, coach, and players', () => {
    const session = makeSession({
      session_players: [
        { status: 'confirmed', player: { name: 'Alice' } },
        { status: 'confirmed', player: { name: 'Bob' } },
      ],
    })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('1 active session')
    expect(msg).not.toContain('cancelled')
    expect(msg).toContain('9:00 AM')
    expect(msg).toContain('10:00 AM')
    expect(msg).toContain('Court 1')
    expect(msg).toContain('Tom P')
    expect(msg).toContain('Alice')
    expect(msg).toContain('Bob')
  })

  it('shows cancelled sessions with strikethrough', () => {
    const session = makeSession({
      notes: '[Cancelled] Rain',
    })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('0 active sessions')
    expect(msg).toContain('1 cancelled')
    expect(msg).toContain(':no_entry_sign:')
    expect(msg).toContain('_(cancelled)_')
  })

  it('handles mixed active and cancelled sessions', () => {
    const active = makeSession({ id: 'a', start_time: '09:00' })
    const cancelled = makeSession({
      id: 'b',
      start_time: '11:00',
      notes: '[Cancelled]',
    })
    const msg = buildSlackMessage('2025-03-15', [active, cancelled])
    expect(msg).toContain('1 active session,')
    expect(msg).toContain('1 cancelled')
    expect(msg).toContain(':clock3:')
    expect(msg).toContain(':no_entry_sign:')
  })

  it('sorts sessions by start_time', () => {
    const late = makeSession({ id: 'late', start_time: '14:00', end_time: '15:00' })
    const early = makeSession({ id: 'early', start_time: '08:00', end_time: '09:00' })
    const msg = buildSlackMessage('2025-03-15', [late, early])
    const idx8 = msg.indexOf('8:00 AM')
    const idx2 = msg.indexOf('2:00 PM')
    expect(idx8).toBeLessThan(idx2)
  })

  it('shows "No players assigned" when session has no players', () => {
    const session = makeSession({ session_players: [] })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('No players assigned')
  })

  it('marks absent players with strikethrough', () => {
    const session = makeSession({
      session_players: [
        { status: 'absent', player: { name: 'Charlie' } },
      ],
    })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('~Charlie~ _(absent)_')
  })

  it('excludes cancelled players from the player list', () => {
    const session = makeSession({
      session_players: [
        { status: 'confirmed', player: { name: 'Alice' } },
        { status: 'cancelled', player: { name: 'Bob' } },
      ],
    })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('Alice')
    expect(msg).not.toContain('Bob')
  })

  it('handles court/coach as arrays (PostgREST joins)', () => {
    const session = makeSession({
      court: [{ name: 'Court 3' }],
      coach: [{ name: 'Sergio' }],
    })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('Court 3')
    expect(msg).toContain('Sergio')
  })

  it('handles null court and coach gracefully', () => {
    const session = makeSession({ court: null, coach: null })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).not.toContain(':round_pushpin:')
    expect(msg).not.toContain(':bust_in_silhouette:')
  })

  it('replaces underscores in session_type', () => {
    const session = makeSession({ session_type: 'match_play' })
    const msg = buildSlackMessage('2025-03-15', [session])
    expect(msg).toContain('Match play')
    expect(msg).not.toContain('match_play')
  })

  it('pluralizes "sessions" correctly for multiple active', () => {
    const s1 = makeSession({ id: '1', start_time: '09:00' })
    const s2 = makeSession({ id: '2', start_time: '10:00' })
    const msg = buildSlackMessage('2025-03-15', [s1, s2])
    expect(msg).toContain('2 active sessions')
  })
})

// ============================================
// buildWeeklyMessage
// ============================================

describe('buildWeeklyMessage', () => {
  it('shows empty-week message when 0 sessions', () => {
    const msg = buildWeeklyMessage('2025-03-10', [])
    expect(msg).toContain('Weekly Schedule')
    expect(msg).toContain('No sessions scheduled this week')
    expect(msg).toContain(':beach_with_umbrella:')
  })

  it('includes date range in header', () => {
    const msg = buildWeeklyMessage('2025-03-10', [])
    // Mar 10 – Mar 16, 2025
    expect(msg).toContain('Mar 10')
    expect(msg).toContain('Mar 16')
    expect(msg).toContain('2025')
  })

  it('groups sessions by date', () => {
    const monday = makeSession({ id: '1', date: '2025-03-10', start_time: '09:00' })
    const wednesday = makeSession({ id: '2', date: '2025-03-12', start_time: '10:00' })
    const msg = buildWeeklyMessage('2025-03-10', [monday, wednesday])

    // Both day headers should appear
    expect(msg).toContain('Monday')
    expect(msg).toContain('Wednesday')
    // Dates sorted: Monday before Wednesday
    const idxMon = msg.indexOf('Monday')
    const idxWed = msg.indexOf('Wednesday')
    expect(idxMon).toBeLessThan(idxWed)
  })

  it('shows active session count summary', () => {
    const s1 = makeSession({ id: '1', date: '2025-03-10' })
    const s2 = makeSession({ id: '2', date: '2025-03-10', notes: '[Cancelled]' })
    const msg = buildWeeklyMessage('2025-03-10', [s1, s2])
    expect(msg).toContain('1 active session,')
    expect(msg).toContain('1 cancelled')
  })

  it('shows cancelled sessions with strikethrough in weekly view', () => {
    const cancelled = makeSession({
      date: '2025-03-10',
      notes: '[Cancelled]',
      session_type: 'on_court',
    })
    const msg = buildWeeklyMessage('2025-03-10', [cancelled])
    expect(msg).toContain(':no_entry_sign:')
    expect(msg).toContain('~')
  })

  it('includes player names inline', () => {
    const session = makeSession({
      date: '2025-03-10',
      session_players: [
        { status: 'confirmed', player: { name: 'Alice' } },
        { status: 'confirmed', player: { name: 'Bob' } },
      ],
    })
    const msg = buildWeeklyMessage('2025-03-10', [session])
    expect(msg).toContain('Alice, Bob')
  })

  it('shows per-day session count', () => {
    const s1 = makeSession({ id: '1', date: '2025-03-10', start_time: '09:00' })
    const s2 = makeSession({ id: '2', date: '2025-03-10', start_time: '11:00' })
    const msg = buildWeeklyMessage('2025-03-10', [s1, s2])
    expect(msg).toContain('2 sessions')
  })

  it('uses singular "session" for 1 active per day', () => {
    const s1 = makeSession({ date: '2025-03-10' })
    const msg = buildWeeklyMessage('2025-03-10', [s1])
    // The day header should say "1 session" (no 's')
    expect(msg).toMatch(/1 session[^s]/)
  })

  it('excludes cancelled players from weekly player names', () => {
    const session = makeSession({
      date: '2025-03-10',
      session_players: [
        { status: 'confirmed', player: { name: 'Alice' } },
        { status: 'cancelled', player: { name: 'Bob' } },
      ],
    })
    const msg = buildWeeklyMessage('2025-03-10', [session])
    expect(msg).toContain('Alice')
    expect(msg).not.toContain('Bob')
  })
})
