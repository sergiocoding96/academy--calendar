import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'
import { parseBody, absenceSchema } from '@/lib/validations'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const profile = await getUserProfile()

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (profile.role !== 'player' || !profile.player_id) {
    return NextResponse.json({ error: 'Only players can mark themselves absent' }, { status: 403 })
  }

  const parsed = await parseBody(_request, absenceSchema)
  if (!parsed.success) return parsed.response
  const { reason } = parsed.data

  const supabase = await createClient()

  const { data, error } = await (supabase as any)
    .from('session_players')
    .update({
      status: 'absent',
      absent_reason: reason,
      absent_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('player_id', profile.player_id)
    .select('id')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Session not found or you are not in this session' },
        { status: 404 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Session not found or you are not in this session' },
      { status: 404 }
    )
  }

  const { data: session } = await (supabase as any)
    .from('sessions')
    .select('date, start_time, end_time, session_type, court:courts(name)')
    .eq('id', sessionId)
    .single()
  const { data: player } = await (supabase as any)
    .from('players')
    .select('name, full_name')
    .eq('id', profile.player_id)
    .single()
  const court = Array.isArray(session?.court) ? session.court[0] : session?.court
  supabase.functions
    .invoke('notify-slack', {
      body: {
        event: 'absence',
        session_id: sessionId,
        player_id: profile.player_id,
        player_name: player?.full_name || player?.name || profile.full_name || 'A player',
        session_date: session?.date,
        session_time: session?.start_time,
        session_type: session?.session_type,
        court_name: court?.name ?? undefined,
        reason,
      },
    })
    .catch(() => {})

  return NextResponse.json({ success: true })
}
