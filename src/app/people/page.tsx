import Link from 'next/link'
import { Navigation } from '@/components/ui/navigation'
import { Users, UserPlus } from 'lucide-react'
import { getPlayersServer, getCoachesServer } from '@/features/player-database/lib/queries-server'
import type { Player, Profile } from '@/features/player-database/types'

export default async function PeoplePage() {
  // Fetch a lightweight overview of players and coaches
  const [players, coaches] = await Promise.all([
    getPlayersServer({ isActive: true }),
    getCoachesServer(),
  ])

  const topPlayers = (players as (Player & { coach?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null })[])
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Players &amp; Coaches</h1>
            <p className="text-stone-500 mt-1">
              Overview of your academy roster with quick access to the player database.
            </p>
          </div>
          <Link
            href="/dashboard/coach/players"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Player
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Players Section */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players
              </h2>
              <span className="text-xs font-medium text-blue-100">
                {players.length} total
              </span>
            </div>
            <div className="p-6">
              {players.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-stone-500 font-medium">No players yet</p>
                  <p className="text-stone-400 text-sm mt-1">
                    Use the player database to add your first player.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topPlayers.map((player) => (
                    <Link
                      key={player.id}
                      href={`/dashboard/coach/players/${player.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {player.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800 truncate">
                          {player.full_name || 'Unnamed player'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          {player.category && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {player.category}
                            </span>
                          )}
                          {player.coach && (
                            <span className="truncate">
                              Coach: {player.coach.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  {players.length > topPlayers.length && (
                    <Link
                      href="/dashboard/coach/players"
                      className="block text-center text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                    >
                      View all players
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coaches Section */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Coaches
              </h2>
              <span className="text-xs font-medium text-emerald-100">
                {coaches.length} total
              </span>
            </div>
            <div className="p-6">
              {coaches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-stone-500 font-medium">No coaches found</p>
                  <p className="text-stone-400 text-sm mt-1">
                    Coaches appear here once their profiles are created in Supabase.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coaches.slice(0, 10).map((coach) => (
                    <div
                      key={coach.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                        {coach.full_name?.[0] || 'C'}
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">
                          {coach.full_name || 'Unnamed coach'}
                        </div>
                        <div className="text-xs text-stone-500">Coach</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
