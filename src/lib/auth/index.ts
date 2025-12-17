import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserProfile, UserRole } from '@/types/database'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return profile
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
