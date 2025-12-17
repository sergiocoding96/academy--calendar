import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Trophy, MapPin, Calendar, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PlayerTournamentsPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const playerId = profile?.player_id || ''

  // Get all tournaments assigned to this player
  const { data: tournaments } = await supabase
    .from('tournament_assignments')
    .select(`
      tournament:tournaments(
        id,
        name,
        start_date,
        end_date,
        location,
        surface,
        category
      )
    `)
    .eq('player_id', playerId)
    .order('tournament(start_date)', { ascending: false }) as { data: any[] | null }

  // Get match results for this player
  const { data: matchResults } = await supabase
    .from('match_results')
    .select('tournament_id, result')
    .eq('player_id', playerId) as { data: any[] | null }

  // Calculate tournament stats
  const getTournamentStats = (tournamentId: string) => {
    const matches = matchResults?.filter(m => m.tournament_id === tournamentId) || []
    const wins = matches.filter(m => m.result === 'win').length
    const losses = matches.filter(m => m.result === 'loss').length
    return { matches: matches.length, wins, losses }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isUpcoming = (startDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    return startDate > today
  }

  const isOngoing = (startDate: string, endDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    return startDate <= today && endDate >= today
  }

  const getStatusBadge = (startDate: string, endDate: string) => {
    if (isOngoing(startDate, endDate)) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Ongoing</span>
    }
    if (isUpcoming(startDate)) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Upcoming</span>
    }
    return <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">Completed</span>
  }

  const getSurfaceColor = (surface: string) => {
    switch (surface?.toLowerCase()) {
      case 'clay':
        return 'text-orange-600'
      case 'hard':
        return 'text-blue-600'
      case 'grass':
        return 'text-green-600'
      default:
        return 'text-stone-600'
    }
  }

  // Separate tournaments into upcoming and past
  const upcomingTournaments = tournaments?.filter((t: any) =>
    isUpcoming(t.tournament?.start_date) || isOngoing(t.tournament?.start_date, t.tournament?.end_date)
  ) || []
  const pastTournaments = tournaments?.filter((t: any) =>
    !isUpcoming(t.tournament?.start_date) && !isOngoing(t.tournament?.start_date, t.tournament?.end_date)
  ) || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Tournaments</h1>
          <p className="text-stone-500 mt-1">View and log your tournament matches</p>
        </div>
      </div>

      {/* Upcoming/Ongoing Tournaments */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Upcoming & Ongoing</h2>
        {upcomingTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTournaments.map((item: any, index: number) => {
              const stats = getTournamentStats(item.tournament?.id)
              return (
                <Link
                  key={index}
                  href={`/dashboard/player/tournaments/${item.tournament?.id}`}
                  className="bg-white rounded-xl border border-stone-200 p-6 hover:border-red-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{item.tournament?.name}</h3>
                        <p className={`text-sm font-medium ${getSurfaceColor(item.tournament?.surface)}`}>
                          {item.tournament?.surface || 'Surface TBD'} • {item.tournament?.category || 'Open'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.tournament?.start_date, item.tournament?.end_date)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.tournament?.start_date)} - {formatDate(item.tournament?.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <MapPin className="w-4 h-4" />
                      <span>{item.tournament?.location || 'Location TBD'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="text-sm">
                      <span className="text-stone-500">Matches: </span>
                      <span className="font-medium text-stone-800">{stats.matches}</span>
                      {stats.matches > 0 && (
                        <span className="text-stone-400 ml-2">
                          ({stats.wins}W - {stats.losses}L)
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p className="text-stone-500">No upcoming tournaments</p>
          </div>
        )}
      </div>

      {/* Past Tournaments */}
      <div>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Past Tournaments</h2>
        {pastTournaments.length > 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="divide-y divide-stone-100">
              {pastTournaments.map((item: any, index: number) => {
                const stats = getTournamentStats(item.tournament?.id)
                return (
                  <Link
                    key={index}
                    href={`/dashboard/player/tournaments/${item.tournament?.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-stone-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-stone-800">{item.tournament?.name}</h3>
                      <p className="text-sm text-stone-500">
                        {formatDate(item.tournament?.start_date)} • {item.tournament?.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-stone-800">{stats.wins}W - {stats.losses}L</p>
                      <p className="text-xs text-stone-400">{stats.matches} matches</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p className="text-stone-500">No past tournaments</p>
          </div>
        )}
      </div>
    </div>
  )
}
