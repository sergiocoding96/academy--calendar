import { PlayerSidebar } from '@/components/dashboard/player/player-sidebar'
import { requireRole } from '@/lib/auth'

export default async function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['player'])

  return (
    <div className="flex min-h-screen bg-stone-50">
      <PlayerSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
