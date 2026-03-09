import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Trophy, Target, Dumbbell, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { PlayerDashboardWrapper } from '@/components/dashboard/player/player-dashboard-wrapper'
import { formatTime } from '@/lib/utils'

export default async function PlayerDashboardPage() {
  const profile = await getUserProfile()
  const supabase = await createClient()

  const playerId = profile?.player_id || ''
  const today = new Date().toISOString().split('T')[0]

  // Fetch in parallel; if tables don't exist or RLS blocks, use empty data so page still loads
  let upcomingSessions: any[] | null = null
  let activeGoalsCount: number | null = 0
  let upcomingTournaments: any[] | null = null

  if (playerId) {
    try {
      const [sessionsRes, goalsRes, tournamentsRes] = await Promise.all([
        // Supabase JS SDK does not support filtering on joined relations via .gte('relation.column').
        // Fetch all and filter in JS instead.
        supabase
          .from('session_players')
          .select(`
            status,
            session:sessions(
              id,
              date,
              start_time,
              end_time,
              session_type,
              notes,
              court:courts(name)
            )
          `)
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('player_id', playerId)
          .eq('status', 'active'),
        supabase
          .from('academy_tournaments')
          .select('id, name, start_date, end_date, location')
          .gte('start_date', today)
          .order('start_date', { ascending: true })
          .limit(3),
      ])

      // Filter upcoming sessions in JS (workaround for missing relation filter support)
      // Exclude cancelled sessions and normalize PostgREST array joins
      const allSessions = (sessionsRes.data as any[] | null) ?? []
      upcomingSessions = allSessions
        .map((item) => {
          const s = Array.isArray(item.session) ? item.session[0] : item.session
          return { ...item, session: s }
        })
        .filter((item) => item.session?.date >= today && !item.session?.notes?.includes('[Cancelled]') && item.status !== 'cancelled')
        .sort((a, b) => (a.session?.date ?? '').localeCompare(b.session?.date ?? ''))
        .slice(0, 5)
      activeGoalsCount = goalsRes.count ?? 0
      upcomingTournaments = (tournamentsRes.data as any[] | null) ?? null
    } catch {
      // Swallow errors so the dashboard still loads with empty state
      upcomingSessions = null
      activeGoalsCount = 0
      upcomingTournaments = null
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <PlayerDashboardWrapper>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Player'}!
          </h1>
          <p className="text-stone-500 mt-1">Here's your training overview</p>
        </div>

        {/* Player profile not linked — prompt to complete setup */}
        {profile?.role === 'player' && !profile?.player_id && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
            <p className="font-medium">Complete your profile</p>
            <p className="text-sm mt-1">
              Your account is not yet linked to a player record. Sessions, goals, and tournaments will appear here once an academy coach links your account. Contact your coach or check Settings if you believe this is an error.
            </p>
          </div>
        )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/dashboard/player/schedule"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-red-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-stone-800">{upcomingSessions?.length || 0}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/player/tournaments"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-red-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Tournaments</p>
              <p className="text-2xl font-bold text-stone-800">{upcomingTournaments?.length || 0}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/player/goals"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-red-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Active Goals</p>
              <p className="text-2xl font-bold text-stone-800">{activeGoalsCount || 0}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/player/stats"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-red-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">View Stats</p>
              <p className="text-lg font-semibold text-stone-800">KPIs</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Upcoming Sessions</h2>
            <Link href="/dashboard/player/schedule" className="text-sm text-red-600 hover:text-red-700">
              View all
            </Link>
          </div>

          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((item: any) => (
                <div
                  key={item.session?.id ?? `session-${crypto.randomUUID()}`}
                  className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800 capitalize">
                      {item.session?.session_type?.replaceAll('_', ' ') || 'Training'}
                    </p>
                    <p className="text-sm text-stone-500">
                      {formatDate(item.session?.date)} • {formatTime(item.session?.start_time)} - {formatTime(item.session?.end_time)}
                    </p>
                  </div>
                  <span className="text-xs text-stone-400">
                    {(Array.isArray(item.session?.court) ? item.session.court[0] : item.session?.court)?.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Upcoming Tournaments */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Upcoming Tournaments</h2>
            <Link href="/dashboard/player/tournaments" className="text-sm text-red-600 hover:text-red-700">
              View all
            </Link>
          </div>

          {upcomingTournaments && upcomingTournaments.length > 0 ? (
            <div className="space-y-3">
              {upcomingTournaments.map((tournament: any) => (
                <div
                  key={tournament.id}
                  className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">
                      {tournament.name}
                    </p>
                    <p className="text-sm text-stone-500">
                      {formatDate(tournament.start_date)} • {tournament.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No upcoming tournaments</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/player/goals/new"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Target className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-stone-700">New Goal</span>
            </Link>
            <Link
              href="/dashboard/player/fitness/log"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Dumbbell className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-stone-700">Log Workout</span>
            </Link>
            <Link
              href="/dashboard/player/tournaments"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Trophy className="w-8 h-8 text-amber-600" />
              <span className="text-sm font-medium text-stone-700">Log Match</span>
            </Link>
            <Link
              href="/dashboard/player/stats"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-stone-700">View Stats</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </PlayerDashboardWrapper>
  )
}
