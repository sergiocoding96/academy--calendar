import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Calendar, ChevronLeft, Clock, MapPin, Star, Users } from 'lucide-react'
import Link from 'next/link'

export default async function CoachPlayerSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUserProfile()
  const supabase = await createClient()

  // Get player info
  const { data: player } = await supabase
    .from('players')
    .select('id, name')
    .eq('id', id)
    .single() as { data: { id: string; name: string } | null }

  // Get player's sessions with ratings
  const { data: sessionPlayers } = await supabase
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
    .eq('player_id', id)
    .order('session(date)', { ascending: false }) as { data: any[] | null }

  // Get session ratings for this player
  const { data: ratings } = await supabase
    .from('session_ratings')
    .select('session_id, overall_rating, intensity_level, duration_minutes')
    .eq('player_id', id) as { data: any[] | null }

  const ratingsMap = new Map(ratings?.map(r => [r.session_id, r]) || [])

  // Group sessions by date
  const groupedSessions: { [key: string]: any[] } = {}
  sessionPlayers?.forEach((sp: any) => {
    if (!sp.session) return
    const date = sp.session.date
    if (!groupedSessions[date]) {
      groupedSessions[date] = []
    }
    groupedSessions[date].push({
      ...sp.session,
      rating: ratingsMap.get(sp.session.id)
    })
  })

  const sortedDates = Object.keys(groupedSessions).sort().reverse()

  // Calculate stats
  const totalSessions = sessionPlayers?.length || 0
  const ratedSessions = ratings?.filter(r => r.overall_rating).length || 0
  const avgRating = ratings && ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + (r.overall_rating || 0), 0) / ratings.filter(r => r.overall_rating).length).toFixed(1)
    : 'N/A'
  const avgIntensity = ratings && ratings.filter(r => r.intensity_level).length > 0
    ? (ratings.reduce((acc, r) => acc + (r.intensity_level || 0), 0) / ratings.filter(r => r.intensity_level).length).toFixed(1)
    : 'N/A'

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

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

  if (!player) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Player not found</h2>
        <Link href="/dashboard/coach/players" className="text-red-600 hover:text-red-700">
          Back to players
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href={`/dashboard/coach/players/${id}`}
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {player.name}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Training Schedule</h1>
          <p className="text-stone-500">{player.name}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-stone-800">{totalSessions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Rated</p>
          <p className="text-2xl font-bold text-stone-800">{ratedSessions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Avg Rating</p>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <p className="text-2xl font-bold text-stone-800">{avgRating}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Avg Intensity</p>
          <p className="text-2xl font-bold text-stone-800">{avgIntensity}</p>
          <p className="text-xs text-stone-400">RPE</p>
        </div>
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
                {groupedSessions[date].map((session: any) => (
                  <div key={session.id} className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="w-24 text-center">
                        <p className="font-medium text-stone-800">{formatTime(session.start_time)}</p>
                        <p className="text-xs text-stone-400">{formatTime(session.end_time)}</p>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <p className="font-medium text-stone-800 capitalize">
                          {session.session_type?.replace('_', ' ') || 'Training'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-stone-500">
                          {session.court && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.court.name}
                            </span>
                          )}
                          {session.coach && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {session.coach.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="text-right">
                        {session.rating?.overall_rating ? (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span className="font-medium">{session.rating.overall_rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">Not rated</span>
                        )}
                        {session.rating?.intensity_level && (
                          <p className="text-xs text-stone-500">
                            RPE: {session.rating.intensity_level}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No sessions found</h3>
          <p className="text-stone-500">This player's sessions will appear here.</p>
        </div>
      )}
    </div>
  )
}
