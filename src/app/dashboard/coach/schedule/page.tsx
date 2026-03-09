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

  const weekEndDate = new Date(weekStart + 'T00:00:00')
  weekEndDate.setDate(weekEndDate.getDate() + 6)
  const weekEnd = weekEndDate.toISOString().slice(0, 10)

  interface ScheduleSession {
    id: string
    date: string
    start_time: string
    end_time: string
    session_type: string
    notes: string | null
    court: { id: string; name: string } | { id: string; name: string }[] | null
    coach: { id: string; name: string } | { id: string; name: string }[] | null
    session_players: { id: string; player_id: string; status: string; absent_reason: string | null; player: { id: string; name: string } | { id: string; name: string }[] | null }[]
  }

  interface IdName { id: string; name: string }

  let sessions: ScheduleSession[] = []
  let courts: IdName[] = []
  let coaches: IdName[] = []
  let players: IdName[] = []

  try {
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

    sessions = (sessionsResult.data as ScheduleSession[] | null) ?? []
    courts = (courtsResult.data as IdName[] | null) ?? []
    coaches = (coachesResult.data as IdName[] | null) ?? []
    players = (playersResult.data as IdName[] | null) ?? []
  } catch {
    // Queries failed — show empty schedule
  }

  const playersForSelect = players.map((p) => ({
    id: p.id,
    name: (p.name ?? 'Unknown').trim() || 'Unknown',
  }))

  return (
    <div className="p-8 h-full flex flex-col">
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
        initialSessions={sessions}
        courts={courts}
        coaches={coaches}
        players={playersForSelect}
      />
    </div>
  )
}
