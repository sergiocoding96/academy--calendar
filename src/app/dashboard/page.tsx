import { getUserProfile } from '@/lib/auth'
import { DashboardRedirect } from '@/components/dashboard/dashboard-redirect'

export default async function DashboardPage() {
  // Try to get server-side profile (may be null for guests)
  let serverProfile = null
  try {
    serverProfile = await getUserProfile()
  } catch {
    // Guest users won't have a server profile
  }

  // Use client-side component to handle redirect logic
  // This allows guest mode to work properly
  return <DashboardRedirect serverProfile={serverProfile} />
}
