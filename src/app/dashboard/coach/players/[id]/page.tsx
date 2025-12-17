import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { User, Trophy, Target, Calendar, Dumbbell, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function CoachPlayerDetailPage({
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
    .select('*')
    .eq('id', id)
    .single() as { data: any | null }

  if (!player) {
    return (
      <div className="p-8 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Player not found</h2>
        <Link href="/dashboard/coach/players" className="text-red-600 hover:text-red-700">
          Back to players
        </Link>
      </div>
    )
  }

  // Get match results
  const { data: matches } = await supabase
    .from('match_results')
    .select('*')
    .eq('player_id', id)
    .order('match_date', { ascending: false })
    .limit(10) as { data: any[] | null }

  // Get goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('player_id', id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  // Get recent sessions with ratings
  const { data: sessionRatings } = await supabase
    .from('session_ratings')
    .select(`
      *,
      session:sessions(date, session_type, start_time, end_time)
    `)
    .eq('player_id', id)
    .order('created_at', { ascending: false })
    .limit(10) as { data: any[] | null }

  // Get fitness logs
  const { data: fitnessLogs } = await supabase
    .from('fitness_logs')
    .select('*')
    .eq('player_id', id)
    .order('log_date', { ascending: false })
    .limit(20) as { data: any[] | null }

  // Calculate stats
  const wins = matches?.filter(m => m.result === 'win').length || 0
  const losses = matches?.filter(m => m.result === 'loss').length || 0
  const totalMatches = wins + losses
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0'

  const activeGoals = goals?.filter(g => g.status === 'active').length || 0
  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0

  const avgIntensity = sessionRatings && sessionRatings.length > 0
    ? (sessionRatings.reduce((acc, r) => acc + (r.intensity_level || 0), 0) / sessionRatings.length).toFixed(1)
    : '0'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const initials = player.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard/coach/players"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to players
      </Link>

      {/* Player Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{initials}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-800">{player.name}</h1>
            <p className="text-stone-500">{player.email}</p>
            {player.phone && <p className="text-stone-400 text-sm">{player.phone}</p>}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-stone-500">Record</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{wins}W - {losses}L</p>
          <p className="text-xs text-stone-400">{winRate}% win rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm text-stone-500">Goals</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{activeGoals}</p>
          <p className="text-xs text-stone-400">{completedGoals} completed</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-stone-500">Sessions</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{sessionRatings?.length || 0}</p>
          <p className="text-xs text-stone-400">rated</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-stone-500">Avg Load</span>
          </div>
          <p className="text-xl font-bold text-stone-800">{avgIntensity}</p>
          <p className="text-xs text-stone-400">RPE</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Recent Matches</h2>
            <Link
              href={`/dashboard/coach/players/${id}/matches`}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {matches && matches.length > 0 ? (
            <div className="space-y-2">
              {matches.slice(0, 5).map((match: any) => (
                <div
                  key={match.id}
                  className={`p-3 rounded-lg ${
                    match.result === 'win' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800">vs {match.opponent_name}</p>
                      <p className="text-xs text-stone-500">{formatDate(match.match_date)} • {match.round}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${match.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                        {match.result === 'win' ? 'W' : 'L'}
                      </p>
                      <p className="text-xs text-stone-500">{match.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">No match results yet</p>
          )}
        </div>

        {/* Active Goals */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Active Goals</h2>
            <Link
              href={`/dashboard/coach/players/${id}/goals`}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {goals && goals.filter(g => g.status === 'active').length > 0 ? (
            <div className="space-y-3">
              {goals.filter(g => g.status === 'active').slice(0, 4).map((goal: any) => {
                const progress = goal.target_value
                  ? Math.min((goal.current_value / goal.target_value) * 100, 100)
                  : 0
                return (
                  <div key={goal.id} className="p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-stone-800 text-sm">{goal.title}</p>
                      <span className="text-xs text-stone-400 capitalize">{goal.goal_type}</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {goal.current_value}/{goal.target_value} {goal.target_unit}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">No active goals</p>
          )}
        </div>

        {/* Recent Session Ratings */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Session Ratings</h2>
            <Link
              href={`/dashboard/coach/players/${id}/schedule`}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {sessionRatings && sessionRatings.length > 0 ? (
            <div className="space-y-2">
              {sessionRatings.slice(0, 5).map((rating: any) => (
                <div key={rating.id} className="p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800 text-sm capitalize">
                        {rating.session?.session_type?.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-stone-500">{formatDate(rating.session?.date)}</p>
                    </div>
                    <div className="text-right">
                      {rating.overall_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span className="font-medium">{rating.overall_rating}/5</span>
                        </div>
                      )}
                      {rating.intensity_level && (
                        <p className="text-xs text-stone-500">RPE: {rating.intensity_level}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">No session ratings yet</p>
          )}
        </div>

        {/* Recent Fitness Logs */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Fitness Activity</h2>
            <Link
              href={`/dashboard/coach/players/${id}/fitness`}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {fitnessLogs && fitnessLogs.length > 0 ? (
            <div className="space-y-2">
              {fitnessLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800 text-sm">{log.exercise_name}</p>
                      <p className="text-xs text-stone-500 capitalize">{log.category} • {formatDate(log.log_date)}</p>
                    </div>
                    {log.rpe && (
                      <span className={`text-sm font-medium ${
                        log.rpe >= 8 ? 'text-red-600' :
                        log.rpe >= 6 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        RPE {log.rpe}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">No fitness logs yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
