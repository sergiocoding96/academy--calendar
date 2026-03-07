import { redirect } from 'next/navigation'
import { PlayerSidebar } from '@/components/dashboard/player/player-sidebar'
import { requireRole } from '@/lib/auth'

function isRedirectError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'digest' in err) {
    const d = (err as { digest?: string }).digest
    return typeof d === 'string' && (d.startsWith('NEXT_REDIRECT') || d.includes('redirect'))
  }
  return false
}

export default async function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireRole(['player'])
    return (
      <div className="flex min-h-screen bg-stone-50">
        <PlayerSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    )
  } catch (err) {
    if (isRedirectError(err)) throw err
    redirect('/login')
  }
}
