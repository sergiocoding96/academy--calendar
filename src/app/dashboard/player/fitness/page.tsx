import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Dumbbell, Plus, Calendar, Flame, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function PlayerFitnessPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const playerId = profile?.player_id || ''

  // Get fitness logs for this player
  const { data: fitnessLogs } = await supabase
    .from('fitness_logs')
    .select('*')
    .eq('player_id', playerId)
    .order('log_date', { ascending: false })
    .limit(50) as { data: any[] | null }

  // Group logs by date
  const groupedLogs: { [key: string]: any[] } = {}
  fitnessLogs?.forEach((log: any) => {
    const date = log.log_date
    if (!groupedLogs[date]) {
      groupedLogs[date] = []
    }
    groupedLogs[date].push(log)
  })

  // Calculate weekly stats
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const weekLogs = fitnessLogs?.filter(log => log.log_date >= weekStartStr) || []
  const strengthLogs = weekLogs.filter(log => log.category === 'strength')
  const conditioningLogs = weekLogs.filter(log => log.category === 'conditioning')
  const flexibilityLogs = weekLogs.filter(log => log.category === 'flexibility')

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return 'bg-purple-100 text-purple-700'
      case 'conditioning':
        return 'bg-orange-100 text-orange-700'
      case 'flexibility':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-stone-100 text-stone-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Dumbbell className="w-5 h-5 text-purple-600" />
      case 'conditioning':
        return <Flame className="w-5 h-5 text-orange-600" />
      case 'flexibility':
        return <Activity className="w-5 h-5 text-green-600" />
      default:
        return <Dumbbell className="w-5 h-5 text-stone-600" />
    }
  }

  const formatExerciseDetails = (log: any) => {
    const parts = []
    if (log.sets && log.reps) {
      parts.push(`${log.sets}×${log.reps}`)
    }
    if (log.weight_kg) {
      parts.push(`${log.weight_kg}kg`)
    }
    if (log.duration_seconds) {
      const mins = Math.floor(log.duration_seconds / 60)
      const secs = log.duration_seconds % 60
      parts.push(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    if (log.distance_meters) {
      const km = log.distance_meters / 1000
      parts.push(`${km.toFixed(1)}km`)
    }
    return parts.join(' • ')
  }

  const sortedDates = Object.keys(groupedLogs).sort().reverse()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Fitness Log</h1>
          <p className="text-stone-500 mt-1">Track your strength, conditioning, and flexibility</p>
        </div>
        <Link
          href="/dashboard/player/fitness/log"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Workout
        </Link>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Strength This Week</p>
              <p className="text-2xl font-bold text-stone-800">{strengthLogs.length}</p>
              <p className="text-xs text-stone-400">workouts</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Conditioning This Week</p>
              <p className="text-2xl font-bold text-stone-800">{conditioningLogs.length}</p>
              <p className="text-xs text-stone-400">sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Flexibility This Week</p>
              <p className="text-2xl font-bold text-stone-800">{flexibilityLogs.length}</p>
              <p className="text-xs text-stone-400">sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workout History */}
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Workout History</h2>

      {sortedDates.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {/* Date Header */}
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <h3 className="font-medium text-stone-800">{formatDate(date)}</h3>
                  <span className="text-sm text-stone-400">({groupedLogs[date].length} exercises)</span>
                </div>
              </div>

              {/* Exercises */}
              <div className="divide-y divide-stone-100">
                {groupedLogs[date].map((log: any) => (
                  <div key={log.id} className="p-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        log.category === 'strength' ? 'bg-purple-100' :
                        log.category === 'conditioning' ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        {getCategoryIcon(log.category)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-stone-800">{log.exercise_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                          <span className="text-sm text-stone-500">
                            {formatExerciseDetails(log)}
                          </span>
                        </div>
                      </div>
                      {log.rpe && (
                        <div className="text-right">
                          <p className="text-xs text-stone-400">RPE</p>
                          <p className={`font-bold ${
                            log.rpe >= 8 ? 'text-red-600' :
                            log.rpe >= 6 ? 'text-orange-600' : 'text-green-600'
                          }`}>{log.rpe}/10</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No workouts logged yet</h3>
          <p className="text-stone-500 mb-4">Start tracking your fitness activities to monitor your progress.</p>
          <Link
            href="/dashboard/player/fitness/log"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Your First Workout
          </Link>
        </div>
      )}
    </div>
  )
}
