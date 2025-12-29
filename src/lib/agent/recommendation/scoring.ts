/**
 * Tournament Scoring Algorithm
 *
 * Calculates a recommendation score for a tournament based on player profile.
 * Score range: 0-100 points
 */

// ============================================
// Types
// ============================================

export interface PlayerProfile {
  id: string
  name: string
  category: string // U12, U14, U16, U18, Adults
  utr_rating?: number
  birthDate?: string
  coach_id?: string
}

export interface TournamentForScoring {
  id: string
  name: string
  category?: string
  level?: string // Grade 1-5, ITF, Tennis Europe
  tournament_type?: string // proximity, national, international
  location?: string
  start_date: string
  end_date?: string
  entry_deadline?: string
}

export interface PlayerAvailability {
  start_date: string
  end_date: string
  availability_type: 'available' | 'tentative' | 'unavailable'
}

export interface ScoreBreakdown {
  totalScore: number
  factors: {
    categoryMatch: { score: number; maxScore: number; description: string }
    levelMatch: { score: number; maxScore: number; description: string }
    travelDistance: { score: number; maxScore: number; description: string }
    availability: { score: number; maxScore: number; description: string }
    entryDeadline: { score: number; maxScore: number; description: string }
    prestige: { score: number; maxScore: number; description: string }
  }
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended'
}

// ============================================
// Score Weights (total = 100)
// ============================================

const WEIGHTS = {
  categoryMatch: 25,   // Age category appropriateness
  levelMatch: 25,      // Skill level vs tournament level
  travelDistance: 20,  // Proximity vs national vs international
  availability: 15,    // Player availability during tournament
  entryDeadline: 10,   // Time until entry deadline
  prestige: 5,         // Tournament prestige/importance
}

// ============================================
// Category Scoring
// ============================================

const CATEGORY_ORDER = ['U12', 'U14', 'U16', 'U18', 'Adults']

function getCategoryIndex(category: string): number {
  const normalized = category.toUpperCase().replace(/\s+/g, '')
  const index = CATEGORY_ORDER.findIndex(c => normalized.includes(c.replace('U', '')))
  return index >= 0 ? index : CATEGORY_ORDER.length - 1 // Default to Adults
}

export function scoreCategoryMatch(
  playerCategory: string,
  tournamentCategory?: string
): { score: number; description: string } {
  if (!tournamentCategory) {
    return { score: WEIGHTS.categoryMatch * 0.5, description: 'Open category tournament' }
  }

  const playerIdx = getCategoryIndex(playerCategory)
  const tournamentIdx = getCategoryIndex(tournamentCategory)
  const diff = Math.abs(playerIdx - tournamentIdx)

  if (diff === 0) {
    return { score: WEIGHTS.categoryMatch, description: 'Exact category match' }
  } else if (diff === 1) {
    return { score: WEIGHTS.categoryMatch * 0.6, description: 'Adjacent category (challenging or easier)' }
  } else {
    return { score: WEIGHTS.categoryMatch * 0.2, description: 'Category mismatch' }
  }
}

// ============================================
// Level/Skill Scoring
// ============================================

const LEVEL_DIFFICULTY: Record<string, number> = {
  'Grade 5': 1,
  'Grade 4': 2,
  'Grade 3': 3,
  'Grade 2': 4,
  'Grade 1': 5,
  'Tennis Europe': 6,
  'TE': 6,
  'ITF': 7,
}

function getLevelDifficulty(level: string): number {
  for (const [key, value] of Object.entries(LEVEL_DIFFICULTY)) {
    if (level.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  return 3 // Default to Grade 3 (medium)
}

export function scoreLevelMatch(
  playerUTR: number | undefined,
  tournamentLevel?: string
): { score: number; description: string } {
  if (!tournamentLevel) {
    return { score: WEIGHTS.levelMatch * 0.5, description: 'Tournament level not specified' }
  }

  const levelDifficulty = getLevelDifficulty(tournamentLevel)

  // Map UTR to recommended level difficulty
  // UTR 1-4: Grade 5, UTR 4-6: Grade 4, UTR 6-8: Grade 3, etc.
  let recommendedDifficulty = 3
  if (playerUTR) {
    if (playerUTR < 4) recommendedDifficulty = 1
    else if (playerUTR < 6) recommendedDifficulty = 2
    else if (playerUTR < 8) recommendedDifficulty = 3
    else if (playerUTR < 10) recommendedDifficulty = 4
    else if (playerUTR < 12) recommendedDifficulty = 5
    else recommendedDifficulty = 6
  }

  const diff = Math.abs(levelDifficulty - recommendedDifficulty)

  if (diff === 0) {
    return { score: WEIGHTS.levelMatch, description: 'Perfect level match for UTR rating' }
  } else if (diff === 1) {
    return { score: WEIGHTS.levelMatch * 0.75, description: 'Slightly challenging or easier level' }
  } else if (diff === 2) {
    return { score: WEIGHTS.levelMatch * 0.5, description: 'Level may be too hard or too easy' }
  } else {
    return { score: WEIGHTS.levelMatch * 0.25, description: 'Level mismatch with player skill' }
  }
}

// ============================================
// Travel Distance Scoring
// ============================================

export function scoreTravelDistance(
  tournamentType?: string
): { score: number; description: string } {
  const type = tournamentType?.toLowerCase()

  if (type === 'proximity' || type === 'local') {
    return { score: WEIGHTS.travelDistance, description: 'Local tournament - minimal travel' }
  } else if (type === 'national') {
    return { score: WEIGHTS.travelDistance * 0.6, description: 'National tournament - moderate travel' }
  } else if (type === 'international') {
    return { score: WEIGHTS.travelDistance * 0.3, description: 'International tournament - significant travel' }
  }

  // Default to national if not specified
  return { score: WEIGHTS.travelDistance * 0.5, description: 'Travel distance unknown' }
}

// ============================================
// Availability Scoring
// ============================================

export function scoreAvailability(
  tournamentStartDate: string,
  tournamentEndDate: string | undefined,
  playerAvailabilities: PlayerAvailability[]
): { score: number; description: string } {
  const start = new Date(tournamentStartDate)
  const end = tournamentEndDate ? new Date(tournamentEndDate) : start

  // Check if any availability covers the tournament dates
  for (const avail of playerAvailabilities) {
    const availStart = new Date(avail.start_date)
    const availEnd = new Date(avail.end_date)

    // Check overlap
    if (start >= availStart && end <= availEnd) {
      if (avail.availability_type === 'available') {
        return { score: WEIGHTS.availability, description: 'Player fully available' }
      } else if (avail.availability_type === 'tentative') {
        return { score: WEIGHTS.availability * 0.5, description: 'Player tentatively available' }
      } else {
        return { score: 0, description: 'Player unavailable during tournament' }
      }
    }

    // Partial overlap
    if ((start <= availEnd && end >= availStart)) {
      if (avail.availability_type === 'unavailable') {
        return { score: WEIGHTS.availability * 0.25, description: 'Scheduling conflict' }
      }
    }
  }

  // No availability info - assume available
  return { score: WEIGHTS.availability * 0.75, description: 'Availability not specified' }
}

// ============================================
// Entry Deadline Scoring
// ============================================

export function scoreEntryDeadline(
  entryDeadline?: string
): { score: number; description: string } {
  if (!entryDeadline) {
    return { score: WEIGHTS.entryDeadline * 0.5, description: 'Entry deadline not specified' }
  }

  const now = new Date()
  const deadline = new Date(entryDeadline)
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilDeadline < 0) {
    return { score: 0, description: 'Entry deadline has passed' }
  } else if (daysUntilDeadline < 3) {
    return { score: WEIGHTS.entryDeadline * 0.3, description: 'Entry deadline very soon (< 3 days)' }
  } else if (daysUntilDeadline < 7) {
    return { score: WEIGHTS.entryDeadline * 0.6, description: 'Entry deadline approaching (< 1 week)' }
  } else if (daysUntilDeadline < 14) {
    return { score: WEIGHTS.entryDeadline * 0.8, description: 'Good time to enter (1-2 weeks)' }
  } else {
    return { score: WEIGHTS.entryDeadline, description: 'Plenty of time to enter (> 2 weeks)' }
  }
}

// ============================================
// Prestige Scoring
// ============================================

export function scorePrestige(
  level?: string,
  tournamentType?: string
): { score: number; description: string } {
  let prestigeScore = WEIGHTS.prestige * 0.5

  // Higher level = more prestige
  if (level) {
    const difficulty = getLevelDifficulty(level)
    prestigeScore = WEIGHTS.prestige * (difficulty / 7)
  }

  // International tournaments have more prestige
  if (tournamentType?.toLowerCase() === 'international') {
    prestigeScore = Math.min(WEIGHTS.prestige, prestigeScore * 1.3)
  }

  const description = prestigeScore > WEIGHTS.prestige * 0.7
    ? 'High prestige tournament'
    : prestigeScore > WEIGHTS.prestige * 0.4
      ? 'Moderate prestige'
      : 'Entry-level tournament'

  return { score: Math.round(prestigeScore * 10) / 10, description }
}

// ============================================
// Main Scoring Function
// ============================================

export function calculateTournamentScore(
  player: PlayerProfile,
  tournament: TournamentForScoring,
  availabilities: PlayerAvailability[] = []
): ScoreBreakdown {
  const categoryResult = scoreCategoryMatch(player.category, tournament.category)
  const levelResult = scoreLevelMatch(player.utr_rating, tournament.level)
  const travelResult = scoreTravelDistance(tournament.tournament_type)
  const availabilityResult = scoreAvailability(
    tournament.start_date,
    tournament.end_date,
    availabilities
  )
  const deadlineResult = scoreEntryDeadline(tournament.entry_deadline)
  const prestigeResult = scorePrestige(tournament.level, tournament.tournament_type)

  const totalScore = Math.round(
    categoryResult.score +
    levelResult.score +
    travelResult.score +
    availabilityResult.score +
    deadlineResult.score +
    prestigeResult.score
  )

  // Determine recommendation level
  let recommendation: ScoreBreakdown['recommendation']
  if (totalScore >= 80) {
    recommendation = 'highly_recommended'
  } else if (totalScore >= 60) {
    recommendation = 'recommended'
  } else if (totalScore >= 40) {
    recommendation = 'consider'
  } else {
    recommendation = 'not_recommended'
  }

  return {
    totalScore,
    factors: {
      categoryMatch: {
        score: categoryResult.score,
        maxScore: WEIGHTS.categoryMatch,
        description: categoryResult.description,
      },
      levelMatch: {
        score: levelResult.score,
        maxScore: WEIGHTS.levelMatch,
        description: levelResult.description,
      },
      travelDistance: {
        score: travelResult.score,
        maxScore: WEIGHTS.travelDistance,
        description: travelResult.description,
      },
      availability: {
        score: availabilityResult.score,
        maxScore: WEIGHTS.availability,
        description: availabilityResult.description,
      },
      entryDeadline: {
        score: deadlineResult.score,
        maxScore: WEIGHTS.entryDeadline,
        description: deadlineResult.description,
      },
      prestige: {
        score: prestigeResult.score,
        maxScore: WEIGHTS.prestige,
        description: prestigeResult.description,
      },
    },
    recommendation,
  }
}
