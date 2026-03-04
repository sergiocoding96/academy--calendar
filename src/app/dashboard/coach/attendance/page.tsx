import { getPlayersServer } from '@/features/player-database/lib/queries-server'
import { AttendanceClient } from './attendance-client'

export default async function CoachAttendancePage() {
  const players = await getPlayersServer()

  return <AttendanceClient initialPlayers={players} />
}
