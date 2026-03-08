import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, Users, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'

export default async function CoachSessionsPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const coachId = profile?.coach_id || ''

  let sessions: any[] | null = null
  try {
    // Try with session_ratings join first
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        date,
        start_time,
        end_time,
        session_type,
        notes,
        court:courts(name),
        session_players(
          player:players(id, name),
          session_rating:session_ratings(
            overall_rating,
            intensity_level
          )
        )
      `)
      .eq('coach_id', coachId)
      .order('date', { ascending: false })
      .limit(50)

    if (error) {
      // Fallback without session_ratings (table may not exist)
      const { data: fallback } = await supabase
        .from('sessions')
        .select(`
          id, date, start_time, end_time, session_type, notes,
          court:courts(name),
          session_players(player:players(id, name))
        `)
        .eq('coach_id', coachId)
        .order('date', { ascending: false })
        .limit(50)
      sessions = fallback as any[] | null
    } else {
      sessions = data as any[] | null
    }
  } catch {
    // PostgREST throws when table doesn't exist — fallback
    try {
      const { data } = await supabase
        .from('sessions')
        .select(`
          id, date, start_time, end_time, session_type, notes,
          court:courts(name),
          session_players(player:players(id, name))
        `)
        .eq('coach_id', coachId)
        .order('date', { ascending: false })
        .limit(50)
      sessions = data as any[] | null
    } catch {
      sessions = null
    }
  }

  // Group sessions by date
  const groupedSessions: { [key: string]: any[] } = {}
  sessions?.forEach((session: any) => {
    const date = session.date
    if (!groupedSessions[date]) {
      groupedSessions[date] = []
    }
    groupedSessions[date].push(session)
  })


  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const isPast = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr < today
  }

  const sortedDates = Object.keys(groupedSessions).sort().reverse()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">My Sessions</h1>
        <p className="text-stone-500 mt-1">View and rate training sessions</p>
      </div>

      {/* Sessions List */}
      {sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {/* Date Header */}
              <div className={`px-6 py-4 border-b border-stone-200 ${
                isToday(date) ? 'bg-red-50' : isPast(date) ? 'bg-stone-50' : 'bg-white'
              }`}>
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isToday(date) ? 'text-red-600' : 'text-stone-400'}`} />
                  <h2 className={`font-semibold ${isToday(date) ? 'text-red-600' : 'text-stone-800'}`}>
                    {isToday(date) ? 'Today - ' : ''}{formatDate(date)}
                  </h2>
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-stone-100">
                {groupedSessions[date].map((session: any) => {
                  const isCancelled = session.notes?.includes('[Cancelled]')
                  // Calculate average rating
                  const ratings = session.session_players
                    ?.filter((sp: any) => sp.session_rating?.length > 0)
                    .map((sp: any) => sp.session_rating[0]?.overall_rating)
                    .filter(Boolean)
                  const avgRating = ratings?.length > 0
                    ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
                    : null

                  const ratedCount = session.session_players?.filter(
                    (sp: any) => sp.session_rating?.length > 0
                  ).length || 0
                  const totalPlayers = session.session_players?.length || 0

                  return (
                    <Link
                      key={session.id}
                      href={`/dashboard/coach/sessions/${session.id}`}
                      className={`flex items-center gap-4 p-4 transition-colors ${isCancelled ? 'bg-red-50/50 opacity-60' : 'hover:bg-stone-50'}`}
                    >
                      {/* Time */}
                      <div className="w-24 text-center">
                        <p className={`font-medium ${isCancelled ? 'text-red-400 line-through' : 'text-stone-800'}`}>{formatTime(session.start_time)}</p>
                        <p className={`text-xs ${isCancelled ? 'text-red-300' : 'text-stone-400'}`}>{formatTime(session.end_time)}</p>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium capitalize ${isCancelled ? 'text-red-400 line-through' : 'text-stone-800'}`}>
                            {session.session_type?.replaceAll('_', ' ') || 'Training'}
                          </span>
                          {isCancelled && <span className="text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Cancelled</span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {session.court?.name || 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {totalPlayers} players
                          </span>
                        </div>
                      </div>

                      {/* Rating Info */}
                      {!isCancelled && (
                        <div className="text-right">
                          {avgRating ? (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-amber-400" />
                              <span className="font-medium">{avgRating}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400">Not rated</span>
                          )}
                          <p className="text-xs text-stone-400 mt-1">
                            {ratedCount}/{totalPlayers} rated
                          </p>
                        </div>
                      )}

                      <ChevronRight className="w-5 h-5 text-stone-400" />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No sessions found</h3>
          <p className="text-stone-500">Your sessions will appear here.</p>
        </div>
      )}
    </div>
  )
}
