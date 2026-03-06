import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PlayerWhereaboutsClient } from './whereabouts-client'

export default async function PlayerWhereaboutsPage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id

  if (!playerId) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500">No player profile linked to your account yet.</p>
      </div>
    )
  }

  let whereabouts: any[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('whereabouts')
      .select('*')
      .eq('player_id', playerId)
      .order('start_date', { ascending: true })
    whereabouts = data || []
  } catch {
    // Query failed — show empty state
  }

  return (
    <PlayerWhereaboutsClient
      playerId={playerId}
      initialWhereabouts={whereabouts}
    />
  )
}
