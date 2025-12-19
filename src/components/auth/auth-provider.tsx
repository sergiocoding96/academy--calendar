'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Guest profile for demo purposes (coach role to see full system)
const GUEST_PROFILE = {
  id: 'guest-user-id',
  email: 'guest@sototennis.demo',
  full_name: 'Demo Coach',
  role: 'coach' as const,
  player_id: null,
  coach_id: 'guest-coach-id',
  created_at: new Date().toISOString(),
  avatar_url: null,
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'coach' | 'player' | 'parent'
  player_id: string | null
  coach_id: string | null
  created_at: string
  avatar_url: string | null
}

interface GuestUser {
  id: string
  email: string
}

interface AuthContextType {
  user: GuestUser | null
  profile: UserProfile | null
  loading: boolean
  isGuest: boolean
  signOut: () => void
  signInAsGuest: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isGuest: false,
  signOut: () => {},
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
  const [user, setUser] = useState<GuestUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  const signInAsGuest = () => {
    setIsGuest(true)
    setProfile(GUEST_PROFILE)
    setUser({ id: 'guest-user-id', email: 'guest@sototennis.demo' })
    setLoading(false)
    // Store guest state in localStorage and cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('isGuest', 'true')
      document.cookie = 'isGuest=true; path=/; max-age=86400' // 24 hours
    }
  }

  const signOut = () => {
    setIsGuest(false)
    setUser(null)
    setProfile(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isGuest')
      document.cookie = 'isGuest=; path=/; max-age=0'
    }
  }

  useEffect(() => {
    // Check for existing guest session
    if (typeof window !== 'undefined') {
      const wasGuest = localStorage.getItem('isGuest') === 'true'
      if (wasGuest) {
        signInAsGuest()
        return
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, signOut, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}
