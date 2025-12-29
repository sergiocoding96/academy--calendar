/**
 * Tournament Recommendation Engine
 *
 * Fetches player profile, upcoming tournaments, and availability data
 * to generate personalized tournament recommendations.
 */

import { createClient } from '@/lib/supabase/server'
import {
  calculateTournamentScore,
  type PlayerProfile,
  type TournamentForScoring,
  type PlayerAvailability,
  type ScoreBreakdown,
} from './scoring'

// ============================================
// Types
// ============================================

export interface RecommendationFilters {
  date_from?: string
  date_to?: string
  tournament_type?: string
  category?: string
  level?: string
  limit?: number
}

export interface TournamentRecommendation {
  tournament: TournamentForScoring & {
    description?: string
    website_url?: string
  }
  score: ScoreBreakdown
  explanation: string
}

export interface RecommendationResult {
  player: {
    id: string
    name: string
    category: string
    utr_rating?: number
  }
  recommendations: TournamentRecommendation[]
  totalMatches: number
  filters: RecommendationFilters
}

// ============================================
// Mock Data for Guest Mode
// ============================================

const MOCK_RECOMMENDATIONS: TournamentRecommendation[] = [
  {
    tournament: {
      id: 'mock-rec-1',
      name: 'Regional Junior Championship',
      category: 'U16',
      level: 'Grade 3',
      tournament_type: 'proximity',
      location: 'Barcelona',
      start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      entry_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    score: {
      totalScore: 87,
      factors: {
        categoryMatch: { score: 25, maxScore: 25, description: 'Exact category match' },
        levelMatch: { score: 20, maxScore: 25, description: 'Good level for current UTR' },
        travelDistance: { score: 20, maxScore: 20, description: 'Local tournament' },
        availability: { score: 12, maxScore: 15, description: 'Player available' },
        entryDeadline: { score: 8, maxScore: 10, description: 'Good time to enter' },
        prestige: { score: 2, maxScore: 5, description: 'Regional event' },
      },
      recommendation: 'highly_recommended',
    },
    explanation: 'This tournament is an excellent match for your U16 category and current skill level. Local venue means minimal travel, and the entry deadline gives you time to prepare.',
  },
  {
    tournament: {
      id: 'mock-rec-2',
      name: 'National Junior Open',
      category: 'U16',
      level: 'Grade 2',
      tournament_type: 'national',
      location: 'Madrid',
      start_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 39 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      entry_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    score: {
      totalScore: 72,
      factors: {
        categoryMatch: { score: 25, maxScore: 25, description: 'Exact category match' },
        levelMatch: { score: 18, maxScore: 25, description: 'Slightly challenging level' },
        travelDistance: { score: 12, maxScore: 20, description: 'National travel required' },
        availability: { score: 12, maxScore: 15, description: 'Player available' },
        entryDeadline: { score: 10, maxScore: 10, description: 'Plenty of time' },
        prestige: { score: 4, maxScore: 5, description: 'National level prestige' },
      },
      recommendation: 'recommended',
    },
    explanation: 'A challenging but appropriate tournament that could help improve your national ranking. Good opportunity for competitive experience.',
  },
  {
    tournament: {
      id: 'mock-rec-3',
      name: 'Tennis Europe Junior Tour',
      category: 'U16',
      level: 'Tennis Europe',
      tournament_type: 'international',
      location: 'Valencia',
      start_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      entry_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    score: {
      totalScore: 65,
      factors: {
        categoryMatch: { score: 25, maxScore: 25, description: 'Exact category match' },
        levelMatch: { score: 15, maxScore: 25, description: 'High-level competition' },
        travelDistance: { score: 6, maxScore: 20, description: 'International event' },
        availability: { score: 12, maxScore: 15, description: 'Player available' },
        entryDeadline: { score: 10, maxScore: 10, description: 'Plenty of time' },
        prestige: { score: 5, maxScore: 5, description: 'High prestige event' },
      },
      recommendation: 'recommended',
    },
    explanation: 'A prestigious international event. While challenging, it offers excellent exposure and ranking points. Consider if ready for this level.',
  },
]

// ============================================
// Helper Functions
// ============================================

function generateExplanation(
  player: PlayerProfile,
  tournament: TournamentForScoring,
  score: ScoreBreakdown
): string {
  const parts: string[] = []

  // Category match explanation
  if (score.factors.categoryMatch.score === score.factors.categoryMatch.maxScore) {
    parts.push(`Perfect match for your ${player.category} category.`)
  } else if (score.factors.categoryMatch.score >= score.factors.categoryMatch.maxScore * 0.5) {
    parts.push(`Category is close to your ${player.category} level.`)
  }

  // Level explanation
  if (score.factors.levelMatch.score >= score.factors.levelMatch.maxScore * 0.75) {
    parts.push(`Tournament level suits your current skill.`)
  } else if (score.factors.levelMatch.score >= score.factors.levelMatch.maxScore * 0.5) {
    parts.push(`This will be a challenging but achievable level.`)
  } else {
    parts.push(`This level may be quite challenging.`)
  }

  // Travel explanation
  if (tournament.tournament_type === 'proximity') {
    parts.push(`Local event with minimal travel.`)
  } else if (tournament.tournament_type === 'national') {
    parts.push(`National event - some travel required.`)
  } else if (tournament.tournament_type === 'international') {
    parts.push(`International event - significant travel commitment.`)
  }

  // Deadline warning
  if (score.factors.entryDeadline.score < score.factors.entryDeadline.maxScore * 0.5) {
    parts.push(`⚠️ Entry deadline is approaching soon.`)
  }

  // Final recommendation
  if (score.recommendation === 'highly_recommended') {
    parts.push(`Highly recommended for your development.`)
  } else if (score.recommendation === 'recommended') {
    parts.push(`A good opportunity to consider.`)
  } else if (score.recommendation === 'consider') {
    parts.push(`Worth considering if schedule permits.`)
  }

  return parts.join(' ')
}

// ============================================
// Main Engine Functions
// ============================================

export async function getRecommendations(
  playerId: string | undefined,
  playerName: string | undefined,
  filters: RecommendationFilters = {}
): Promise<{ result: RecommendationResult; isGuestData: boolean } | { error: string }> {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Guest mode - return mock recommendations
    return {
      result: {
        player: {
          id: 'mock-player',
          name: 'Demo Player',
          category: 'U16',
          utr_rating: 7.5,
        },
        recommendations: MOCK_RECOMMENDATIONS.slice(0, filters.limit || 5),
        totalMatches: MOCK_RECOMMENDATIONS.length,
        filters,
      },
      isGuestData: true,
    }
  }

  try {
    // Find player
    let playerQuery = supabase.from('players').select('*')

    if (playerId) {
      playerQuery = playerQuery.eq('id', playerId)
    } else if (playerName) {
      playerQuery = playerQuery.ilike('name', `%${playerName}%`)
    } else {
      return { error: 'Player ID or name is required' }
    }

    const { data: players, error: playerError } = await playerQuery.limit(1)

    if (playerError || !players || players.length === 0) {
      return { error: playerError?.message || 'Player not found' }
    }

    const playerData = players[0] as Record<string, unknown>
    const player: PlayerProfile = {
      id: playerData.id as string,
      name: playerData.name as string,
      category: playerData.category as string || 'U16',
      utr_rating: playerData.utr_rating as number | undefined,
      birthDate: playerData.birth_date as string | undefined,
      coach_id: playerData.coach_id as string | undefined,
    }

    // Fetch player availability
    const { data: availabilityData } = await supabase
      .from('player_availability')
      .select('*')
      .eq('player_id', player.id)
      .gte('end_date', new Date().toISOString().split('T')[0])

    const availabilities: PlayerAvailability[] = (availabilityData || []).map((a: Record<string, unknown>) => ({
      start_date: a.start_date as string,
      end_date: a.end_date as string,
      availability_type: a.availability_type as PlayerAvailability['availability_type'],
    }))

    // Fetch upcoming tournaments
    const dateFrom = filters.date_from || new Date().toISOString().split('T')[0]
    const dateTo = filters.date_to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let tournamentQuery = supabase
      .from('tournaments')
      .select('*')
      .gte('start_date', dateFrom)
      .lte('start_date', dateTo)
      .order('start_date', { ascending: true })

    if (filters.category) {
      tournamentQuery = tournamentQuery.ilike('category', `%${filters.category}%`)
    }
    if (filters.tournament_type) {
      tournamentQuery = tournamentQuery.eq('tournament_type', filters.tournament_type)
    }
    if (filters.level) {
      tournamentQuery = tournamentQuery.ilike('level', `%${filters.level}%`)
    }

    const { data: tournaments, error: tournamentsError } = await tournamentQuery.limit(50)

    if (tournamentsError) {
      return { error: tournamentsError.message }
    }

    // Score and rank tournaments
    const recommendations: TournamentRecommendation[] = []

    for (const t of tournaments || []) {
      const tournamentData = t as Record<string, unknown>
      const tournament: TournamentForScoring = {
        id: tournamentData.id as string,
        name: tournamentData.name as string,
        category: tournamentData.category as string | undefined,
        level: tournamentData.level as string | undefined,
        tournament_type: tournamentData.tournament_type as string | undefined,
        location: tournamentData.location as string | undefined,
        start_date: tournamentData.start_date as string,
        end_date: tournamentData.end_date as string | undefined,
        entry_deadline: tournamentData.entry_deadline as string | undefined,
      }

      const score = calculateTournamentScore(player, tournament, availabilities)
      const explanation = generateExplanation(player, tournament, score)

      recommendations.push({
        tournament: {
          ...tournament,
          description: tournamentData.description as string | undefined,
          website_url: tournamentData.website_url as string | undefined,
        },
        score,
        explanation,
      })
    }

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.score.totalScore - a.score.totalScore)

    // Apply limit
    const limit = filters.limit || 10
    const limitedRecommendations = recommendations.slice(0, limit)

    return {
      result: {
        player: {
          id: player.id,
          name: player.name,
          category: player.category,
          utr_rating: player.utr_rating,
        },
        recommendations: limitedRecommendations,
        totalMatches: recommendations.length,
        filters,
      },
      isGuestData: false,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to generate recommendations',
    }
  }
}

/**
 * Get a quick recommendation summary for the agent
 */
export async function getRecommendationSummary(
  playerId: string | undefined,
  playerName: string | undefined,
  maxResults: number = 5
): Promise<{ result: unknown; isError: boolean }> {
  const response = await getRecommendations(playerId, playerName, { limit: maxResults })

  if ('error' in response) {
    return { result: { error: response.error }, isError: true }
  }

  const { result, isGuestData } = response

  return {
    result: {
      player: result.player,
      topRecommendations: result.recommendations.map(rec => ({
        tournament: {
          id: rec.tournament.id,
          name: rec.tournament.name,
          category: rec.tournament.category,
          level: rec.tournament.level,
          location: rec.tournament.location,
          start_date: rec.tournament.start_date,
          end_date: rec.tournament.end_date,
        },
        score: rec.score.totalScore,
        recommendation: rec.score.recommendation,
        explanation: rec.explanation,
      })),
      totalMatches: result.totalMatches,
      isGuestData,
    },
    isError: false,
  }
}
