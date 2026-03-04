import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (profile.role !== 'coach' && profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedule_change_requests')
    .select(`
      id,
      created_at,
      proposer_id,
      change_type,
      target_session_id,
      reason,
      status,
      proposed_payload,
      approved_payload,
      approved_by,
      approved_at,
      reject_reason,
      target_session:sessions(
        id,
        date,
        start_time,
        end_time,
        session_type,
        court:courts(name),
        coach:coaches(name)
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    change_type: string
    target_session_id?: string
    reason: string
    proposed_payload?: Record<string, unknown>
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const validTypes = ['move_time', 'change_court', 'cancel_session', 'add_session', 'remove_player', 'add_player']
  if (!validTypes.includes(body.change_type)) {
    return NextResponse.json({ error: 'Invalid change_type' }, { status: 400 })
  }
  if (!body.reason?.trim()) {
    return NextResponse.json({ error: 'reason required' }, { status: 400 })
  }
  if (body.change_type !== 'add_session' && !body.target_session_id) {
    return NextResponse.json({ error: 'target_session_id required for this change_type' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedule_change_requests')
    .insert({
      proposer_id: profile.id,
      change_type: body.change_type,
      target_session_id: body.target_session_id || null,
      reason: body.reason.trim(),
      proposed_payload: body.proposed_payload || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data?.id })
}
