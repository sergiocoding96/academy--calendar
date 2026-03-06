import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PlayerTrainingClient } from './training-client'

export default async function PlayerTrainingPage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id

  if (!playerId) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500">No player profile linked to your account yet.</p>
      </div>
    )
  }

  let loads: any[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('training_loads')
      .select('*')
      .eq('player_id', playerId)
      .order('session_date', { ascending: false })
    loads = data || []
  } catch {
    // Query failed — show empty state
  }

  return (
    <PlayerTrainingClient
      playerId={playerId}
      initialLoads={loads}
    />
  )
}
