'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { GuestPlayerDashboard } from './guest-player-dashboard'

interface PlayerDashboardWrapperProps {
  children: React.ReactNode
}

export function PlayerDashboardWrapper({ children }: PlayerDashboardWrapperProps) {
  const { isGuest } = useAuth()

  if (isGuest) {
    return <GuestPlayerDashboard />
  }

  // Always render children immediately. The server layout already verified
  // auth via requireRole(), so no loading skeleton needed here.
  return <>{children}</>
}
