import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'
import { parseBody, sessionCreateSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = await parseBody(request, sessionCreateSchema)
  if (!parsed.success) return parsed.response
  const { player_ids, ...sessionData } = parsed.data

  const supabase = await createClient()

  // Create the session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      date: sessionData.date,
      start_time: sessionData.start_time,
      end_time: sessionData.end_time,
      court_id: sessionData.court_id ?? null,
      coach_id: sessionData.coach_id ?? profile.coach_id ?? null,
      session_type: sessionData.session_type ?? 'training',
      notes: sessionData.notes ?? null,
    })
    .select('id')
    .single()

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 })
  }

  // Assign players if provided
  let assignedCount = 0
  if (player_ids?.length && session) {
    const { error: playersError } = await supabase
      .from('session_players')
      .insert(
        player_ids.map((pid) => ({
          session_id: session.id,
          player_id: pid,
          status: 'confirmed' as const,
        }))
      )
    if (playersError) {
      return NextResponse.json(
        { error: `Session created but failed to assign players: ${playersError.message}`, session_id: session.id },
        { status: 207 }
      )
    }
    assignedCount = player_ids.length
  }

  return NextResponse.json({ session_id: session.id, players_assigned: assignedCount }, { status: 201 })
}
