import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth'
import { parseBody, changeRequestActionSchema } from '@/lib/validations'

type ApplyResult = { ok: true } | { ok: false; error: string }

async function applyChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestId: string,
  changeType: string,
  targetSessionId: string | null,
  payload: {
    start_time?: string
    end_time?: string
    court_id?: string
    player_id?: string
    date?: string
    coach_id?: string
    session_type?: string
  } | null,
  approvedBy: string,
  approverCoachId: string | null
): Promise<ApplyResult> {
  if (!payload && changeType !== 'cancel_session') {
    return { ok: false, error: 'Missing payload for this change type' }
  }

  switch (changeType) {
    case 'move_time': {
      if (!targetSessionId || typeof payload?.start_time !== 'string' || typeof payload?.end_time !== 'string') {
        return { ok: false, error: 'Invalid move_time payload' }
      }
      const { error } = await (supabase as any)
        .from('sessions')
        .update({ start_time: payload.start_time, end_time: payload.end_time })
        .eq('id', targetSessionId)
      if (error) return { ok: false, error: error.message }
      break
    }
    case 'change_court': {
      if (!targetSessionId || payload?.court_id == null) {
        return { ok: false, error: 'Invalid change_court payload' }
      }
      const { error } = await (supabase as any)
        .from('sessions')
        .update({ court_id: payload.court_id as string })
        .eq('id', targetSessionId)
      if (error) return { ok: false, error: error.message }
      break
    }
    case 'cancel_session': {
      if (!targetSessionId) return { ok: false, error: 'Missing target session' }
      const { data: session } = await (supabase as any)
        .from('sessions')
        .select('notes')
        .eq('id', targetSessionId)
        .single()
      const notes = session?.notes ? `${session.notes} [Cancelled]` : '[Cancelled]'
      const { error: updateErr } = await (supabase as any)
        .from('sessions')
        .update({ notes })
        .eq('id', targetSessionId)
      if (updateErr) return { ok: false, error: updateErr.message }
      await (supabase as any)
        .from('session_players')
        .update({ status: 'cancelled' })
        .eq('session_id', targetSessionId)
      break
    }
    case 'remove_player': {
      if (!targetSessionId || typeof payload?.player_id !== 'string') {
        return { ok: false, error: 'Invalid remove_player payload' }
      }
      const { error } = await (supabase as any)
        .from('session_players')
        .delete()
        .eq('session_id', targetSessionId)
        .eq('player_id', payload.player_id)
      if (error) return { ok: false, error: error.message }
      break
    }
    case 'add_player': {
      if (!targetSessionId || typeof payload?.player_id !== 'string') {
        return { ok: false, error: 'Invalid add_player payload' }
      }
      const { error } = await (supabase as any).from('session_players').insert({
        session_id: targetSessionId,
        player_id: payload.player_id,
        status: 'confirmed',
      })
      if (error) return { ok: false, error: error.message }
      break
    }
    case 'add_session': {
      const date = payload?.date as string | undefined
      const start_time = payload?.start_time as string | undefined
      const end_time = payload?.end_time as string | undefined
      const court_id = payload?.court_id as string | undefined
      const coach_id_from_payload = payload?.coach_id as string | undefined
      const session_type = (payload?.session_type as string) || 'training'
      if (!date || !start_time || !end_time) {
        return { ok: false, error: 'add_session requires date, start_time and end_time in payload' }
      }

      // RLS on sessions likely requires a valid coach_id tied to the approver.
      const resolvedCoachId = coach_id_from_payload || approverCoachId || null
      if (!resolvedCoachId) {
        return {
          ok: false,
          error: 'Session insert failed: no coach_id provided and approver has no coach profile configured',
        }
      }

      const { data: inserted, error } = await (supabase as any)
        .from('sessions')
        .insert({
          date,
          start_time,
          end_time,
          court_id: court_id || null,
          coach_id: resolvedCoachId,
          session_type,
        })
        .select('id')
        .single()
      if (error) {
        return { ok: false, error: `Session insert failed: ${error.message}` }
      }
      if (!inserted?.id) {
        return { ok: false, error: 'Session insert did not return an id' }
      }
      break
    }
    default:
      return { ok: false, error: `Unknown change type: ${changeType}` }
  }

  const { error: auditError } = await (supabase as any).from('schedule_audit_log').insert({
    change_request_id: requestId,
    action: 'applied',
    performed_by: approvedBy,
    details: { change_type: changeType, payload },
  })
  if (auditError) {
    return { ok: false, error: `Audit log failed: ${auditError.message}` }
  }

  return { ok: true }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const parsed = await parseBody(request, changeRequestActionSchema)
  if (!parsed.success) return parsed.response
  const { action, modified_payload, reject_reason } = parsed.data

  const supabase = await createClient()
  const { data: req, error: fetchError } = await (supabase as any)
    .from('schedule_change_requests')
    .select('id, change_type, target_session_id, status, reason, proposed_payload, approved_payload, proposer_id')
    .eq('id', id)
    .single()

  if (fetchError || !req) {
    return NextResponse.json({ error: 'Change request not found' }, { status: 404 })
  }
  if (req.status !== 'pending') {
    return NextResponse.json({ error: 'Change request already processed' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const payloadToApply = action === 'modify_approve' ? modified_payload ?? req.proposed_payload : req.proposed_payload

  // Fetch session details and names for Slack notification
  let sessionInfo: { date?: string; start_time?: string; session_type?: string; court_name?: string; coach_name?: string } = {}
  let proposerName: string | undefined
  let playerName: string | undefined
  try {
    if (req.target_session_id) {
      const { data: sess } = await (supabase as any)
        .from('sessions')
        .select('date, start_time, session_type, court:courts(name), coach:coaches(name)')
        .eq('id', req.target_session_id)
        .single()
      if (sess) {
        const court = Array.isArray(sess.court) ? sess.court[0] : sess.court
        const coach = Array.isArray(sess.coach) ? sess.coach[0] : sess.coach
        sessionInfo = {
          date: sess.date,
          start_time: sess.start_time,
          session_type: sess.session_type,
          court_name: court?.name,
          coach_name: coach?.name,
        }
      }
    }
    if (req.proposer_id) {
      const { data: proposer } = await (supabase as any)
        .from('user_profiles')
        .select('full_name')
        .eq('id', req.proposer_id)
        .single()
      proposerName = proposer?.full_name
    }
    const playerIdInPayload = req.proposed_payload?.player_id as string | undefined
    if (playerIdInPayload) {
      const { data: pl } = await (supabase as any)
        .from('players')
        .select('full_name, name')
        .eq('id', playerIdInPayload)
        .single()
      playerName = pl?.full_name ?? pl?.name
    }
  } catch {
    // Non-critical — Slack will just have fewer details
  }

  if (action === 'reject') {
    await (supabase as any)
      .from('schedule_change_requests')
      .update({
        status: 'rejected',
        reject_reason: reject_reason?.trim() || null,
        approved_by: profile.id,
        approved_at: now,
        updated_at: now,
      })
      .eq('id', id)
    await (supabase as any).from('schedule_audit_log').insert({
      change_request_id: id,
      action: 'rejected',
      performed_by: profile.id,
      details: { reject_reason: reject_reason?.trim() || null },
    })
    supabase.functions
      .invoke('notify-slack', {
        body: {
          event: 'schedule_change_reviewed',
          request_id: id,
          status: 'rejected',
          change_type: req.change_type,
          reason: req.reason,
          reject_reason: reject_reason?.trim() || null,
          reviewer_name: profile.full_name ?? 'A coach',
          proposer_name: proposerName,
          player_name: playerName,
          session_date: sessionInfo.date,
          session_time: sessionInfo.start_time,
          session_type: sessionInfo.session_type,
          court_name: sessionInfo.court_name,
          coach_name: sessionInfo.coach_name,
        },
      })
      .catch(() => {})
    return NextResponse.json({ success: true, status: 'rejected' })
  }

  const applyResult = await applyChange(
    supabase,
    id,
    req.change_type,
    req.target_session_id,
    payloadToApply as Record<string, unknown> | null,
    profile.id,
    profile.coach_id ?? null
  )

  if (!applyResult.ok) {
    return NextResponse.json(
      { error: applyResult.error || 'Failed to apply change' },
      { status: 422 }
    )
  }

  await (supabase as any)
    .from('schedule_change_requests')
    .update({
      status: action === 'modify_approve' ? 'modified_approved' : 'approved',
      approved_payload: action === 'modify_approve' ? modified_payload : req.approved_payload,
      approved_by: profile.id,
      approved_at: now,
      updated_at: now,
    })
    .eq('id', id)

  supabase.functions
    .invoke('notify-slack', {
      body: {
        event: 'schedule_change_reviewed',
        request_id: id,
        status: action === 'modify_approve' ? 'modified_approved' : 'approved',
        change_type: req.change_type,
        reason: req.reason,
        reviewer_name: profile.full_name ?? 'A coach',
        proposer_name: proposerName,
        player_name: playerName,
        session_date: sessionInfo.date,
        session_time: sessionInfo.start_time,
        session_type: sessionInfo.session_type,
        court_name: sessionInfo.court_name,
        coach_name: sessionInfo.coach_name,
      },
    })
    .catch(() => {})

  return NextResponse.json({ success: true, status: action === 'modify_approve' ? 'modified_approved' : 'approved' })
}
