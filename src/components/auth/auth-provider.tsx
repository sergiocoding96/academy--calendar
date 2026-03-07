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
    userSignedOutRef.current = true
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
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      if (isGuestRef.current || userSignedOutRef.current) return

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        if (currentUser) {
          setUser(currentUser)
          await fetchProfile(currentUser.id)
        } else {
          // No session when tab regains focus — another tab may have signed out
          setUser(null)
          setProfile(null)
          router.push('/login')
        }
      } catch {
        // Network error — keep current state
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isGuestRef.current) return

        // SIGNED_OUT from a failed token refresh (race with middleware/other tab).
        // Instead of clearing state immediately, re-read cookies — the middleware
        // or the other tab may have already written fresh tokens there.
        if (event === 'SIGNED_OUT' && !userSignedOutRef.current) {
          try {
            const { data: { session: recovered } } = await supabase.auth.getSession()
            if (recovered?.user) {
              // Session recovered from cookies — another tab refreshed successfully.
              setUser(recovered.user)
              await fetchProfile(recovered.user.id)
              setLoading(false)
              return
            }
          } catch {
            // Recovery failed — fall through to clear state
          }
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        setLoading(false)

        // Only redirect on user-initiated sign-out or confirmed session loss
        if (event === 'SIGNED_OUT') {
          userSignedOutRef.current = false
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
