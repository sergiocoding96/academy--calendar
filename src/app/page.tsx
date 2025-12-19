import Link from 'next/link'
import { Calendar, Trophy, Users, Settings, Heart, Brain, BarChart3, Shuffle } from 'lucide-react'
import { HomeAuthButtons } from '@/components/auth/home-auth-buttons'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-red-800 to-red-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-12 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
              <div>
                <h1
                  className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-red-400 to-orange-400"
                  style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.08em' }}
                >
                  SOTOTENNIS
                </h1>
                <p className="text-red-300/70 text-sm tracking-widest uppercase">Academy Management System</p>
              </div>
            </div>
            <HomeAuthButtons />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-stone-800 mb-8">Quick Access</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Session Calendar */}
          <Link
            href="/sessions"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Session Calendar</h3>
            <p className="text-stone-500 text-sm">Manage daily training sessions, courts, and player assignments</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* Tournament Calendar */}
          <Link
            href="/tournaments"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Tournaments</h3>
            <p className="text-stone-500 text-sm">View and manage tournament schedule, trips, and player entries</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* Players & Coaches */}
          <Link
            href="/people"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Players & Coaches</h3>
            <p className="text-stone-500 text-sm">Manage player roster, coach profiles, and availability</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* Performance Hub */}
          <Link
            href="/performance"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Performance Hub</h3>
            <p className="text-stone-500 text-sm">Season stats, load monitoring, and match analysis insights</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* UTR Matchups */}
          <Link
            href="/utr-matchups"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
              <Shuffle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">UTR Matchups</h3>
            <p className="text-stone-500 text-sm">Generate balanced practice matchups based on UTR ratings</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* Emotional Routine */}
          <Link
            href="/emotional-routine"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Emotional Routine</h3>
            <p className="text-stone-500 text-sm">Build personalized reset routines for emotional control on court</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* Master Emotions */}
          <Link
            href="/master-emotions"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Master Emotions</h3>
            <p className="text-stone-500 text-sm">Learn emotional frameworks and psychology for peak performance</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="group relative bg-white rounded-2xl border border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-stone-500 to-stone-600 flex items-center justify-center mb-4 shadow-lg shadow-stone-500/25 group-hover:scale-110 transition-transform">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Settings</h3>
            <p className="text-stone-500 text-sm">Configure courts, session types, and system preferences</p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-stone-400">→</span>
            </div>
          </Link>
        </div>

        {/* Today's Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Today&apos;s Overview</h2>
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-2">--</div>
                <div className="text-stone-500 text-sm">Sessions Today</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-2">--</div>
                <div className="text-stone-500 text-sm">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-red-600 mb-2">--</div>
                <div className="text-stone-500 text-sm">Upcoming Tournaments</div>
              </div>
            </div>
            <p className="text-center text-stone-400 text-sm mt-6">
              Connect to Supabase to see live data
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
