import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body: {
    day_of_week?: number
    start_time?: string
    end_time?: string
    court_id?: string | null
    coach_id?: string | null
    session_type?: string
    notes?: string | null
    player_ids?: string[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = await createClient()
  const updates: Record<string, unknown> = {}
  if (typeof body.day_of_week === 'number' && body.day_of_week >= 0 && body.day_of_week <= 6) updates.day_of_week = body.day_of_week
  if (typeof body.start_time === 'string') updates.start_time = body.start_time
  if (typeof body.end_time === 'string') updates.end_time = body.end_time
  if (body.court_id !== undefined) updates.court_id = body.court_id
  if (body.coach_id !== undefined) updates.coach_id = body.coach_id
  if (typeof body.session_type === 'string') updates.session_type = body.session_type
  if (body.notes !== undefined) updates.notes = body.notes

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('master_schedule').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (Array.isArray(body.player_ids)) {
    await supabase.from('master_schedule_players').delete().eq('master_schedule_id', id)
    if (body.player_ids.length > 0) {
      await supabase.from('master_schedule_players').insert(
        body.player_ids.map((player_id) => ({ master_schedule_id: id, player_id }))
      )
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('master_schedule').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
