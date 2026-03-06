import { getUserProfile } from '@/lib/auth'
import { getPlayerWithDetailsServer } from '@/features/player-database/lib/queries-server'
import { PlayerInjuriesClient } from './injuries-client'

export default async function PlayerInjuriesPage() {
  const profile = await getUserProfile()
  const playerId = profile?.player_id

  if (!playerId) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500">No player profile linked to your account yet.</p>
      </div>
    )
  }

  try {
    const player = await getPlayerWithDetailsServer(playerId)
    return <PlayerInjuriesClient player={player} />
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500">Could not load injury data. Please try again later.</p>
      </div>
    )
  }
}
