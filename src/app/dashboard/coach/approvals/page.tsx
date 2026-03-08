import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ApprovalQueueClient } from './approval-queue-client'

export default async function CoachApprovalsPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  let pending: any[] = []
  try {
    const { data } = await supabase
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
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Normalize PostgREST join shapes — target_session, court, coach may be
    // arrays instead of objects depending on FK cardinality.
    pending = ((data as any[] | null) || []).map((row: any) => {
      let session = row.target_session
      if (Array.isArray(session)) session = session[0] ?? null
      if (session) {
        if (Array.isArray(session.court)) session = { ...session, court: session.court[0] ?? null }
        if (Array.isArray(session.coach)) session = { ...session, coach: session.coach[0] ?? null }
      }
      return { ...row, target_session: session }
    })
  } catch {
    pending = []
  }

  // Also fetch proposer names for display
  const proposerIds = [...new Set(pending.map((r: any) => r.proposer_id).filter(Boolean))]
  const proposerMap: Record<string, string> = {}
  if (proposerIds.length > 0) {
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', proposerIds)
      for (const p of (profiles as any[] | null) || []) {
        if (p.full_name) proposerMap[p.id] = p.full_name
      }
    } catch {
      // non-critical
    }
  }
  // Attach proposer_name to each item
  pending = pending.map((r: any) => ({ ...r, proposer_name: proposerMap[r.proposer_id] || null }))

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Pending approvals</h1>
          <p className="text-stone-500 mt-1">Approve, reject, or modify schedule change requests</p>
        </div>
        <Link
          href="/dashboard/coach/schedule"
          className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 font-medium text-stone-700"
        >
          Back to schedule
        </Link>
      </div>

      <ApprovalQueueClient initialPending={pending} />
    </div>
  )
}
