import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, Trophy, Target, Clock, Dumbbell, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function PlayerStatsPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const playerId = profile?.player_id || ''

  // Get match results for win/loss stats
  const { data: matchResults } = await supabase
    .from('match_results')
    .select('*')
    .eq('player_id', playerId)
    .order('match_date', { ascending: false }) as { data: any[] | null }

  // Get session ratings for training load
  const { data: sessionRatings } = await supabase
    .from('session_ratings')
    .select(`
      *,
      session:sessions(date, start_time, end_time, session_type)
    `)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  // Get goals for completion rate
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('player_id', playerId) as { data: any[] | null }

  // Get fitness logs for load tracking
  const { data: fitnessLogs } = await supabase
    .from('fitness_logs')
    .select('*')
    .eq('player_id', playerId)
    .order('log_date', { ascending: false }) as { data: any[] | null }

  // Calculate stats
  const wins = matchResults?.filter(m => m.result === 'win').length || 0
  const losses = matchResults?.filter(m => m.result === 'loss').length || 0
  const totalMatches = wins + losses
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0'

  // Holds vs Breaks
  const totalHolds = matchResults?.reduce((acc, m) => acc + (m.holds || 0), 0) || 0
  const totalBreaks = matchResults?.reduce((acc, m) => acc + (m.breaks || 0), 0) || 0

  // Goal completion rate
  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
  const totalGoals = goals?.length || 0
  const goalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(0) : '0'

  // Calculate weekly training hours
  const getWeeklyTrainingHours = () => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekStart = oneWeekAgo.toISOString().split('T')[0]

    let totalMinutes = 0

    // From session ratings
    sessionRatings?.forEach(rating => {
      if (rating.session?.date >= weekStart) {
        totalMinutes += rating.duration_minutes || 0
      }
    })

    // From fitness logs
    fitnessLogs?.forEach(log => {
      if (log.log_date >= weekStart && log.duration_seconds) {
        totalMinutes += log.duration_seconds / 60
      }
    })

    return (totalMinutes / 60).toFixed(1)
  }

  // Calculate average intensity
  const getAverageIntensity = () => {
    const ratings = sessionRatings?.filter(r => r.intensity_level) || []
    const fitnessRatings = fitnessLogs?.filter(l => l.rpe) || []

    if (ratings.length === 0 && fitnessRatings.length === 0) return '0'

    const sum = ratings.reduce((acc, r) => acc + (r.intensity_level || 0), 0) +
                fitnessRatings.reduce((acc, l) => acc + (l.rpe || 0), 0)
    const count = ratings.length + fitnessRatings.length

    return (sum / count).toFixed(1)
  }

  // Recent match results
  const recentMatches = matchResults?.slice(0, 10) || []

  // Get last 30 days of training for chart data
  const getLast30DaysData = () => {
    const days = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayLogs = fitnessLogs?.filter(l => l.log_date === dateStr) || []
      const daySessions = sessionRatings?.filter(r => r.session?.date === dateStr) || []

      let totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)
      totalMinutes += dayLogs.reduce((acc, l) => acc + ((l.duration_seconds || 0) / 60), 0)

      const avgIntensity = (() => {
        const allRatings = [
          ...daySessions.map(s => s.intensity_level).filter(Boolean),
          ...dayLogs.map(l => l.rpe).filter(Boolean)
        ]
        if (allRatings.length === 0) return 0
        return allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      })()

      days.push({
        date: dateStr,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: Math.round(totalMinutes),
        intensity: avgIntensity
      })
    }
    return days
  }

  const chartData = getLast30DaysData()
  const maxMinutes = Math.max(...chartData.map(d => d.minutes), 1)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">My Stats</h1>
        <p className="text-stone-500 mt-1">Track your performance and progress</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Win/Loss Ratio */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-stone-400">Match Record</span>
          </div>
          <p className="text-3xl font-bold text-stone-800">{wins}W - {losses}L</p>
          <p className="text-sm text-stone-500 mt-1">{winRate}% win rate</p>
        </div>

        {/* Weekly Training Hours */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-stone-400">This Week</span>
          </div>
          <p className="text-3xl font-bold text-stone-800">{getWeeklyTrainingHours()}h</p>
          <p className="text-sm text-stone-500 mt-1">Training hours</p>
        </div>

        {/* Goal Completion */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-stone-400">Goals</span>
          </div>
          <p className="text-3xl font-bold text-stone-800">{goalCompletionRate}%</p>
          <p className="text-sm text-stone-500 mt-1">{completedGoals}/{totalGoals} completed</p>
        </div>

        {/* Average Intensity */}
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-stone-400">Avg Load</span>
          </div>
          <p className="text-3xl font-bold text-stone-800">{getAverageIntensity()}</p>
          <p className="text-sm text-stone-500 mt-1">RPE (1-10)</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Load Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Training Load (Last 30 Days)</h2>
          <div className="h-48 flex items-end justify-between gap-1">
            {chartData.map((day, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
                title={`${day.label}: ${day.minutes} min`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    day.intensity >= 8 ? 'bg-red-400' :
                    day.intensity >= 6 ? 'bg-orange-400' :
                    day.intensity >= 4 ? 'bg-yellow-400' :
                    day.minutes > 0 ? 'bg-green-400' : 'bg-stone-100'
                  }`}
                  style={{
                    height: `${Math.max((day.minutes / maxMinutes) * 100, day.minutes > 0 ? 5 : 0)}%`,
                    minHeight: day.minutes > 0 ? '4px' : '0'
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-stone-400">
            <span>{chartData[0]?.label}</span>
            <span>{chartData[chartData.length - 1]?.label}</span>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-400" />
              <span className="text-stone-500">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-400" />
              <span className="text-stone-500">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-400" />
              <span className="text-stone-500">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span className="text-stone-500">Very High</span>
            </div>
          </div>
        </div>

        {/* Holds vs Breaks */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Service Games</h2>
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{totalHolds}</p>
              <p className="text-sm text-stone-500 mt-1">Holds</p>
            </div>
            <div className="text-4xl font-light text-stone-300">vs</div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{totalBreaks}</p>
              <p className="text-sm text-stone-500 mt-1">Breaks</p>
            </div>
          </div>
          {(totalHolds + totalBreaks) > 0 && (
            <div className="mt-4">
              <div className="flex h-4 rounded-full overflow-hidden bg-stone-100">
                <div
                  className="bg-green-500"
                  style={{ width: `${(totalHolds / (totalHolds + totalBreaks)) * 100}%` }}
                />
                <div
                  className="bg-blue-500"
                  style={{ width: `${(totalBreaks / (totalHolds + totalBreaks)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-400">
                <span>{((totalHolds / (totalHolds + totalBreaks)) * 100).toFixed(0)}% holds</span>
                <span>{((totalBreaks / (totalHolds + totalBreaks)) * 100).toFixed(0)}% breaks</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Match Results */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Recent Match Results</h2>
            <Link href="/dashboard/player/tournaments" className="text-sm text-red-600 hover:text-red-700">
              View all
            </Link>
          </div>

          {recentMatches.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentMatches.map((match, index) => (
                <div
                  key={match.id || index}
                  className={`flex-shrink-0 w-24 p-3 rounded-lg text-center ${
                    match.result === 'win' ? 'bg-green-50 border border-green-200' :
                    match.result === 'loss' ? 'bg-red-50 border border-red-200' :
                    'bg-stone-50 border border-stone-200'
                  }`}
                >
                  <p className={`text-lg font-bold ${
                    match.result === 'win' ? 'text-green-600' :
                    match.result === 'loss' ? 'text-red-600' : 'text-stone-600'
                  }`}>
                    {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : '-'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 truncate">{match.score || '-'}</p>
                  <p className="text-xs text-stone-400 mt-1">{match.round}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No match results yet</p>
              <Link href="/dashboard/player/tournaments" className="text-sm text-red-600 hover:text-red-700 mt-2 inline-block">
                Log your first match
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
