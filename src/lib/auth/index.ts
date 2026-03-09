import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserProfile, UserRole } from '@/types/database'

// cache() deduplicates calls within a single server request, so layout + page
// don't each make their own roundtrips.
// Uses getSession() instead of getUser() to avoid consuming the single-use
// refresh token on the server. getUser() makes a network call that races with
// the client-side token refresh — causing auth state to break on navigation.
// getSession() reads from cookies without a network call. The middleware
// already handles the auth gate, so JWT re-validation isn't needed here.
export const getUser = cache(async () => {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return null
    }

    return session.user
  } catch {
    return null
  }
})

export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  try {
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
  } catch {
    return null
  }
})

/**
 * Check if the current user (profile) is allowed to access or mutate data for the given player.
 * - Player: only their own player_id
 * - Coach: only players assigned via player_coach_assignments where coach_id matches
 * - Admin: all players
 */
export async function canAccessPlayer(
  profile: UserProfile,
  playerId: string
): Promise<boolean> {
  if (profile.role === 'admin') return true
  if (profile.role === 'player') return profile.player_id === playerId
  if (profile.role === 'coach' && profile.coach_id) {
    const supabase = await createClient()
    const { data: assignment } = await supabase
      .from('player_coach_assignments')
      .select('id')
      .eq('player_id', playerId)
      .eq('coach_id', profile.coach_id)
      .maybeSingle()
    return !!assignment
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
