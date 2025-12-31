'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { startOfWeek, addWeeks, getWeek, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'
import { MOCK_CALENDAR_TOURNAMENTS } from '@/lib/mock-data'
import type { Profile, Player } from '@/types/database'
import type { ScrapedTournament } from '@/types/agent'
import type { DateRange } from '@/components/tournament/date-range-picker'

// Tournament assignment interface (matches mock data structure)
export interface TournamentAssignment {
  id?: string
  tournament_id?: string
  role: 'coach' | 'player'
  coach_id?: string | null
  player_id?: string | null
  coach?: { name: string } | Profile | null
  player?: { name: string } | Player | null
}

// Extended tournament type with assignment details
// Note: Not extending AcademyTournament to avoid type conflicts with optional/nullable fields
export interface TournamentWithDetails {
  id: string
  name: string
  start_date: string
  end_date?: string | null
  location?: string | null
  tournament_type?: string | null
  category?: string | null
  level?: string | null
  surface?: string | null
  entry_deadline?: string | null
  website?: string | null
  country?: string | null
  assignments?: TournamentAssignment[]
}

// Combined tournament type that handles both database and scraped tournaments
export type CalendarTournament = TournamentWithDetails | ScrapedTournament

// Week data structure for navigation
export interface WeekData {
  weekNumber: number
  startDate: Date
  tournamentCount: number
}

// Filter state
export interface CalendarFilters {
  sources: string[]
  dateRange: DateRange
  category: string | null
  searchQuery: string
}

// Hook return type
export interface UseTournamentCalendarReturn {
  // Tournament data
  tournaments: CalendarTournament[]
  filteredTournaments: CalendarTournament[]
  tournamentsByWeek: Map<number, CalendarTournament[]>

  // Week navigation
  weeks: WeekData[]
  selectedWeek: number
  setSelectedWeek: (week: number) => void
  navigateWeeks: (direction: 'prev' | 'next') => void
  currentDate: Date

  // Category filter
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void

  // Loading state
  loading: boolean
  error: string | null

  // Actions
  refreshTournaments: () => Promise<void>
  applyFilters: (filters: Partial<CalendarFilters>) => void

  // Modal state
  selectedTournament: CalendarTournament | null
  setSelectedTournament: (tournament: CalendarTournament | null) => void
  isModalOpen: boolean
  openModal: (tournament: CalendarTournament) => void
  closeModal: () => void

  // Helpers
  getTournamentAssignedPlayers: (tournament: CalendarTournament) => { id: string; name: string }[]
  isTournamentInWeek: (tournament: CalendarTournament, weekNumber: number) => boolean
}

const DEFAULT_CATEGORIES = ['U10', 'U12', 'U14', 'U16', 'U18', 'Adults']
const WEEKS_TO_DISPLAY = 12
const WEEKS_OFFSET = 4

// Options for the hook
export interface UseTournamentCalendarOptions {
  initialFilters?: Partial<CalendarFilters>
  externalTournaments?: CalendarTournament[]
  isLoading?: boolean
}

/**
 * Hook for managing tournament calendar state
 * Handles week navigation, category filtering, and modal state
 */
export function useTournamentCalendar(options?: UseTournamentCalendarOptions): UseTournamentCalendarReturn {
  const { initialFilters, externalTournaments, isLoading: externalLoading } = options || {}
  const { isGuest } = useAuth()

  // Core state - use external tournaments if provided
  const [internalTournaments, setInternalTournaments] = useState<CalendarTournament[]>([])
  const [loading, setLoading] = useState(!externalTournaments)
  const [error, setError] = useState<string | null>(null)

  // Use external tournaments if provided, otherwise use internal state
  const tournaments = externalTournaments ?? internalTournaments
  const isLoading = externalLoading ?? loading

  // Navigation state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState(getWeek(new Date()))
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || 'U16')

  // Filter state
  const [filters, setFilters] = useState<CalendarFilters>({
    sources: initialFilters?.sources || [],
    dateRange: initialFilters?.dateRange || { from: new Date(), to: addWeeks(new Date(), 8) },
    category: initialFilters?.category || null,
    searchQuery: initialFilters?.searchQuery || '',
  })

  // Modal state
  const [selectedTournament, setSelectedTournament] = useState<CalendarTournament | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Generate weeks array for navigation
  const weeks = useMemo<WeekData[]>(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: WEEKS_TO_DISPLAY }, (_, i) => {
      const date = addWeeks(weekStart, i - WEEKS_OFFSET)
      const weekNumber = getWeek(date)
      const tournamentCount = tournaments.filter(t => {
        if (!t.start_date) return false
        return getWeek(parseISO(t.start_date)) === weekNumber
      }).length

      return {
        weekNumber,
        startDate: date,
        tournamentCount,
      }
    })
  }, [currentDate, tournaments])

  // Filter tournaments by selected category and week
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      // Week filter
      if (t.start_date) {
        const tournamentWeek = getWeek(parseISO(t.start_date))
        if (tournamentWeek !== selectedWeek) return false
      }

      // Category filter
      if (selectedCategory) {
        const category = t.category?.toLowerCase() || ''
        const selectedCat = selectedCategory.toLowerCase()

        // Handle combined categories like "U12/U14"
        if (selectedCat.includes('/')) {
          const cats = selectedCat.split('/')
          if (!cats.some(c => category.includes(c))) return false
        } else {
          if (!category.includes(selectedCat)) return false
        }
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const name = t.name?.toLowerCase() || ''
        const location = t.location?.toLowerCase() || ''
        if (!name.includes(query) && !location.includes(query)) return false
      }

      // Date range filter
      if (filters.dateRange.from && filters.dateRange.to && t.start_date) {
        const startDate = parseISO(t.start_date)
        if (!isWithinInterval(startDate, {
          start: startOfDay(filters.dateRange.from),
          end: endOfDay(filters.dateRange.to),
        })) {
          return false
        }
      }

      return true
    })
  }, [tournaments, selectedWeek, selectedCategory, filters.searchQuery, filters.dateRange])

  // Group tournaments by week
  const tournamentsByWeek = useMemo(() => {
    const map = new Map<number, CalendarTournament[]>()
    tournaments.forEach(t => {
      if (!t.start_date) return
      const weekNumber = getWeek(parseISO(t.start_date))
      if (!map.has(weekNumber)) {
        map.set(weekNumber, [])
      }
      map.get(weekNumber)!.push(t)
    })
    return map
  }, [tournaments])

  // Fetch tournaments (only when not using external tournaments)
  const fetchTournaments = useCallback(async () => {
    // Skip if using external tournaments
    if (externalTournaments) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use mock data for guest users
      if (isGuest) {
        const mockTournaments = MOCK_CALENDAR_TOURNAMENTS.map(t => ({
          ...t,
          assignments: t.assignments?.map(a => ({
            ...a,
            id: `${t.id}-${a.role}-${a.coach?.name || a.player?.name}`,
            tournament_id: t.id,
            coach_id: a.coach ? 'mock-coach-id' : null,
            player_id: a.player ? 'mock-player-id' : null,
          })),
        })) as TournamentWithDetails[]
        setInternalTournaments(mockTournaments)
        setLoading(false)
        return
      }

      const supabase = createClient()

      const { data, error: fetchError } = await supabase
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

      if (fetchError) {
        console.error('Error fetching tournaments:', fetchError)
        setError(fetchError.message)
      } else {
        setInternalTournaments(data || [])
      }
    } catch (err) {
      console.error('Error in fetchTournaments:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [isGuest, externalTournaments])

  // Initial fetch
  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  // Navigation actions
  const navigateWeeks = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => addWeeks(prev, direction === 'next' ? WEEKS_OFFSET : -WEEKS_OFFSET))
  }, [])

  // Apply filters
  const applyFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Modal actions
  const openModal = useCallback((tournament: CalendarTournament) => {
    setSelectedTournament(tournament)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedTournament(null)
  }, [])

  // Helper: Get assigned players for a tournament
  const getTournamentAssignedPlayers = useCallback((tournament: CalendarTournament): { id: string; name: string }[] => {
    if ('assignments' in tournament && tournament.assignments) {
      return tournament.assignments
        .filter(a => a.role === 'player' && a.player)
        .map(a => {
          const player = a.player!
          // Handle both mock data ({ name }) and database Player type ({ full_name })
          if ('full_name' in player) {
            return { id: player.id, name: player.full_name }
          }
          // Mock data doesn't have id, generate one
          return { id: `mock-${player.name}`, name: player.name }
        })
    }
    return []
  }, [])

  // Helper: Check if tournament is in a specific week
  const isTournamentInWeek = useCallback((tournament: CalendarTournament, weekNumber: number): boolean => {
    if (!tournament.start_date) return false
    return getWeek(parseISO(tournament.start_date)) === weekNumber
  }, [])

  return {
    // Tournament data
    tournaments,
    filteredTournaments,
    tournamentsByWeek,

    // Week navigation
    weeks,
    selectedWeek,
    setSelectedWeek,
    navigateWeeks,
    currentDate,

    // Category filter
    categories: DEFAULT_CATEGORIES,
    selectedCategory,
    setSelectedCategory,

    // Loading state
    loading: isLoading,
    error,

    // Actions
    refreshTournaments: fetchTournaments,
    applyFilters,

    // Modal state
    selectedTournament,
    setSelectedTournament,
    isModalOpen,
    openModal,
    closeModal,

    // Helpers
    getTournamentAssignedPlayers,
    isTournamentInWeek,
  }
}
