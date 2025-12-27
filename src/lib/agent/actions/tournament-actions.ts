'use server'

import { createClient } from '@/lib/supabase/server'
import {
  MOCK_CALENDAR_TOURNAMENTS,
  MOCK_PLAYERS,
} from '@/lib/mock-data'

// ============================================
// Types
// ============================================

export interface TournamentQuery {
  category?: string
  date_from?: string
  date_to?: string
  location?: string
  tournament_type?: string
  level?: string
  limit?: number
}

export interface PlayerQuery {
  category?: string
  coach_id?: string
  status?: string
  limit?: number
}

export interface CalendarQuery {
  week_number?: number
  year?: number
  date_from?: string
  date_to?: string
}

export interface ToolResult {
  result: unknown
  isError: boolean
}

// ============================================
// Helper: Check if user is authenticated
// ============================================

async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

// ============================================
// Helper: Get week date range from week number
// ============================================

function getWeekDateRange(weekNumber: number, year: number = new Date().getFullYear()): { start: string; end: string } {
  // Calculate the first day of the year
  const jan1 = new Date(year, 0, 1)
  // Find the first Monday
  const firstMonday = new Date(jan1)
  const dayOfWeek = jan1.getDay()
  const diff = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek)
  firstMonday.setDate(jan1.getDate() + diff)

  // Calculate start of target week
  const start = new Date(firstMonday)
  start.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

  // Calculate end of target week (Sunday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

// ============================================
// Helper: Get current week number
// ============================================

function getCurrentWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 604800000 // milliseconds in a week
  return Math.ceil((diff / oneWeek) + (start.getDay() === 0 ? 1 : 0))
}

// ============================================
// Helper: Category to age range
// ============================================

function getCategoryAgeRange(category: string): { min: number; max: number } | null {
  const ranges: Record<string, { min: number; max: number }> = {
    'U12': { min: 0, max: 12 },
    'U14': { min: 0, max: 14 },
    'U16': { min: 0, max: 16 },
    'U18': { min: 0, max: 18 },
    'Adults': { min: 18, max: 99 },
  }
  return ranges[category] || null
}

// ============================================
// Query Tournaments
// ============================================

export async function queryTournaments(input: TournamentQuery): Promise<ToolResult> {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      // Guest mode: filter mock data
      let tournaments = [...MOCK_CALENDAR_TOURNAMENTS]

      if (input.category) {
        tournaments = tournaments.filter(t =>
          t.category.toLowerCase() === input.category!.toLowerCase()
        )
      }

      if (input.tournament_type) {
        tournaments = tournaments.filter(t =>
          t.tournament_type === input.tournament_type
        )
      }

      if (input.location) {
        const locationLower = input.location.toLowerCase()
        tournaments = tournaments.filter(t =>
          t.location.toLowerCase().includes(locationLower)
        )
      }

      if (input.date_from) {
        tournaments = tournaments.filter(t => t.start_date >= input.date_from!)
      }

      if (input.date_to) {
        tournaments = tournaments.filter(t => t.start_date <= input.date_to!)
      }

      if (input.level) {
        const levelLower = input.level.toLowerCase()
        tournaments = tournaments.filter(t =>
          t.level.toLowerCase().includes(levelLower)
        )
      }

      // Apply limit
      const limit = input.limit || 10
      tournaments = tournaments.slice(0, limit)

      return {
        result: {
          tournaments: tournaments.map(t => ({
            id: t.id,
            name: t.name,
            start_date: t.start_date,
            end_date: t.end_date,
            location: t.location,
            category: t.category,
            tournament_type: t.tournament_type,
            level: t.level,
            player_count: t.assignments?.filter(a => a.role === 'player').length || 0,
          })),
          total: tournaments.length,
          isGuestData: true,
        },
        isError: false,
      }
    }

    // Authenticated: query Supabase
    const supabase = await createClient()

    let query = supabase
      .from('academy_tournaments')
      .select(`
        id,
        name,
        start_date,
        end_date,
        location,
        category,
        tournament_type,
        level,
        tournament_assignments(count)
      `)
      .order('start_date', { ascending: true })

    if (input.category) {
      query = query.eq('category', input.category)
    }

    if (input.tournament_type) {
      query = query.eq('tournament_type', input.tournament_type)
    }

    if (input.location) {
      query = query.ilike('location', `%${input.location}%`)
    }

    if (input.date_from) {
      query = query.gte('start_date', input.date_from)
    }

    if (input.date_to) {
      query = query.lte('start_date', input.date_to)
    }

    if (input.level) {
      query = query.ilike('level', `%${input.level}%`)
    }

    query = query.limit(input.limit || 10)

    const { data: tournaments, error } = await query

    if (error) {
      return { result: { error: error.message }, isError: true }
    }

    return {
      result: {
        tournaments: tournaments || [],
        total: tournaments?.length || 0,
        isGuestData: false,
      },
      isError: false,
    }
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      isError: true,
    }
  }
}

// ============================================
// Get Tournament Details
// ============================================

export async function getTournamentDetails(input: { tournament_id: string }): Promise<ToolResult> {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      // Guest mode: find in mock data
      const tournament = MOCK_CALENDAR_TOURNAMENTS.find(t => t.id === input.tournament_id)

      if (!tournament) {
        return { result: { error: 'Tournament not found' }, isError: true }
      }

      return {
        result: {
          tournament: {
            ...tournament,
            coaches: tournament.assignments?.filter(a => a.role === 'coach').map(a => a.coach) || [],
            players: tournament.assignments?.filter(a => a.role === 'player').map(a => a.player) || [],
          },
          isGuestData: true,
        },
        isError: false,
      }
    }

    // Authenticated: query Supabase
    const supabase = await createClient()

    const { data: tournament, error } = await supabase
      .from('academy_tournaments')
      .select(`
        *,
        tournament_assignments(
          role,
          player:players(id, name, email, category, utr_rating),
          coach:coaches(id, name, email)
        )
      `)
      .eq('id', input.tournament_id)
      .single()

    if (error || !tournament) {
      return { result: { error: error?.message || 'Tournament not found' }, isError: true }
    }

    // TypeScript now knows tournament is not null
    const tournamentData = tournament as Record<string, unknown>

    return {
      result: {
        tournament: {
          ...tournamentData,
          coaches: (tournamentData.tournament_assignments as Array<{ role: string; coach: unknown }> | undefined)
            ?.filter((a) => a.role === 'coach')
            .map((a) => a.coach) || [],
          players: (tournamentData.tournament_assignments as Array<{ role: string; player: unknown }> | undefined)
            ?.filter((a) => a.role === 'player')
            .map((a) => a.player) || [],
        },
        isGuestData: false,
      },
      isError: false,
    }
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      isError: true,
    }
  }
}

// ============================================
// List Players
// ============================================

export async function listPlayers(input: PlayerQuery): Promise<ToolResult> {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      // Guest mode: filter mock data
      let players = [...MOCK_PLAYERS]

      if (input.category) {
        const ageRange = getCategoryAgeRange(input.category)
        if (ageRange) {
          players = players.filter(p =>
            p.age >= ageRange.min && p.age <= ageRange.max
          )
        }
      }

      // Apply limit
      const limit = input.limit || 20
      players = players.slice(0, limit)

      return {
        result: {
          players: players.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            age: p.age,
            level: p.level,
            category: p.age <= 12 ? 'U12' : p.age <= 14 ? 'U14' : p.age <= 16 ? 'U16' : p.age <= 18 ? 'U18' : 'Adults',
          })),
          total: players.length,
          isGuestData: true,
        },
        isError: false,
      }
    }

    // Authenticated: query Supabase
    const supabase = await createClient()

    let query = supabase
      .from('players')
      .select(`
        id,
        name,
        email,
        date_of_birth,
        category,
        utr_rating,
        status,
        coach:coaches(id, name)
      `)
      .order('name', { ascending: true })

    if (input.category) {
      query = query.eq('category', input.category)
    }

    if (input.coach_id) {
      query = query.eq('coach_id', input.coach_id)
    }

    if (input.status) {
      query = query.eq('status', input.status)
    } else {
      query = query.eq('status', 'active')
    }

    query = query.limit(input.limit || 20)

    const { data: players, error } = await query

    if (error) {
      return { result: { error: error.message }, isError: true }
    }

    return {
      result: {
        players: players || [],
        total: players?.length || 0,
        isGuestData: false,
      },
      isError: false,
    }
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      isError: true,
    }
  }
}

// ============================================
// Get Player Info
// ============================================

export async function getPlayerInfo(input: { player_id?: string; player_name?: string }): Promise<ToolResult> {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      // Guest mode: find in mock data
      let player = null

      if (input.player_id) {
        player = MOCK_PLAYERS.find(p => p.id === input.player_id)
      } else if (input.player_name) {
        const nameLower = input.player_name.toLowerCase()
        player = MOCK_PLAYERS.find(p =>
          p.name.toLowerCase().includes(nameLower)
        )
      }

      if (!player) {
        return { result: { error: 'Player not found' }, isError: true }
      }

      return {
        result: {
          player: {
            ...player,
            category: player.age <= 12 ? 'U12' : player.age <= 14 ? 'U14' : player.age <= 16 ? 'U16' : player.age <= 18 ? 'U18' : 'Adults',
            utr_rating: 8.5, // Mock UTR
            coach: { name: 'Coach Martinez' },
            upcomingTournaments: MOCK_CALENDAR_TOURNAMENTS
              .filter(t => t.assignments?.some(a => a.player?.name === player!.name))
              .slice(0, 3),
          },
          isGuestData: true,
        },
        isError: false,
      }
    }

    // Authenticated: query Supabase
    const supabase = await createClient()

    let query = supabase
      .from('players')
      .select(`
        *,
        coach:coaches(id, name, email),
        player_availability(*),
        tournament_assignments(
          tournament:academy_tournaments(id, name, start_date, end_date, location)
        )
      `)

    if (input.player_id) {
      query = query.eq('id', input.player_id)
    } else if (input.player_name) {
      query = query.ilike('name', `%${input.player_name}%`)
    } else {
      return { result: { error: 'Either player_id or player_name is required' }, isError: true }
    }

    const { data: players, error } = await query.limit(1)

    if (error) {
      return { result: { error: error.message }, isError: true }
    }

    if (!players || players.length === 0) {
      return { result: { error: 'Player not found' }, isError: true }
    }

    const player = players[0] as Record<string, unknown>
    const assignments = player.tournament_assignments as Array<{ tournament: { start_date: string } | null }> | undefined

    return {
      result: {
        player: {
          ...player,
          upcomingTournaments: assignments
            ?.map((a) => a.tournament)
            .filter((t) => t && new Date(t.start_date) >= new Date())
            .slice(0, 5) || [],
        },
        isGuestData: false,
      },
      isError: false,
    }
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      isError: true,
    }
  }
}

// ============================================
// Get Calendar Summary
// ============================================

export async function getCalendarSummary(input: CalendarQuery): Promise<ToolResult> {
  try {
    let dateFrom: string
    let dateTo: string

    if (input.week_number) {
      const range = getWeekDateRange(input.week_number, input.year)
      dateFrom = range.start
      dateTo = range.end
    } else if (input.date_from && input.date_to) {
      dateFrom = input.date_from
      dateTo = input.date_to
    } else {
      // Default to current week
      const currentWeek = getCurrentWeekNumber()
      const range = getWeekDateRange(currentWeek)
      dateFrom = range.start
      dateTo = range.end
    }

    const authenticated = await isAuthenticated()

    if (!authenticated) {
      // Guest mode: filter mock data
      const tournaments = MOCK_CALENDAR_TOURNAMENTS.filter(t =>
        t.start_date >= dateFrom && t.start_date <= dateTo
      )

      return {
        result: {
          summary: {
            dateRange: { from: dateFrom, to: dateTo },
            tournaments: tournaments.map(t => ({
              id: t.id,
              name: t.name,
              start_date: t.start_date,
              end_date: t.end_date,
              location: t.location,
              category: t.category,
              player_count: t.assignments?.filter(a => a.role === 'player').length || 0,
            })),
            tournamentCount: tournaments.length,
            playerAssignments: tournaments.reduce((acc, t) =>
              acc + (t.assignments?.filter(a => a.role === 'player').length || 0), 0
            ),
          },
          isGuestData: true,
        },
        isError: false,
      }
    }

    // Authenticated: query Supabase
    const supabase = await createClient()

    const { data: tournaments, error } = await supabase
      .from('academy_tournaments')
      .select(`
        id,
        name,
        start_date,
        end_date,
        location,
        category,
        tournament_type,
        level,
        tournament_assignments(
          role,
          player:players(id, name)
        )
      `)
      .gte('start_date', dateFrom)
      .lte('start_date', dateTo)
      .order('start_date', { ascending: true })

    if (error) {
      return { result: { error: error.message }, isError: true }
    }

    // Type assertion for tournaments with assignments
    type TournamentWithAssignments = Record<string, unknown> & {
      tournament_assignments?: Array<{ role: string }>
    }
    const tournamentList = (tournaments || []) as TournamentWithAssignments[]

    const playerAssignments = tournamentList.reduce((acc, t) =>
      acc + (t.tournament_assignments?.filter((a) => a.role === 'player').length || 0), 0
    )

    return {
      result: {
        summary: {
          dateRange: { from: dateFrom, to: dateTo },
          tournaments: tournamentList,
          tournamentCount: tournamentList.length,
          playerAssignments,
        },
        isGuestData: false,
      },
      isError: false,
    }
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      isError: true,
    }
  }
}

// ============================================
// Recommend Tournaments (Phase 4 - Stub)
// ============================================

export async function recommendTournaments(input: {
  player_id?: string
  player_name?: string
  max_results?: number
  date_from?: string
  date_to?: string
  tournament_type?: string
}): Promise<ToolResult> {
  // For Phase 3, return a basic recommendation based on available tournaments
  // Phase 4 will implement the full scoring algorithm

  const playerResult = await getPlayerInfo({
    player_id: input.player_id,
    player_name: input.player_name,
  })

  if (playerResult.isError) {
    return playerResult
  }

  const player = (playerResult.result as { player: { category: string; name: string } }).player

  // Get tournaments matching player's category
  const tournamentsResult = await queryTournaments({
    category: player.category,
    date_from: input.date_from || new Date().toISOString().split('T')[0],
    date_to: input.date_to,
    tournament_type: input.tournament_type,
    limit: input.max_results || 5,
  })

  if (tournamentsResult.isError) {
    return tournamentsResult
  }

  const tournaments = (tournamentsResult.result as { tournaments: unknown[] }).tournaments

  return {
    result: {
      recommendations: tournaments.map((t, index) => ({
        tournament: t,
        score: 80 - (index * 5), // Simple decreasing score
        explanation: `Matches ${player.name}'s category (${player.category})`,
        factors: {
          ageCategoryMatch: 25,
          levelAppropriateness: 20,
          travelDistance: 15,
          availabilityTiming: 10,
          entryDeadline: 5 - index,
          tournamentPrestige: 5,
        },
      })),
      player: player.name,
      isGuestData: (playerResult.result as { isGuestData: boolean }).isGuestData,
    },
    isError: false,
  }
}

// ============================================
// Search External (Phase 5 - Stub)
// ============================================

export async function searchExternal(input: {
  query: string
  sources?: string[]
  category?: string
  location?: string
  date_from?: string
  date_to?: string
}): Promise<ToolResult> {
  // Phase 5 will implement web scraping
  // For now, return a message about the feature

  return {
    result: {
      message: `External search for "${input.query}" will be available in a future update. The system will search ${input.sources?.join(', ') || 'ITF, Tennis Europe, and federation'} websites for tournaments.`,
      sources: input.sources || ['itf', 'tennis_europe', 'rfet'],
      status: 'not_implemented',
    },
    isError: false,
  }
}
