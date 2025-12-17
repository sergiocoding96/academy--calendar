'use client'

import { Calendar, Trophy, Target, Dumbbell, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { MOCK_SESSIONS, MOCK_TOURNAMENTS, MOCK_GOALS, MOCK_STATS } from '@/lib/mock-data'
import { useAuth } from '@/components/auth/auth-provider'

export function GuestPlayerDashboard() {
  const { profile, isGuest } = useAuth()

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const upcomingSessions = MOCK_SESSIONS.slice(0, 5)
  const upcomingTournaments = MOCK_TOURNAMENTS.slice(0, 3)
  const activeGoalsCount = MOCK_GOALS.filter(g => g.status === 'active').length

  return (
    <div className="p-8">
      {/* Guest Banner */}
      {isGuest && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Demo Mode:</strong> You&apos;re viewing sample data. Sign up to track your own progress!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Player'}!
        </h1>
        <p className="text-stone-500 mt-1">Here&apos;s your training overview</p>
      </div>

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
              <p className="text-2xl font-bold text-stone-800">{upcomingSessions.length}</p>
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
              <p className="text-2xl font-bold text-stone-800">{upcomingTournaments.length}</p>
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
              <p className="text-2xl font-bold text-stone-800">{activeGoalsCount}</p>
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

          <div className="space-y-3">
            {upcomingSessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800 capitalize">
                    {session.session_type?.replace('_', ' ') || 'Training'}
                  </p>
                  <p className="text-sm text-stone-500">
                    {formatDate(session.date)} • {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </p>
                </div>
                <span className="text-xs text-stone-400">
                  {session.court?.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tournaments */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Upcoming Tournaments</h2>
            <Link href="/dashboard/player/tournaments" className="text-sm text-red-600 hover:text-red-700">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingTournaments.map((tournament, index) => (
              <div
                key={index}
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
  )
}
