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
  // Track whether sign-out was explicitly requested by the user in THIS tab
  const userSignedOutRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      }
      // On error, keep existing profile (stale is better than null).
      // Profile is only cleared on explicit sign-out.
    } catch {
      // Network/transient error — keep existing profile
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
    userSignedOutRef.current = true
    if (isGuestRef.current) {
      isGuestRef.current = false
      setIsGuest(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isGuest')
        document.cookie = 'isGuest=; path=/; max-age=0'
      }
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setLoading(false)
  }, [supabase])

  // Control auto-refresh based on tab visibility.
  // Only the visible tab refreshes tokens — prevents two tabs racing to
  // consume the same single-use refresh token.
  useEffect(() => {
    if (isGuestRef.current) return

    const handleVisibilityChange = async () => {
      if (isGuestRef.current) return

      if (document.visibilityState === 'visible') {
        // Tab gained focus — start auto-refresh and re-sync state from cookies
        supabase.auth.startAutoRefresh()

        if (userSignedOutRef.current) return
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const currentUser = session?.user ?? null
          if (currentUser) {
            setUser(currentUser)
            await fetchProfile(currentUser.id)
          }
          // If session is null, don't clear state or redirect — it may be
          // transiently unavailable. The onAuthStateChange SIGNED_OUT event
          // is the authoritative signal for sign-out.
        } catch {
          // Network error — keep current state
        }
      } else {
        // Tab lost focus — stop auto-refresh so it can't race with other tabs
        supabase.auth.stopAutoRefresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [supabase, fetchProfile, router])

  useEffect(() => {
    // Check for guest session first
    if (typeof window !== 'undefined') {
      const wasGuest = localStorage.getItem('isGuest') === 'true'
      if (wasGuest) {
        signInAsGuest()
        return
      }
    }

    // Start auto-refresh only if this is the visible tab
    if (document.visibilityState === 'visible') {
      supabase.auth.startAutoRefresh()
    }

    // Safety net: if onAuthStateChange never fires (hidden tab, no session,
    // or Supabase client initialization delay), resolve loading from cookies
    // so the UI never gets permanently stuck.
    const loadingTimeout = setTimeout(() => {
      setLoading((prev) => {
        if (!prev) return prev // already resolved
        // Try to bootstrap from session cookies
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUser(session.user)
            fetchProfile(session.user.id)
          }
        }).catch(() => {})
        return false
      })
    }, 2500)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isGuestRef.current) return
        clearTimeout(loadingTimeout)

        const currentUser = session?.user ?? null

        if (event === 'SIGNED_OUT') {
          // Authoritative sign-out — clear everything
          setUser(null)
          setProfile(null)
          setLoading(false)
          // Only auto-redirect if sign-out wasn't user-initiated.
          // User-initiated sign-outs (sidebar button) do their own
          // hard navigation after awaiting signOut().
          if (!userSignedOutRef.current) {
            router.push('/login')
          }
          userSignedOutRef.current = false
          return
        }

        if (currentUser) {
          setUser(currentUser)
          await fetchProfile(currentUser.id)
        }
        // For TOKEN_REFRESHED / INITIAL_SESSION without a user, keep existing
        // state instead of clearing — prevents flicker on navigation.

        setLoading(false)
      }
    )

    return () => {
      clearTimeout(loadingTimeout)
      supabase.auth.stopAutoRefresh()
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
