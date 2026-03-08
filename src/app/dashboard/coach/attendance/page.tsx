import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AttendanceClient } from './attendance-client'
import { redirect } from 'next/navigation'

export default async function CoachAttendancePage() {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  let players: any[] = []
  try {
    const supabase = await createClient()

    if (profile.role === 'admin') {
      // Admins see all players
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('full_name')

      if (error) throw error
      players = data ?? []
    } else if (profile.coach_id) {
      // Coaches see only their assigned players
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('coach_id', profile.coach_id)
        .order('full_name')

      if (error) throw error
      players = data ?? []
    }
  } catch (err) {
    console.error('Failed to fetch players:', err)
    players = []
  }

  return <AttendanceClient initialPlayers={players} />
}
