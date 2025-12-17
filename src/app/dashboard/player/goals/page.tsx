import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Target, Plus, TrendingUp, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function PlayerGoalsPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const playerId = profile?.player_id || ''

  // Get all goals for this player
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      *,
      goal_progress(
        id,
        recorded_at,
        value
      )
    `)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case 'practice':
        return 'bg-blue-100 text-blue-700'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'paused':
        return 'bg-amber-100 text-amber-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-stone-100 text-stone-700'
    }
  }

  const calculateProgress = (goal: any) => {
    if (!goal.target_value || goal.target_value === 0) return 0
    const progress = (goal.current_value / goal.target_value) * 100
    return Math.min(progress, 100)
  }

  const activeGoals = goals?.filter(g => g.status === 'active') || []
  const completedGoals = goals?.filter(g => g.status === 'completed') || []
  const otherGoals = goals?.filter(g => g.status !== 'active' && g.status !== 'completed') || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Goals</h1>
          <p className="text-stone-500 mt-1">Track your practice and fitness goals</p>
        </div>
        <Link
          href="/dashboard/player/goals/new"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Link>
      </div>

      {/* Active Goals */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Active Goals</h2>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal: any) => {
              const progress = calculateProgress(goal)
              return (
                <Link
                  key={goal.id}
                  href={`/dashboard/player/goals/${goal.id}`}
                  className="bg-white rounded-xl border border-stone-200 p-6 hover:border-red-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{goal.title}</h3>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getGoalTypeColor(goal.goal_type)}`}>
                          {goal.goal_type}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-stone-500">Progress</span>
                      <span className="font-medium text-stone-800">
                        {goal.current_value || 0} / {goal.target_value} {goal.target_unit}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{progress.toFixed(0)}% complete</p>
                  </div>

                  {goal.target_date && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar className="w-4 h-4" />
                      <span>Target: {formatDate(goal.target_date)}</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p className="text-stone-500 mb-4">No active goals</p>
            <Link
              href="/dashboard/player/goals/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Link>
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Completed Goals</h2>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="divide-y divide-stone-100">
              {completedGoals.map((goal: any) => (
                <Link
                  key={goal.id}
                  href={`/dashboard/player/goals/${goal.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-800">{goal.title}</h3>
                    <p className="text-sm text-stone-500 capitalize">{goal.goal_type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('completed')}`}>
                      Completed
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Goals */}
      {otherGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Other Goals</h2>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="divide-y divide-stone-100">
              {otherGoals.map((goal: any) => (
                <Link
                  key={goal.id}
                  href={`/dashboard/player/goals/${goal.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-stone-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-800">{goal.title}</h3>
                    <p className="text-sm text-stone-500 capitalize">{goal.goal_type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
