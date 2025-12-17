'use client'

import { Calendar, Users, Trophy, ClipboardList, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { MOCK_PLAYERS, MOCK_TODAY_SESSIONS, MOCK_COACH_STATS } from '@/lib/mock-data'
import { useAuth } from '@/components/auth/auth-provider'

export function GuestCoachDashboard() {
  const { profile, isGuest } = useAuth()

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="p-8">
      {/* Guest Banner */}
      {isGuest && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Demo Mode:</strong> You&apos;re viewing sample data. Sign up to manage your own academy!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Coach'}!
        </h1>
        <p className="text-stone-500 mt-1">Here&apos;s your coaching overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/dashboard/coach/players"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-red-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">My Players</p>
              <p className="text-2xl font-bold text-stone-800">{MOCK_COACH_STATS.playersCount}</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Today&apos;s Sessions</p>
              <p className="text-2xl font-bold text-stone-800">{MOCK_COACH_STATS.todaySessionsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">This Week</p>
              <p className="text-2xl font-bold text-stone-800">{MOCK_COACH_STATS.weekSessionsCount} sessions</p>
            </div>
          </div>
        </div>

        <Link
          href="/tournaments"
          className="bg-white p-6 rounded-xl border border-stone-200 hover:border-red-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Tournaments</p>
              <p className="text-lg font-semibold text-stone-800">View All</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Today&apos;s Sessions</h2>
            <Link href="/sessions" className="text-sm text-red-600 hover:text-red-700">
              View schedule
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_TODAY_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800 capitalize">
                    {session.session_type?.replace('_', ' ') || 'Training'}
                  </p>
                  <p className="text-sm text-stone-500">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)} • {session.court?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400">
                    {session.players?.length || 0} players
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Players */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">My Players</h2>
            <Link href="/dashboard/coach/players" className="text-sm text-red-600 hover:text-red-700">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_PLAYERS.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800">{player.name}</p>
                  <p className="text-sm text-stone-500">{player.level} • Age {player.age}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-stone-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/sessions"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-stone-700">View Schedule</span>
            </Link>
            <Link
              href="/dashboard/coach/players"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-stone-700">Player Profiles</span>
            </Link>
            <Link
              href="/tournaments"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Trophy className="w-8 h-8 text-amber-600" />
              <span className="text-sm font-medium text-stone-700">Tournaments</span>
            </Link>
            <Link
              href="/dashboard/coach/sessions"
              className="flex flex-col items-center gap-2 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ClipboardList className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-stone-700">Rate Sessions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
