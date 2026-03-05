'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isGuest: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  signInAsGuest: () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  // Ref keeps the auth-state-change listener in sync without re-registering it
  const isGuestRef = useRef(false)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
      }
    } catch {
      // Profile fetch failed; leave profile null
    }
  }

  const refreshProfile = async () => {
    if (user && !isGuest) {
      await fetchProfile(user.id)
    }
  }

  const signInAsGuest = () => {
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
  }

  const signOut = async () => {
    if (isGuestRef.current) {
      isGuestRef.current = false
      setIsGuest(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isGuest')
        document.cookie = 'isGuest=; path=/; max-age=0' // Clear cookie
      }
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }

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
    // Use getSession() for initial load (faster, can use cache)
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        }
      } catch {
        // Session check failed; listener will update when auth state is known
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes (e.g. sign in/out, token refresh)
    // Use isGuestRef (not isGuest state) to avoid stale closure
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isGuestRef.current) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, signOut, refreshProfile, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}
