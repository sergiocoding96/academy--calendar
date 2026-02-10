import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ApprovalQueueClient } from './approval-queue-client'

export default async function CoachApprovalsPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const { data: pending } = await supabase
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
    .order('created_at', { ascending: false }) as { data: any[] | null }

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

      <ApprovalQueueClient initialPending={pending || []} />
    </div>
  )
}
