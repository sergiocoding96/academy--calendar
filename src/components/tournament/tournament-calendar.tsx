'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Users, Star } from 'lucide-react'
import { format, startOfWeek, addWeeks, getWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Tournament, TournamentAssignment, Coach, Player } from '@/types/database'

interface TournamentWithDetails extends Tournament {
  assignments?: (TournamentAssignment & {
    coach?: Coach
    player?: Player
  })[]
}

const optionConfig: Record<string, { gradient: string; glow: string; label: string }> = {
  proximity: {
    gradient: 'from-rose-600 via-red-600 to-red-700',
    glow: 'shadow-red-500/30',
    label: 'PROXIMITY',
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
}

const categories = ['U12/U14', 'U16/U18', 'Adults']

export function TournamentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date()))
  const [selectedCategory, setSelectedCategory] = useState('U16/U18')
  const [tournaments, setTournaments] = useState<TournamentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Generate 12 weeks for display
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const date = addWeeks(weekStart, i - 4)
    return {
      weekNumber: getWeek(date),
      startDate: date,
    }
  })

  // Fetch tournaments from Supabase
  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_assignments(
            *,
            coach:coaches(*),
            player:players(*)
          )
        `)
        .order('start_date')

      if (error) {
        console.error('Error fetching tournaments:', error)
      } else {
        setTournaments(data || [])
      }

      setLoading(false)
    }

    fetchTournaments()
  }, [])

  // Filter tournaments by selected week and category
  const filteredTournaments = tournaments.filter((t) => {
    const tournamentWeek = getWeek(new Date(t.start_date))
    const matchesWeek = tournamentWeek === selectedWeek
    const matchesCategory =
      selectedCategory === 'Adults'
        ? t.category === 'Adults'
        : t.category?.includes(selectedCategory.split('/')[0]) ||
          t.category?.includes(selectedCategory.split('/')[1])
    return matchesWeek && matchesCategory
  })

  const selectedWeekData = weeks.find((w) => w.weekNumber === selectedWeek)

  const navigateWeeks = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => addWeeks(prev, direction === 'next' ? 4 : -4))
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
              {weeks.map((week) => {
                const isSelected = selectedWeek === week.weekNumber
                const hasTournaments = tournaments.some(
                  (t) => getWeek(new Date(t.start_date)) === week.weekNumber
                )

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
          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            const count = tournaments.filter((t) => {
              const tournamentWeek = getWeek(new Date(t.start_date))
              const matchesWeek = tournamentWeek === selectedWeek
              const matchesCategory =
                cat === 'Adults'
                  ? t.category === 'Adults'
                  : t.category?.includes(cat.split('/')[0]) || t.category?.includes(cat.split('/')[1])
              return matchesWeek && matchesCategory
            }).length

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'relative flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white hover:shadow-md'
                )}
              >
                <span>{cat}</span>
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
            {filteredTournaments.map((tournament) => {
              const config = optionConfig[tournament.tournament_type || 'proximity'] || optionConfig.proximity
              const isHovered = hoveredCard === tournament.id
              const assignedCoach = tournament.assignments?.find((a) => a.role === 'coach')?.coach
              const assignedPlayers = tournament.assignments?.filter((a) => a.role === 'player') || []

              return (
                <div
                  key={tournament.id}
                  onMouseEnter={() => setHoveredCard(tournament.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={cn(
                    'group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer',
                    isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'
                  )}
                >
                  {/* Card gradient background */}
                  <div className={cn('absolute inset-0 bg-gradient-to-r', config.gradient)} />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />

                  {/* Shine effect on hover */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
                      'transition-transform duration-700 -skew-x-12',
                      isHovered ? 'translate-x-full' : '-translate-x-full'
                    )}
                  />

                  {/* Content */}
                  <div className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold tracking-wider">
                            {config.label}
                          </span>
                          {tournament.level && (
                            <span className="px-3 py-1 bg-white/10 rounded-lg text-white/80 text-xs font-medium">
                              {tournament.level}
                            </span>
                          )}
                        </div>

                        {/* Tournament name */}
                        <h4 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                          {tournament.name}
                        </h4>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-white/80 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{tournament.location}</span>
                        </div>

                        {/* Coach & Players */}
                        <div className="flex items-center gap-4 text-white/70 text-sm">
                          {assignedCoach && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span>Coach: {assignedCoach.name}</span>
                            </div>
                          )}
                          {assignedPlayers.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{assignedPlayers.length} players</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center',
                          'transition-all duration-300',
                          isHovered ? 'bg-white/20 translate-x-1' : ''
                        )}
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center justify-center gap-6">
          {Object.entries(optionConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full bg-gradient-to-r', config.gradient)} />
              <span className="text-stone-500 text-xs font-medium tracking-wide">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
