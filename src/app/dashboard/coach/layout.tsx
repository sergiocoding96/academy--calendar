import { CoachSidebar } from '@/components/dashboard/coach/coach-sidebar'
import { requireRole } from '@/lib/auth'

export default async function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['coach', 'admin'])

  return (
    <div className="flex min-h-screen bg-stone-50">
      <CoachSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
