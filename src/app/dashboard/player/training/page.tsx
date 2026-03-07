import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { TrainingLoad } from '@/features/player-database/types'
import { PlayerTrainingClient } from './training-client'

export const dynamic = 'force-dynamic'

/** Ensure data is JSON-serializable when passing from Server to Client (avoids render errors). */
function serializableLoads(value: unknown): unknown[] {
  if (!Array.isArray(value)) return []
  try {
    return JSON.parse(JSON.stringify(value)) as unknown[]
  } catch {
    return []
  }
}

export default async function PlayerTrainingPage() {
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

    let loads: unknown[] = []
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('training_loads')
        .select('*')
        .eq('player_id', playerId)
        .order('session_date', { ascending: false })

      if (!error && Array.isArray(data)) {
        loads = serializableLoads(data)
      }
    } catch {
      loads = []
    }

    return (
      <PlayerTrainingClient
        playerId={playerId}
        initialLoads={loads as TrainingLoad[]}
      />
    )
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500 mb-4">Unable to load training. Please try again.</p>
        <a href="/dashboard/player/training" className="text-red-600 hover:underline">
          Refresh page
        </a>
      </div>
    )
  }
}
