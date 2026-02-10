'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { GuestPlayerDashboard } from './guest-player-dashboard'

interface PlayerDashboardWrapperProps {
  children: React.ReactNode
}

export function PlayerDashboardWrapper({ children }: PlayerDashboardWrapperProps) {
  const { isGuest, loading, profile } = useAuth()

  // Guest sees dedicated guest view
  if (isGuest) {
    return <GuestPlayerDashboard />
  }

  // Server already rendered this page for a signed-in player; show content immediately
  // and only show skeleton on first load when we don't have profile yet
  if (loading && !profile) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-stone-200 rounded mb-4" />
          <div className="h-4 w-48 bg-stone-200 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-stone-200">
                <div className="h-12 w-12 bg-stone-200 rounded-lg mb-4" />
                <div className="h-4 w-24 bg-stone-200 rounded mb-2" />
                <div className="h-6 w-12 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
