import { getPlayersServer, getCoachesServer } from '@/features/player-database/lib/queries-server'
import { CoachPlayersClient } from './coach-players-client'

export default async function CoachPlayersPage() {
  const [players, coaches] = await Promise.all([
    getPlayersServer(),
    getCoachesServer(),
  ])

  return (
    <CoachPlayersClient
      initialPlayers={players}
      initialCoaches={coaches}
    />
  )
}
