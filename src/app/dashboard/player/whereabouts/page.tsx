import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PlayerWhereaboutsClient } from './whereabouts-client'

export default async function PlayerWhereaboutsPage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id

  if (!playerId) {
    return null
  }

  const supabase = await createClient()
  const { data: whereabouts } = await supabase
    .from('whereabouts')
    .select('*')
    .eq('player_id', playerId)
    .order('start_date', { ascending: true })

  return (
    <PlayerWhereaboutsClient
      playerId={playerId}
      initialWhereabouts={whereabouts || []}
    />
  )
}
