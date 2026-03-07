'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserProfile } from '@/types/database'

// Mock guest profile for demo/preview purposes (player role — read-only access)
const GUEST_PROFILE: UserProfile = {
  id: 'guest-user-id',
  email: 'guest@sototennis.demo',
  full_name: 'Demo User',
  role: 'player',
  player_id: null,
  coach_id: null,
  created_at: new Date().toISOString(),
  avatar_url: null,
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isGuest: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  signInAsGuest: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const isGuestRef = useRef(false)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      } else {
        setProfile(null)
      }
    } catch {
      setProfile(null)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user && !isGuest) {
      await fetchProfile(user.id)
    }
  }, [user, isGuest, fetchProfile])

  const signInAsGuest = useCallback(() => {
    isGuestRef.current = true
    setIsGuest(true)
    setProfile(GUEST_PROFILE)
    setUser({ id: 'guest-user-id', email: 'guest@sototennis.demo' } as User)
    setLoading(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('isGuest', 'true')
      document.cookie = 'isGuest=true; path=/; max-age=86400'
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isGuestRef.current) {
      isGuestRef.current = false
      setIsGuest(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isGuest')
        document.cookie = 'isGuest=; path=/; max-age=0'
      }
    } else {
      await supabase.auth.signOut({ scope: 'local' })
    }
    setUser(null)
    setProfile(null)
    setLoading(false)
  }, [supabase])

  // Sync auth state when this tab becomes visible again.
  // Prevents stale state after another tab signed out or refreshed tokens.
  useEffect(() => {
    if (isGuestRef.current) return

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      if (isGuestRef.current) return

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          setUser(currentUser)
          await fetchProfile(currentUser.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch {
        // Network error — keep current state
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [supabase, fetchProfile])

  useEffect(() => {
    // Check for guest session first
    if (typeof window !== 'undefined') {
      const wasGuest = localStorage.getItem('isGuest') === 'true'
      if (wasGuest) {
        signInAsGuest()
        return
      }
    }

    // onAuthStateChange handles all auth state transitions including initial session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isGuestRef.current) return

        // In background tabs, only handle sign-out (to clear state).
        // The visibilitychange handler will re-sync when the tab is focused.
        if (document.visibilityState !== 'visible' && event !== 'SIGNED_OUT') {
          return
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        setLoading(false)

        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, signOut, refreshProfile, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}
