import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Dumbbell, ChevronLeft, Zap, StretchHorizontal, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CoachPlayerFitnessPage({
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

  // Get fitness logs
  const { data: fitnessLogs } = await supabase
    .from('fitness_logs')
    .select('*')
    .eq('player_id', id)
    .order('log_date', { ascending: false })
    .limit(100) as { data: any[] | null }

  // Group by date
  const groupedLogs: { [key: string]: any[] } = {}
  fitnessLogs?.forEach((log: any) => {
    const date = log.log_date
    if (!groupedLogs[date]) {
      groupedLogs[date] = []
    }
    groupedLogs[date].push(log)
  })

  const sortedDates = Object.keys(groupedLogs).sort().reverse()

  // Calculate stats for last 7 days
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const recentLogs = fitnessLogs?.filter(log => log.log_date >= weekAgoStr) || []
  const strengthCount = recentLogs.filter(log => log.category === 'strength').length
  const conditioningCount = recentLogs.filter(log => log.category === 'conditioning').length
  const flexibilityCount = recentLogs.filter(log => log.category === 'flexibility').length
  const avgRpe = recentLogs.filter(log => log.rpe).length > 0
    ? (recentLogs.reduce((acc, log) => acc + (log.rpe || 0), 0) / recentLogs.filter(log => log.rpe).length).toFixed(1)
    : 'N/A'

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return <Dumbbell className="w-4 h-4" />
      case 'conditioning': return <Zap className="w-4 h-4" />
      case 'flexibility': return <StretchHorizontal className="w-4 h-4" />
      default: return <Dumbbell className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'bg-red-100 text-red-600'
      case 'conditioning': return 'bg-orange-100 text-orange-600'
      case 'flexibility': return 'bg-purple-100 text-purple-600'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  const getRpeColor = (rpe: number) => {
    if (rpe >= 8) return 'text-red-600'
    if (rpe >= 6) return 'text-orange-600'
    return 'text-green-600'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const formatExerciseDetails = (log: any) => {
    const parts = []
    if (log.sets && log.reps) {
      parts.push(`${log.sets}x${log.reps}`)
    }
    if (log.weight_kg) {
      parts.push(`${log.weight_kg}kg`)
    }
    if (log.duration_seconds) {
      const mins = Math.floor(log.duration_seconds / 60)
      const secs = log.duration_seconds % 60
      parts.push(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`)
    }
    if (log.distance_meters) {
      if (log.distance_meters >= 1000) {
        parts.push(`${(log.distance_meters / 1000).toFixed(1)}km`)
      } else {
        parts.push(`${log.distance_meters}m`)
      }
    }
    return parts.join(' • ')
  }

  if (!player) {
    return (
      <div className="p-8 text-center">
        <Dumbbell className="w-16 h-16 mx-auto mb-4 text-stone-300" />
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
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Fitness Activity</h1>
          <p className="text-stone-500">{player.name}</p>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-4 h-4 text-red-600" />
            <p className="text-sm text-stone-500">Strength</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{strengthCount}</p>
          <p className="text-xs text-stone-400">this week</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-orange-600" />
            <p className="text-sm text-stone-500">Conditioning</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{conditioningCount}</p>
          <p className="text-xs text-stone-400">this week</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <StretchHorizontal className="w-4 h-4 text-purple-600" />
            <p className="text-sm text-stone-500">Flexibility</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{flexibilityCount}</p>
          <p className="text-xs text-stone-400">this week</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-stone-500">Avg RPE</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{avgRpe}</p>
          <p className="text-xs text-stone-400">this week</p>
        </div>
      </div>

      {/* Activity Log */}
      {sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {/* Date Header */}
              <div className="px-6 py-4 border-b border-stone-200 bg-stone-50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-stone-400" />
                  <h2 className="font-semibold text-stone-800">{formatDate(date)}</h2>
                  <span className="text-sm text-stone-500">
                    ({groupedLogs[date].length} exercises)
                  </span>
                </div>
              </div>

              {/* Exercises */}
              <div className="divide-y divide-stone-100">
                {groupedLogs[date].map((log: any) => (
                  <div key={log.id} className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(log.category)}`}>
                      {getCategoryIcon(log.category)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">{log.exercise_name}</p>
                      <p className="text-sm text-stone-500">{formatExerciseDetails(log)}</p>
                    </div>
                    {log.rpe && (
                      <div className="text-right">
                        <span className={`font-bold ${getRpeColor(log.rpe)}`}>
                          RPE {log.rpe}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No fitness activity</h3>
          <p className="text-stone-500">Fitness logs will appear here once recorded.</p>
        </div>
      )}
    </div>
  )
}
