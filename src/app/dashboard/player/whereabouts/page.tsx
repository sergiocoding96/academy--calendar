import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { Whereabouts } from '@/features/player-database/types'
import { PlayerWhereaboutsClient } from './whereabouts-client'

/** Ensure data is JSON-serializable when passing from Server to Client (avoids render errors). */
function serializableWhereabouts(value: unknown): unknown[] {
  if (!Array.isArray(value)) return []
  try {
    return JSON.parse(JSON.stringify(value)) as unknown[]
  } catch {
    return []
  }
}

export default async function PlayerWhereaboutsPage() {
  try {
    const profile = await getUserProfile()
    const playerId = profile?.player_id

    if (!playerId) {
      return (
        <div className="p-8 text-center">
          <p className="text-stone-500">No player profile linked to your account yet.</p>
        </div>
      )
    }

    let whereabouts: unknown[] = []
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('whereabouts')
        .select('*')
        .eq('player_id', playerId)
        .order('start_date', { ascending: true })

      if (!error && Array.isArray(data)) {
        whereabouts = serializableWhereabouts(data)
      }
    } catch {
      whereabouts = []
    }

    return (
      <PlayerWhereaboutsClient
        playerId={playerId}
        initialWhereabouts={whereabouts as Whereabouts[]}
      />
    )
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500 mb-4">Unable to load whereabouts. Please try again.</p>
        <a href="/dashboard/player/whereabouts" className="text-red-600 hover:underline">
          Refresh page
        </a>
      </div>
    )
  }
}
