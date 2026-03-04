import { getUserProfile } from '@/lib/auth'
import { getPlayerWithDetailsServer } from '@/features/player-database/lib/queries-server'
import { PlayerInjuriesClient } from './injuries-client'

export default async function PlayerInjuriesPage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id

  if (!playerId) {
    return null
  }

  const player = await getPlayerWithDetailsServer(playerId)

  return <PlayerInjuriesClient player={player} />
}
