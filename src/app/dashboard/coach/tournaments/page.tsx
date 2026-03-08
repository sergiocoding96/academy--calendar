import { TournamentCalendar } from '@/components/tournament/tournament-calendar'

export default function CoachTournamentsPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Tournament Calendar</h1>
        <p className="text-stone-500 mt-1">View and manage tournament schedule, trips, and player entries</p>
      </div>

      <div className="flex-1 min-h-0">
        <TournamentCalendar />
      </div>
    </div>
  )
}
