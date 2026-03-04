import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'

export async function GET() {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('master_schedule')
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      court_id,
      coach_id,
      session_type,
      notes,
      court:courts(id, name),
      coach:coaches(id, name)
    `)
    .order('day_of_week')
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const withPlayers = await Promise.all(
    (data || []).map(async (slot: { id: string }) => {
      const { data: players } = await (supabase as any)
        .from('master_schedule_players')
        .select('player_id, player:players(id, name)')
        .eq('master_schedule_id', slot.id)
      return { ...slot, players: players || [] }
    })
  )

  return NextResponse.json(withPlayers)
}

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    day_of_week: number
    start_time: string
    end_time: string
    court_id?: string
    coach_id?: string
    session_type?: string
    notes?: string
    player_ids?: string[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { day_of_week, start_time, end_time, court_id, coach_id, session_type, notes, player_ids } = body
  if (typeof day_of_week !== 'number' || day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json({ error: 'day_of_week must be 0-6' }, { status: 400 })
  }
  if (!start_time || !end_time) {
    return NextResponse.json({ error: 'start_time and end_time required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: slot, error: slotError } = await (supabase as any)
    .from('master_schedule')
    .insert({
      day_of_week,
      start_time,
      end_time,
      court_id: court_id || null,
      coach_id: coach_id || null,
      session_type: session_type || 'training',
      notes: notes || null,
    })
    .select('id')
    .single()

  if (slotError) return NextResponse.json({ error: slotError.message }, { status: 500 })
  if (!slot) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })

  if (Array.isArray(player_ids) && player_ids.length > 0) {
    await (supabase as any).from('master_schedule_players').insert(
      player_ids.map((player_id: string) => ({ master_schedule_id: slot.id, player_id }))
    )
  }

  return NextResponse.json({ id: slot.id })
}
