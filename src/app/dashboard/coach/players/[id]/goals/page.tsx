import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Target, ChevronLeft, CheckCircle, Clock, Dumbbell, Zap, StretchHorizontal } from 'lucide-react'
import Link from 'next/link'

export default async function CoachPlayerGoalsPage({
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

  // Get all goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('player_id', id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  // Separate by status
  const activeGoals = goals?.filter(g => g.status === 'active') || []
  const completedGoals = goals?.filter(g => g.status === 'completed') || []

  // Stats
  const totalGoals = goals?.length || 0
  const completionRate = totalGoals > 0
    ? ((completedGoals.length / totalGoals) * 100).toFixed(0)
    : '0'

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="w-5 h-5" />
      case 'conditioning': return <Zap className="w-5 h-5" />
      case 'flexibility': return <StretchHorizontal className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getGoalColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-red-100 text-red-600'
      case 'conditioning': return 'bg-orange-100 text-orange-600'
      case 'flexibility': return 'bg-purple-100 text-purple-600'
      default: return 'bg-green-100 text-green-600'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!player) {
    return (
      <div className="p-8 text-center">
        <Target className="w-16 h-16 mx-auto mb-4 text-stone-300" />
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
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Target className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Goals</h1>
          <p className="text-stone-500">{player.name}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Active Goals</p>
          <p className="text-2xl font-bold text-stone-800">{activeGoals.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-stone-800">{completionRate}%</p>
        </div>
      </div>

      {/* Active Goals */}
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Active Goals</h2>
      {activeGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {activeGoals.map((goal: any) => {
            const progress = goal.target_value
              ? Math.min((goal.current_value / goal.target_value) * 100, 100)
              : 0

            return (
              <div key={goal.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getGoalColor(goal.goal_type)}`}>
                      {getGoalIcon(goal.goal_type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-800">{goal.title}</h3>
                      <p className="text-xs text-stone-400 capitalize">{goal.goal_type}</p>
                    </div>
                  </div>
                  {goal.target_date && (
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(goal.target_date)}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-stone-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-stone-600">
                  {goal.current_value} / {goal.target_value} {goal.target_unit}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center mb-8">
          <Target className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p className="text-stone-500">No active goals</p>
        </div>
      )}

      {/* Completed Goals */}
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Completed Goals</h2>
      {completedGoals.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {completedGoals.map((goal: any) => (
              <div key={goal.id} className="p-4 flex items-center gap-4">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-stone-800">{goal.title}</p>
                  <p className="text-sm text-stone-500 capitalize">{goal.goal_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-stone-800">
                    {goal.current_value} {goal.target_unit}
                  </p>
                  <p className="text-xs text-stone-400">achieved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p className="text-stone-500">No completed goals yet</p>
        </div>
      )}
    </div>
  )
}
