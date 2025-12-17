import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'

export default async function PlayerSchedulePage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const playerId = profile?.player_id || ''

  // Get all sessions for this player
  const { data: sessions } = await supabase
    .from('session_players')
    .select(`
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
    .order('session(date)', { ascending: true }) as { data: any[] | null }

  // Group sessions by date
  const groupedSessions: { [key: string]: any[] } = {}
  sessions?.forEach((item: any) => {
    if (item.session) {
      const date = item.session.date
      if (!groupedSessions[date]) {
        groupedSessions[date] = []
      }
      groupedSessions[date].push(item.session)
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
                  {isPast(date) && (
                    <span className="text-xs text-stone-400 ml-auto">Past</span>
                  )}
                </div>
              </div>

              {/* Sessions */}
              <div className="divide-y divide-stone-100">
                {groupedSessions[date].map((session: any, index: number) => (
                  <Link
                    key={index}
                    href={`/dashboard/player/sessions/${session.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
                  >
                    {/* Time */}
                    <div className="w-24 text-center">
                      <p className="font-medium text-stone-800">{formatTime(session.start_time)}</p>
                      <p className="text-xs text-stone-400">{formatTime(session.end_time)}</p>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSessionTypeColor(session.session_type)}`}>
                          {session.session_type?.replace('_', ' ') || 'Training'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {session.court?.name || 'TBD'}
                        </span>
                        {session.coach && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {session.coach.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-right">
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
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No sessions scheduled</h3>
          <p className="text-stone-500">Your training schedule will appear here once sessions are booked.</p>
        </div>
      )}
    </div>
  )
}
