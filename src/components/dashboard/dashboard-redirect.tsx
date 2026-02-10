'use client'

import { useEffect, useRef } from 'react'
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
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Avoid double redirect
    if (hasRedirected.current) return

    let target: string | null = null

    // Guest: redirect immediately
    if (isGuest) {
      target = '/dashboard/coach'
    }
    // Server already gave us role: redirect without waiting for client profile
    else if (serverProfile?.role === 'coach' || serverProfile?.role === 'admin') {
      target = '/dashboard/coach'
    } else if (serverProfile?.role === 'player') {
      target = '/dashboard/player'
    }
    // No server profile: wait for client auth, then redirect or send to login
    else if (!loading) {
      if (!profile) target = '/login'
    }

    if (target) {
      hasRedirected.current = true
      router.replace(target)
    }
  }, [isGuest, serverProfile?.role, profile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-red-200 rounded-full"></div>
        <div className="h-4 w-32 bg-stone-200 rounded"></div>
      </div>
    </div>
  )
}
