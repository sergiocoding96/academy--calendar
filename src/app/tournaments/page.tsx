import { Navigation } from '@/components/ui/navigation'
import { TournamentCalendar } from '@/components/tournament/tournament-calendar'
import { TournamentFilterBar } from '@/components/tournament/tournament-filter-bar'

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      <Navigation />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-800">Tournament Calendar</h1>
          <p className="text-stone-500 mt-1">View and manage tournament schedule, trips, and player entries</p>
        </div>

        {/* Filter Bar */}
        <TournamentFilterBar className="mb-6" />

        <TournamentCalendar />
      </main>
    </div>
  )
}
