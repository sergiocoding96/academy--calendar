import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'
import { parseBody, changeRequestCreateSchema, statusQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const profile = await getUserProfile()
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (profile.role !== 'coach' && profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const statusResult = statusQuerySchema.safeParse(searchParams.get('status') ?? undefined)
  const status = statusResult.success ? statusResult.data : 'pending'

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
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

  const parsed = await parseBody(request, changeRequestCreateSchema)
  if (!parsed.success) return parsed.response
  const body = parsed.data

  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('schedule_change_requests')
    .insert({
      proposer_id: profile.id,
      change_type: body.change_type,
      target_session_id: body.target_session_id || null,
      reason: body.reason,
      proposed_payload: body.proposed_payload || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data?.id })
}
