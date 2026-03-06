'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'

interface DashboardRedirectProps {
  serverProfile: {
    role?: string
  } | null
}

function resolveTarget(role: string | undefined): string {
  if (role === 'coach' || role === 'admin') return '/dashboard/coach'
  if (role === 'player') return '/dashboard/player'
  // manager, parent, or any unrecognized role: send to coach dashboard
  return '/dashboard/coach'
}

export function DashboardRedirect({ serverProfile }: DashboardRedirectProps) {
  const router = useRouter()
  const { isGuest, profile, loading } = useAuth()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return

    let target: string | null = null

    if (isGuest) {
      target = '/dashboard/coach'
    } else if (serverProfile?.role) {
      target = resolveTarget(serverProfile.role)
    } else if (!loading) {
      if (profile?.role) {
        target = resolveTarget(profile.role)
      } else {
        target = '/login'
      }
    }

    if (target) {
      hasRedirected.current = true
      router.replace(target)
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
