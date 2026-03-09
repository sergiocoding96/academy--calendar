import { z, ZodError } from 'zod'
import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export function zodErrorResponse(error: ZodError) {
  const issues = error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))
  return NextResponse.json(
    { error: 'Validation failed', issues },
    { status: 400 },
  )
}

export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
    }
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return { success: false, response: zodErrorResponse(result.error) }
  }
  return { success: true, data: result.data }
}

// ---------------------------------------------------------------------------
// Shared enums & primitives
// ---------------------------------------------------------------------------

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
const timeString = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Must be HH:MM or HH:MM:SS')
// ---------------------------------------------------------------------------
// Schedule change requests
// ---------------------------------------------------------------------------

export const changeRequestCreateSchema = z.object({
  change_type: z.enum([
    'move_time',
    'change_court',
    'cancel_session',
    'add_session',
    'remove_player',
    'add_player',
  ]),
  target_session_id: z.string().optional(),
  reason: z.string().min(1, 'Reason is required').transform((s) => s.trim()),
  proposed_payload: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (d) => d.change_type === 'add_session' || d.target_session_id,
  { message: 'target_session_id required for this change_type', path: ['target_session_id'] },
)

export const changeRequestActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'modify_approve']),
  modified_payload: z.record(z.string(), z.unknown()).optional(),
  reject_reason: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Master schedule
// ---------------------------------------------------------------------------

export const masterScheduleCreateSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: timeString,
  end_time: timeString,
  court_id: z.string().optional(),
  coach_id: z.string().optional(),
  session_type: z.string().optional(),
  notes: z.string().optional(),
  player_ids: z.array(z.string()).optional(),
})

export const masterScheduleUpdateSchema = z.object({
  day_of_week: z.number().int().min(0).max(6).optional(),
  start_time: timeString.optional(),
  end_time: timeString.optional(),
  court_id: z.string().nullable().optional(),
  coach_id: z.string().nullable().optional(),
  session_type: z.string().optional(),
  notes: z.string().nullable().optional(),
  player_ids: z.array(z.string()).optional(),
})

// ---------------------------------------------------------------------------
// Week generation
// ---------------------------------------------------------------------------

export const weekGenerateSchema = z.object({
  week_start: dateString,
})

// ---------------------------------------------------------------------------
// Absence
// ---------------------------------------------------------------------------

export const absenceSchema = z.object({
  reason: z.string().min(1, 'Reason is required').transform((s) => s.trim()),
})

// ---------------------------------------------------------------------------
// Agent chat
// ---------------------------------------------------------------------------

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  conversationId: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
  context: z.object({
    playerId: z.string().optional(),
    tournamentId: z.string().optional(),
    weekNumber: z.number().optional(),
  }).optional(),
})

// ---------------------------------------------------------------------------
// Query param validators
// ---------------------------------------------------------------------------

export const statusQuerySchema = z.enum([
  'pending', 'approved', 'rejected', 'modified_approved',
]).default('pending')

export const weekQuerySchema = dateString
