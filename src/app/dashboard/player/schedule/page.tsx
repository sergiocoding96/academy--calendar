import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { MarkAbsentButton } from '@/components/schedule/mark-absent-button'

export default async function PlayerSchedulePage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id || ''

  // Get all sessions for this player with session_players status (for absence)
  let rows: any[] | null = null
  try {
    const supabase = await createClient()
    if (playerId) {
      const { data } = await supabase
        .from('session_players')
        .select(`
          id,
          status,
          absent_reason,
          session:sessions(
            id,
            date,
            start_time,
            end_time,
            session_type,
            notes,
            court:courts(name),
            coach:coaches(name)
          )
        `)
        .eq('player_id', playerId)
        .order('session(date)', { ascending: true })
      rows = data
    }
  } catch {
    // Query failed — show empty state
  }

  // Normalize nested session, court, coach (PostgREST can return arrays)
  const normalizedRows = (rows as any[] | null)?.map((item: any) => {
    let session = item.session == null ? null : Array.isArray(item.session) ? item.session[0] : item.session
    if (session) {
      if (Array.isArray(session.court)) session = { ...session, court: session.court[0] ?? null }
      if (Array.isArray(session.coach)) session = { ...session, coach: session.coach[0] ?? null }
    }
    return { ...item, session }
  })

  // Group by date; each item has { session, status, absent_reason, isCancelled }
  const groupedSessions: { [key: string]: { session: any; status: string; absent_reason: string | null; isCancelled: boolean }[] } = {}
  normalizedRows?.forEach((item: any) => {
    if (item.session?.date) {
      const date = item.session.date
      if (!groupedSessions[date]) {
        groupedSessions[date] = []
      }
      groupedSessions[date].push({
        session: item.session,
        status: item.status ?? 'confirmed',
        absent_reason: item.absent_reason ?? null,
        isCancelled: !!item.session.notes?.includes('[Cancelled]'),
      })
    }
  })

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const isPast = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr < today
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'private':
        return 'bg-blue-100 text-blue-700'
      case 'group':
        return 'bg-green-100 text-green-700'
      case 'cardio':
        return 'bg-orange-100 text-orange-700'
      case 'strength':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-stone-100 text-stone-700'
    }
  }

  const sortedDates = Object.keys(groupedSessions).sort()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">My Schedule</h1>
        <p className="text-stone-500 mt-1">View your upcoming training sessions</p>
      </div>

      {/* Sessions by Date */}
      {!playerId ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No player linked to your account</h3>
          <p className="text-stone-500 mb-4 max-w-md mx-auto">
            Your schedule will appear here once your coach links your account to a player profile. If you&apos;re a coach
            viewing this page, go to <strong>Players</strong> → click a player → <strong>Schedule</strong> to see that
            player&apos;s sessions.
          </p>
          <Link
            href="/dashboard/coach/players"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 font-medium text-sm"
          >
            Go to Players
          </Link>
        </div>
      ) : sortedDates.length > 0 ? (
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
                  {isPast(date) && (
                    <span className="text-xs text-stone-400 ml-auto">Past</span>
                  )}
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-stone-100">
                {groupedSessions[date].map((item: { session: any; status: string; absent_reason: string | null; isCancelled: boolean }) => {
                  const session = item.session
                  const isAbsent = item.status === 'absent'
                  const isPastSession = isPast(session.date)
                  const isCancelled = item.isCancelled
                  const sessionLabel = `${formatTime(session.start_time)} ${session.session_type ?? 'Training'}`
                  return (
                    <div
                      key={session.id}
                      className={`flex items-center gap-4 p-4 transition-colors ${isCancelled ? 'bg-red-50/50 opacity-60' : 'hover:bg-stone-50'}`}
                    >
                      {/* Time */}
                      <div className="w-24 text-center">
                        <p className={`font-medium ${isCancelled ? 'text-red-400 line-through' : 'text-stone-800'}`}>{formatTime(session.start_time)}</p>
                        <p className={`text-xs ${isCancelled ? 'text-red-300' : 'text-stone-400'}`}>{formatTime(session.end_time)}</p>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${isCancelled ? 'bg-red-100 text-red-700' : getSessionTypeColor(session.session_type)}`}>
                            {isCancelled ? 'Cancelled' : (session.session_type?.replace('_', ' ') || 'Training')}
                          </span>
                          {!isCancelled && isAbsent && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Absent
                            </span>
                          )}
                          {!isCancelled && isAbsent && item.absent_reason && (
                            <span className="text-xs text-stone-500 truncate" title={item.absent_reason}>
                              — {item.absent_reason}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 shrink-0" />
                            {session.court?.name || 'TBD'}
                          </span>
                          {session.coach && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4 shrink-0" />
                              {session.coach.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Duration + Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-stone-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {(() => {
                              const [startH, startM] = session.start_time.split(':').map(Number)
                              const [endH, endM] = session.end_time.split(':').map(Number)
                              const minutes = (endH * 60 + endM) - (startH * 60 + startM)
                              return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
                            })()}
                          </span>
                        </div>
                        {!isCancelled && !isAbsent && !isPastSession && (
                          <MarkAbsentButton sessionId={session.id} sessionLabel={sessionLabel} />
                        )}
                        {!isCancelled && (
                          <Link
                            href={`/dashboard/player/sessions/${session.id}`}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No sessions scheduled</h3>
          <p className="text-stone-500">
            Your training schedule will appear here once your coach assigns you to sessions. Coaches: assign players
            from <strong>Schedule</strong> → + Player on a session, then approve the request.
          </p>
        </div>
      )}
    </div>
  )
}
