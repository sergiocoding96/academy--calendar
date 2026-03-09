'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus'
import { GuestCoachDashboard } from './guest-coach-dashboard'

interface CoachDashboardWrapperProps {
  children: React.ReactNode
}

export function CoachDashboardWrapper({ children }: CoachDashboardWrapperProps) {
  const { isGuest } = useAuth()
  useRefreshOnFocus()

  // Guest check — show guest view immediately
  if (isGuest) {
    return <GuestCoachDashboard />
  }

  // Always render children immediately. The server layout already verified
  // auth via requireRole(), so no loading skeleton needed here.
  // Showing a skeleton replaces the server-rendered HTML on every
  // page load/refresh, causing a flash and hiding the coach name.
  return <>{children}</>
}
