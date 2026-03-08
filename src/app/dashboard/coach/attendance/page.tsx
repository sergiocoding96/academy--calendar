import { getPlayersServer } from '@/features/player-database/lib/queries-server'
import { AttendanceClient } from './attendance-client'

export default async function CoachAttendancePage() {
  let players: any[] = []
  try {
    players = await getPlayersServer()
  } catch {
    players = []
  }

  return <AttendanceClient initialPlayers={players} />
}
