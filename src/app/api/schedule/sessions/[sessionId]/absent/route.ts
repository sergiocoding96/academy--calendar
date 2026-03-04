import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'

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

  let body: { reason?: string }
  try {
    body = await _request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (!reason) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

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
    .select('date, start_time, end_time, session_type')
    .eq('id', sessionId)
    .single()
  const { data: player } = await (supabase as any)
    .from('players')
    .select('name')
    .eq('id', profile.player_id)
    .single()
  supabase.functions
    .invoke('notify-slack', {
      body: {
        event: 'absence',
        session_id: sessionId,
        player_id: profile.player_id,
        player_name: player?.name ?? 'Player',
        session_date: session?.date,
        session_time: session?.start_time,
        session_type: session?.session_type,
        reason,
      },
    })
    .catch(() => {})

  return NextResponse.json({ success: true })
}
