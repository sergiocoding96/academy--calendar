'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

interface DashboardRedirectProps {
  serverProfile: {
    role?: string
  } | null
}

export function DashboardRedirect({ serverProfile }: DashboardRedirectProps) {
  const router = useRouter()
  const { isGuest, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    // Guest users always go to coach dashboard to see full system
    if (isGuest) {
      router.replace('/dashboard/coach')
      return
    }

    // If we have a server profile, redirect based on role
    if (serverProfile) {
      if (serverProfile.role === 'coach' || serverProfile.role === 'admin') {
        router.replace('/dashboard/coach')
      } else {
        router.replace('/dashboard/player')
      }
      return
    }

    // No profile at all, go to login
    if (!profile) {
      router.replace('/login')
    }
  }, [isGuest, serverProfile, profile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-red-200 rounded-full"></div>
        <div className="h-4 w-32 bg-stone-200 rounded"></div>
      </div>
    </div>
  )
}
