import { getPlayersServer, getCoachesServer } from '@/features/player-database/lib/queries-server'
import { CoachPlayersClient } from './coach-players-client'

export default async function CoachPlayersPage() {
  let players: any[] = []
  let coaches: any[] = []

  try {
    ;[players, coaches] = await Promise.all([
      getPlayersServer(),
      getCoachesServer(),
    ])
  } catch {
    // Queries failed — show empty state
  }

  return (
    <CoachPlayersClient
      initialPlayers={players}
      initialCoaches={coaches}
    />
  )
}
