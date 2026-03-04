import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PlayerTrainingClient } from './training-client'

export default async function PlayerTrainingPage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id

  if (!playerId) {
    return null
  }

  const supabase = await createClient()
  const { data: loads } = await supabase
    .from('training_loads')
    .select('*')
    .eq('player_id', playerId)
    .order('session_date', { ascending: false })

  return (
    <PlayerTrainingClient
      playerId={playerId}
      initialLoads={loads || []}
    />
  )
}
