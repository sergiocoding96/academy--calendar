import { redirect } from 'next/navigation'
import { PlayerSidebar } from '@/components/dashboard/player/player-sidebar'
import { getUserProfile, requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
    const profile = await getUserProfile()

    return (
      <div className="flex min-h-screen bg-stone-50">
        <PlayerSidebar serverProfile={profile ? { full_name: profile.full_name, email: profile.email } : null} />
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
