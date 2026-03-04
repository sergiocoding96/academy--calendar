import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'

function getWeekBounds(weekStart: string) {
  const start = new Date(weekStart + 'T00:00:00Z')
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const week = searchParams.get('week')
  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return NextResponse.json({ error: 'week query param required (YYYY-MM-DD, Monday)' }, { status: 400 })
  }

  const { start, end } = getWeekBounds(week)
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('sessions')
    .select(`
      id,
      date,
      start_time,
      end_time,
      session_type,
      notes,
      court_id,
      coach_id,
      court:courts(id, name),
      coach:coaches(id, name),
      session_players(
        id,
        player_id,
        status,
        absent_reason,
        player:players(id, name)
      )
    `)
    .gte('date', start)
    .lte('date', end)
    .order('date')
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { week_start: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const weekStart = body.week_start
  if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return NextResponse.json({ error: 'week_start required (YYYY-MM-DD, Monday)' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: slots, error: slotsError } = await (supabase as any)
    .from('master_schedule')
    .select('id, day_of_week, start_time, end_time, court_id, coach_id, session_type, notes')
    .order('day_of_week')
    .order('start_time')

  if (slotsError) return NextResponse.json({ error: slotsError.message }, { status: 500 })
  if (!slots?.length) return NextResponse.json({ error: 'No master schedule slots' }, { status: 400 })

  const created: string[] = []
  for (const slot of slots as { id: string; day_of_week: number; start_time: string; end_time: string; court_id: string | null; coach_id: string | null; session_type: string; notes: string | null }[]) {
    const sessionDate = addDays(weekStart, slot.day_of_week)
    const { data: session, error: sessionError } = await (supabase as any)
      .from('sessions')
      .insert({
        date: sessionDate,
        start_time: slot.start_time,
        end_time: slot.end_time,
        court_id: slot.court_id,
        coach_id: slot.coach_id,
        session_type: slot.session_type,
        notes: slot.notes,
      })
      .select('id')
      .single()

    if (sessionError) continue
    if (!session) continue
    created.push(session.id)

    const { data: msp } = await (supabase as any)
      .from('master_schedule_players')
      .select('player_id')
      .eq('master_schedule_id', slot.id)
    if (msp?.length) {
      await (supabase as any).from('session_players').insert(
        msp.map((p: { player_id: string }) => ({ session_id: session.id, player_id: p.player_id, status: 'confirmed' }))
      )
    }
  }

  return NextResponse.json({ created: created.length, session_ids: created })
}
