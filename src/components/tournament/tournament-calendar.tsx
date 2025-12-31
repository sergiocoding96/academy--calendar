'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTournamentCalendar, type CalendarTournament } from '@/hooks/tournament'
import { TournamentCard } from './tournament-card'
import { TournamentDetailModal } from './tournament-detail-modal'

// Tournament type color configuration
const typeConfig: Record<string, { gradient: string; glow: string; label: string }> = {
  proximity: {
    gradient: 'from-rose-600 via-red-600 to-red-700',
    glow: 'shadow-red-500/30',
    label: 'LOCAL',
  },
  national: {
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    glow: 'shadow-slate-500/30',
    label: 'NATIONAL',
  },
  international: {
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    glow: 'shadow-orange-500/30',
    label: 'INTERNATIONAL',
  },
  itf: {
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    glow: 'shadow-blue-500/30',
    label: 'ITF',
  },
  tennis_europe: {
    gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
    glow: 'shadow-emerald-500/30',
    label: 'TE',
  },
  federation: {
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
    glow: 'shadow-purple-500/30',
    label: 'FED',
  },
}

// Category tabs for filtering
const categoryTabs = [
  { id: 'U12', label: 'U12' },
  { id: 'U14', label: 'U14' },
  { id: 'U16', label: 'U16' },
  { id: 'U18', label: 'U18' },
  { id: 'Adults', label: 'Adults' },
]

interface TournamentCalendarProps {
  /** External tournaments from discovery API - when provided, uses these instead of fetching */
  tournaments?: CalendarTournament[]
  /** Loading state from parent component */
  isLoading?: boolean
  /** Error message from parent component */
  error?: string | null
}

export function TournamentCalendar({
  tournaments: externalTournaments,
  isLoading: externalLoading,
  error: externalError,
}: TournamentCalendarProps = {}) {
  const {
    filteredTournaments,
    weeks,
    selectedWeek,
    setSelectedWeek,
    navigateWeeks,
    selectedCategory,
    setSelectedCategory,
    loading,
    error: hookError,
    selectedTournament,
    isModalOpen,
    openModal,
    closeModal,
    getTournamentAssignedPlayers,
    tournaments,
  } = useTournamentCalendar({
    externalTournaments,
    isLoading: externalLoading,
  })

  // Combine error states
  const error = externalError || hookError

  const selectedWeekData = weeks.find(w => w.weekNumber === selectedWeek)

  // Count tournaments per category for the selected week
  const getCategoryCount = (categoryId: string) => {
    return tournaments.filter(t => {
      if (!t.start_date) return false
      const category = t.category?.toLowerCase() || ''
      const catLower = categoryId.toLowerCase()

      // Check if in selected week
      const { getWeek, parseISO } = require('date-fns')
      const tournamentWeek = getWeek(parseISO(t.start_date))
      if (tournamentWeek !== selectedWeek) return false

      // Check category match
      return category.includes(catLower)
    }).length
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-black text-white tracking-wide"
                style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
              >
                Tournament Calendar
              </h2>
              <p className="text-red-200 text-sm">2025-2026 Season</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Live</span>
            </div>
          </div>

          {/* Week Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeeks('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-2">
              {weeks.map(week => {
                const isSelected = selectedWeek === week.weekNumber
                const hasTournaments = week.tournamentCount > 0

                return (
                  <button
                    key={week.weekNumber}
                    onClick={() => setSelectedWeek(week.weekNumber)}
                    className={cn(
                      'flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300',
                      isSelected
                        ? 'bg-white text-red-700 shadow-lg scale-110'
                        : hasTournaments
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-white/5 text-white/50'
                    )}
                  >
                    <span className="text-[10px] font-bold tracking-wider opacity-80">WEEK</span>
                    <span className="text-lg font-black">{week.weekNumber}</span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => navigateWeeks('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Info */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-stone-200">
        <h3
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-600"
          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.1em' }}
        >
          WEEK {selectedWeek}
        </h3>
        {selectedWeekData && (
          <p className="text-red-500 font-medium">
            {format(selectedWeekData.startDate, 'MMM d')} -{' '}
            {format(addWeeks(selectedWeekData.startDate, 1), 'MMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
        <div className="flex gap-2">
          {categoryTabs.map(cat => {
            const isActive = selectedCategory === cat.id
            const count = getCategoryCount(cat.id)

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'relative flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white hover:shadow-md'
                )}
              >
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'absolute top-1.5 right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold',
                      isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tournament List */}
      <div className="p-6 bg-gradient-to-b from-white to-stone-50 min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading tournaments</p>
            <p className="text-stone-400 text-sm mt-1">{error}</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-stone-500 font-medium">No tournaments this week</p>
            <p className="text-stone-400 text-sm mt-1">Check other categories or weeks</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTournaments.map(tournament => {
              const assignedPlayers = getTournamentAssignedPlayers(tournament)

              return (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onClick={() => openModal(tournament)}
                  assignedPlayers={assignedPlayers.length}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {Object.entries(typeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', config.gradient)} />
              <span className="text-stone-500 text-xs font-medium tracking-wide">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament Detail Modal */}
      <TournamentDetailModal
        tournament={selectedTournament}
        isOpen={isModalOpen}
        onClose={closeModal}
        assignedPlayers={selectedTournament ? getTournamentAssignedPlayers(selectedTournament) : []}
        onAddToCalendar={(t) => {
          console.log('Add to calendar:', t)
          // TODO: Implement add to calendar functionality
        }}
        onAssignPlayers={(t) => {
          console.log('Assign players:', t)
          // TODO: Implement player assignment functionality
        }}
      />
    </div>
  )
}
