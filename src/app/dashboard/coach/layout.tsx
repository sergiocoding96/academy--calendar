import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CoachSidebar } from '@/components/dashboard/coach/coach-sidebar'
import { getUserProfile, requireRole } from '@/lib/auth'

function isRedirectError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'digest' in err) {
    const d = (err as { digest?: string }).digest
    return typeof d === 'string' && (d.startsWith('NEXT_REDIRECT') || d.includes('redirect'))
  }
  return false
}

export default async function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const cookieStore = await cookies()
    const isGuest = cookieStore.get('isGuest')?.value === 'true'
    if (!isGuest) {
      await requireRole(['coach', 'admin'])
    }

    const profile = isGuest ? null : await getUserProfile()

    return (
      <div className="flex h-screen bg-stone-50 overflow-hidden">
        <CoachSidebar serverProfile={profile ? { full_name: profile.full_name, email: profile.email } : null} />
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
