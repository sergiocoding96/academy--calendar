import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, Target, Trophy, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'

export default async function CoachPlayersPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const coachId = profile?.coach_id || ''

  // Get all assigned players
  const { data: assignments } = await supabase
    .from('player_coach_assignments')
    .select(`
      player:players(
        id,
        name,
        email,
        phone
      )
    `)
    .eq('coach_id', coachId)
    .eq('is_primary', true) as { data: any[] | null }

  // Get stats for each player
  const playerStats: { [key: string]: any } = {}

  if (assignments) {
    for (const assignment of assignments) {
      if (!assignment.player) continue

      const playerId = assignment.player.id

      // Get match stats
      const { data: matches } = await supabase
        .from('match_results')
        .select('result')
        .eq('player_id', playerId) as { data: any[] | null }

      const wins = matches?.filter(m => m.result === 'win').length || 0
      const losses = matches?.filter(m => m.result === 'loss').length || 0

      // Get active goals
      const { count: activeGoals } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId)
        .eq('status', 'active')

      // Get recent sessions count (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: recentSessions } = await supabase
        .from('session_players')
        .select('*, session:sessions!inner(date)', { count: 'exact', head: true })
        .eq('player_id', playerId)
        .gte('session.date', weekAgo.toISOString().split('T')[0])

      playerStats[playerId] = {
        wins,
        losses,
        activeGoals: activeGoals || 0,
        recentSessions: recentSessions || 0
      }
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Players</h1>
          <p className="text-stone-500 mt-1">View and manage your assigned players</p>
        </div>
      </div>

      {/* Players Grid */}
      {assignments && assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment: any, index: number) => {
            if (!assignment.player) return null
            const stats = playerStats[assignment.player.id] || {}
            const initials = assignment.player.name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()

            return (
              <Link
                key={index}
                href={`/dashboard/coach/players/${assignment.player.id}`}
                className="bg-white rounded-xl border border-stone-200 p-6 hover:border-red-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{initials}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-800">{assignment.player.name}</h3>
                    <p className="text-sm text-stone-500">{assignment.player.email}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <p className="text-lg font-bold text-stone-800">
                      {stats.wins || 0}-{stats.losses || 0}
                    </p>
                    <p className="text-xs text-stone-500">W-L</p>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <p className="text-lg font-bold text-stone-800">{stats.activeGoals || 0}</p>
                    <p className="text-xs text-stone-500">Goals</p>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg">
                    <p className="text-lg font-bold text-stone-800">{stats.recentSessions || 0}</p>
                    <p className="text-xs text-stone-500">Sessions</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No players assigned</h3>
          <p className="text-stone-500">Players will appear here once they are assigned to you.</p>
        </div>
      )}
    </div>
  )
}
