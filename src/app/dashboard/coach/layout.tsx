import { cookies } from 'next/headers'
import { CoachSidebar } from '@/components/dashboard/coach/coach-sidebar'
import { requireRole } from '@/lib/auth'

export default async function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('isGuest')?.value === 'true'
  if (!isGuest) {
    await requireRole(['coach', 'admin'])
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <CoachSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
