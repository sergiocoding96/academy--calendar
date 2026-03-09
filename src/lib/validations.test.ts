import { describe, it, expect } from 'vitest'
import {
  changeRequestCreateSchema,
  changeRequestActionSchema,
  masterScheduleCreateSchema,
  masterScheduleUpdateSchema,
  weekGenerateSchema,
  absenceSchema,
  chatMessageSchema,
  statusQuerySchema,
  weekQuerySchema,
} from './validations'

// ============================================
// changeRequestCreateSchema
// ============================================

describe('changeRequestCreateSchema', () => {
  it('accepts valid cancel_session request', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'cancel_session',
      target_session_id: 'session-123',
      reason: 'Player sick',
    })
    expect(result.success).toBe(true)
  })

  it('accepts add_session without target_session_id', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'add_session',
      reason: 'Extra training',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-add_session without target_session_id', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'move_time',
      reason: 'Need to move',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid change_type', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'invalid_type',
      target_session_id: 'session-123',
      reason: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty reason', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'cancel_session',
      target_session_id: 'session-123',
      reason: '',
    })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from reason', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'cancel_session',
      target_session_id: 'session-123',
      reason: '  Player sick  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('Player sick')
    }
  })

  it('accepts optional proposed_payload', () => {
    const result = changeRequestCreateSchema.safeParse({
      change_type: 'move_time',
      target_session_id: 'session-123',
      reason: 'Reschedule',
      proposed_payload: { new_time: '14:00' },
    })
    expect(result.success).toBe(true)
  })
})

// ============================================
// changeRequestActionSchema
// ============================================

describe('changeRequestActionSchema', () => {
  it('accepts approve action', () => {
    const result = changeRequestActionSchema.safeParse({ action: 'approve' })
    expect(result.success).toBe(true)
  })

  it('accepts reject with reason', () => {
    const result = changeRequestActionSchema.safeParse({
      action: 'reject',
      reject_reason: 'Not allowed',
    })
    expect(result.success).toBe(true)
  })

  it('accepts modify_approve with payload', () => {
    const result = changeRequestActionSchema.safeParse({
      action: 'modify_approve',
      modified_payload: { court: 'Court 2' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid action', () => {
    const result = changeRequestActionSchema.safeParse({ action: 'cancel' })
    expect(result.success).toBe(false)
  })
})

// ============================================
// masterScheduleCreateSchema
// ============================================

describe('masterScheduleCreateSchema', () => {
  it('accepts valid schedule entry', () => {
    const result = masterScheduleCreateSchema.safeParse({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
    })
    expect(result.success).toBe(true)
  })

  it('rejects day_of_week out of range', () => {
    const result = masterScheduleCreateSchema.safeParse({
      day_of_week: 7,
      start_time: '09:00',
      end_time: '10:00',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative day_of_week', () => {
    const result = masterScheduleCreateSchema.safeParse({
      day_of_week: -1,
      start_time: '09:00',
      end_time: '10:00',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid time format', () => {
    const result = masterScheduleCreateSchema.safeParse({
      day_of_week: 1,
      start_time: '9am',
      end_time: '10:00',
    })
    expect(result.success).toBe(false)
  })

  it('accepts time with seconds', () => {
    const result = masterScheduleCreateSchema.safeParse({
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '10:30:00',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional fields', () => {
    const result = masterScheduleCreateSchema.safeParse({
      day_of_week: 3,
      start_time: '14:00',
      end_time: '15:30',
      court_id: 'court-1',
      coach_id: 'coach-1',
      session_type: 'training',
      notes: 'Focus on serve',
      player_ids: ['player-1', 'player-2'],
    })
    expect(result.success).toBe(true)
  })
})

// ============================================
// masterScheduleUpdateSchema
// ============================================

describe('masterScheduleUpdateSchema', () => {
  it('accepts partial update', () => {
    const result = masterScheduleUpdateSchema.safeParse({
      start_time: '10:00',
    })
    expect(result.success).toBe(true)
  })

  it('accepts nullable fields', () => {
    const result = masterScheduleUpdateSchema.safeParse({
      court_id: null,
      coach_id: null,
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = masterScheduleUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================
// weekGenerateSchema
// ============================================

describe('weekGenerateSchema', () => {
  it('accepts valid date', () => {
    const result = weekGenerateSchema.safeParse({ week_start: '2025-03-10' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid date format', () => {
    const result = weekGenerateSchema.safeParse({ week_start: '03/10/2025' })
    expect(result.success).toBe(false)
  })

  it('rejects missing field', () => {
    const result = weekGenerateSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects partial date', () => {
    const result = weekGenerateSchema.safeParse({ week_start: '2025-03' })
    expect(result.success).toBe(false)
  })
})

// ============================================
// absenceSchema
// ============================================

describe('absenceSchema', () => {
  it('accepts valid reason', () => {
    const result = absenceSchema.safeParse({ reason: 'Feeling unwell' })
    expect(result.success).toBe(true)
  })

  it('rejects empty reason', () => {
    const result = absenceSchema.safeParse({ reason: '' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from reason', () => {
    const result = absenceSchema.safeParse({ reason: '  Sick  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('Sick')
    }
  })
})

// ============================================
// chatMessageSchema
// ============================================

describe('chatMessageSchema', () => {
  it('accepts minimal message', () => {
    const result = chatMessageSchema.safeParse({ message: 'Hello' })
    expect(result.success).toBe(true)
  })

  it('rejects empty message', () => {
    const result = chatMessageSchema.safeParse({ message: '' })
    expect(result.success).toBe(false)
  })

  it('accepts message with history and context', () => {
    const result = chatMessageSchema.safeParse({
      message: 'Show tournaments',
      conversationId: 'conv-123',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ],
      context: { playerId: 'player-1', weekNumber: 10 },
    })
    expect(result.success).toBe(true)
  })

  it('defaults history to empty array', () => {
    const result = chatMessageSchema.safeParse({ message: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.history).toEqual([])
    }
  })

  it('rejects invalid history role', () => {
    const result = chatMessageSchema.safeParse({
      message: 'Test',
      history: [{ role: 'system', content: 'nope' }],
    })
    expect(result.success).toBe(false)
  })
})

// ============================================
// statusQuerySchema
// ============================================

describe('statusQuerySchema', () => {
  it('accepts valid status values', () => {
    expect(statusQuerySchema.safeParse('pending').success).toBe(true)
    expect(statusQuerySchema.safeParse('approved').success).toBe(true)
    expect(statusQuerySchema.safeParse('rejected').success).toBe(true)
    expect(statusQuerySchema.safeParse('modified_approved').success).toBe(true)
  })

  it('rejects invalid status', () => {
    expect(statusQuerySchema.safeParse('cancelled').success).toBe(false)
  })

  it('defaults to pending when undefined', () => {
    const result = statusQuerySchema.safeParse(undefined)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('pending')
    }
  })
})

// ============================================
// weekQuerySchema
// ============================================

describe('weekQuerySchema', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(weekQuerySchema.safeParse('2025-03-10').success).toBe(true)
  })

  it('rejects invalid format', () => {
    expect(weekQuerySchema.safeParse('March 10, 2025').success).toBe(false)
    expect(weekQuerySchema.safeParse('2025/03/10').success).toBe(false)
  })
})
