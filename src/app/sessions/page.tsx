import { Navigation } from '@/components/ui/navigation'
import { SessionGrid } from '@/components/calendar/session-grid'

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Session Calendar</h1>
          <p className="text-stone-500 mt-1">Manage daily training sessions, courts, and player assignments</p>
        </div>

        <SessionGrid />
      </main>
    </div>
  )
}
