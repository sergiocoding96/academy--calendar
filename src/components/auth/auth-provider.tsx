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
  // Ref keeps the auth-state-change listener in sync without re-registering it
  const isGuestRef = useRef(false)
  // Stable Supabase client — created once, not on every render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  // Track whether initial session has been resolved to avoid double-fetch
  const initialSessionResolved = useRef(false)
  // Prevent the auth listener from interfering after sign-out
  const signingOutRef = useRef(false)
  // Track whether user was ever authenticated (to detect session expiry)
  const wasAuthenticatedRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        wasAuthenticatedRef.current = true
        setProfile(data)
      } else if (error) {
        // Auth error (e.g. expired JWT) — don't silently leave profile as stale
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
    // Store guest state in localStorage and cookie (for middleware)
    if (typeof window !== 'undefined') {
      localStorage.setItem('isGuest', 'true')
      document.cookie = 'isGuest=true; path=/; max-age=86400' // 24 hours
    }
  }, [])

  const signOut = useCallback(async () => {
    // Prevent the onAuthStateChange listener from interfering
    signingOutRef.current = true

    // Clear local state immediately so the UI responds instantly
    setUser(null)
    setProfile(null)
    setLoading(false)

    if (isGuestRef.current) {
      isGuestRef.current = false
      setIsGuest(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isGuest')
        document.cookie = 'isGuest=; path=/; max-age=0'
      }
    } else {
      // Fire-and-forget: don't let a slow/failing API call block the redirect
      supabase.auth.signOut().catch(() => {})
    }
  }, [supabase])

  useEffect(() => {
    // Check for guest session first
    if (typeof window !== 'undefined') {
      const wasGuest = localStorage.getItem('isGuest') === 'true'
      if (wasGuest) {
        signInAsGuest()
        return
      }
    }

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error?.code === 'refresh_token_not_found' || error?.message?.toLowerCase().includes('refresh token')) {
          try {
            await supabase.auth.signOut()
          } catch {
            // ignore
          }
          setUser(null)
          setProfile(null)
        } else {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          if (currentUser) {
            await fetchProfile(currentUser.id)
          }
        }
      } catch {
        setUser(null)
        setProfile(null)
      } finally {
        initialSessionResolved.current = true
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes (e.g. sign in/out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isGuestRef.current) return

        // A new sign-in resets the signing-out guard so the listener works again
        if (event === 'SIGNED_IN') {
          signingOutRef.current = false
        }

        if (signingOutRef.current) return
        // Skip INITIAL_SESSION event — already handled by initSession above
        if (event === 'INITIAL_SESSION' && !initialSessionResolved.current) return

        // TOKEN_REFRESHED with no session means the refresh token is invalid.
        // Clear state and sign out to prevent an infinite retry loop.
        if (event === 'TOKEN_REFRESHED' && !session) {
          try { await supabase.auth.signOut() } catch { /* ignore */ }
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
          // Session lost while user was previously authenticated → redirect
          if (wasAuthenticatedRef.current && event === 'SIGNED_OUT') {
            wasAuthenticatedRef.current = false
            router.push('/login')
          }
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Periodic session health check — detect expired tokens and redirect to login
  useEffect(() => {
    if (isGuestRef.current || signingOutRef.current || loading) return

    const interval = setInterval(async () => {
      if (isGuestRef.current || signingOutRef.current) return
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser && wasAuthenticatedRef.current) {
          // Session expired — redirect to login
          wasAuthenticatedRef.current = false
          setUser(null)
          setProfile(null)
          router.push('/login')
        }
      } catch {
        // Network error — don't redirect, just wait for next check
      }
    }, 60_000) // Check every 60 seconds

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, signOut, refreshProfile, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}
