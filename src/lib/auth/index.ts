import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserProfile, UserRole } from '@/types/database'

// cache() deduplicates calls within a single server request, so layout + page
// don't each make their own getUser() / profile roundtrips.
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
})

export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return null
  }

  return profile as UserProfile
})

/**
 * Check if the current user (profile) is allowed to access or mutate data for the given player.
 * - Player: only their own player_id
 * - Coach: only players where players.coach_id = profile.coach_id (coaches.id = profiles.id in schema)
 * - Admin: all players
 */
export async function canAccessPlayer(
  profile: UserProfile,
  playerId: string
): Promise<boolean> {
  if (profile.role === 'admin') return true
  if (profile.role === 'player') return profile.player_id === playerId
  if (profile.role === 'coach' && (profile as UserProfile).coach_id) {
    const supabase = await createClient()
    const { data: player } = await (supabase as any)
      .from('players')
      .select('coach_id')
      .eq('id', playerId)
      .maybeSingle()
    return player?.coach_id === (profile as UserProfile).coach_id
  }
  return false
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }

  return profile
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
