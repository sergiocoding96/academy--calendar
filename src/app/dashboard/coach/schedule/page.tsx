import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WeeklyScheduleClient } from './weekly-schedule-client'

function getMonday(d: Date) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().slice(0, 10)
}

export default async function CoachSchedulePage() {
  const profile = await getUserProfile()
  const supabase = await createClient()
  const weekStart = getMonday(new Date())

  // Compute the week-end date outside the query for clarity
  const weekEndDate = new Date(weekStart + 'T00:00:00')
  weekEndDate.setDate(weekEndDate.getDate() + 6)
  const weekEnd = weekEndDate.toISOString().slice(0, 10)

  // Fetch all independent data in parallel to avoid waterfall
  const [sessionsResult, courtsResult, coachesResult, playersResult] = await Promise.all([
    supabase
      .from('sessions')
      .select(`
        id,
        date,
        start_time,
        end_time,
        session_type,
        notes,
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
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date')
      .order('start_time'),
    supabase.from('courts').select('id, name').eq('status', 'active'),
    supabase.from('coaches').select('id, name').eq('status', 'active'),
    supabase.from('players').select('id, name').order('name'),
  ])

  const sessions = (sessionsResult.data as any[] | null)
  const courts = courtsResult.data
  const coaches = coachesResult.data
  const players = playersResult.data

  const playersForSelect = (players ?? []).map((p) => {
    const row = p as { id: string; name?: string | null }
    return { id: row.id, name: (row.name ?? 'Unknown').trim() || 'Unknown' }
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Weekly Schedule</h1>
          <p className="text-stone-500 mt-1">View and propose schedule changes</p>
        </div>
        <Link
          href="/dashboard/coach/approvals"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 font-medium"
        >
          Pending approvals
        </Link>
      </div>

      <WeeklyScheduleClient
        initialWeekStart={weekStart}
        initialSessions={sessions || []}
        courts={courts || []}
        coaches={coaches || []}
        players={playersForSelect}
      />
    </div>
  )
}
