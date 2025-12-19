// Demo UTR player data for matchup generation

export type TimeSlot = 'morning' | 'afternoon' | 'any'
export type Surface = 'hard' | 'clay' | 'grass' | 'any'
export type PlayDirection = 'up' | 'down' | 'equal' | 'any'
export type MatchStatus = 'pending' | 'locked' | 'rejected'

export interface UTRPlayer {
  id: string
  name: string
  utr: number
  age: number
  preferredSurface: Surface
  available: boolean
  recentOpponents: string[] // IDs of players faced in last week
  leadCoach: string
  // Player constraints
  timeSlot: TimeSlot
  surfaceConstraint: Surface
}

export interface GeneratedMatchup {
  id: string
  player1: UTRPlayer
  player2: UTRPlayer
  utrDifference: number
  quality: 'excellent' | 'good' | 'stretch' | 'mismatch'
  qualityColor: string
  notes: string
  court: string
  timeSlot: TimeSlot
  surface: Surface
  assignedCoach: string
  status: MatchStatus
  isRecentMatch: boolean // Played last week
  player1Direction: PlayDirection // Whether player1 is playing up/down
  player2Direction: PlayDirection
}

export interface ScheduleOption {
  id: string
  matchups: GeneratedMatchup[]
  unmatchedPlayers: UTRPlayer[]
  score: number // 0-100
  scoreLabel: 'poor' | 'ok' | 'good' | 'excellent'
  scoreColor: string
  breakdown: {
    utrBalance: number
    coachCoverage: number
    surfaceMatch: number
    timeMatch: number
    recentAvoidance: number
  }
}

// Demo coaches
export const coaches = [
  { id: 'sergio', name: 'Sergio', specialty: 'High Performance' },
  { id: 'marcus', name: 'Marcus', specialty: 'Development' },
  { id: 'elena', name: 'Elena', specialty: 'Strategy' },
  { id: 'dave', name: 'Dave', specialty: 'Conditioning' },
]

// Available courts
export const courts = [
  { id: 'court-1', name: 'Court 1', surface: 'hard' as Surface },
  { id: 'court-2', name: 'Court 2', surface: 'hard' as Surface },
  { id: 'court-3', name: 'Court 3', surface: 'clay' as Surface },
  { id: 'court-4', name: 'Court 4', surface: 'clay' as Surface },
]

// Demo players based on UTR Friday Matchups data
export const demoUTRPlayers: UTRPlayer[] = [
  { id: 'jason', name: 'Jason', utr: 11.2, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['oaklee', 'austin_m'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'harley', name: 'Harley', utr: 10.8, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['oaklee', 'maciej'], leadCoach: 'sergio', timeSlot: 'morning', surfaceConstraint: 'hard' },
  { id: 'mati', name: 'Mati', utr: 10.5, age: 17, preferredSurface: 'clay', available: true, recentOpponents: ['jac'], leadCoach: 'marcus', timeSlot: 'any', surfaceConstraint: 'clay' },
  { id: 'adhrit', name: 'Adhrit', utr: 10.1, age: 14, preferredSurface: 'hard', available: true, recentOpponents: ['caye', 'maciej', 'levi'], leadCoach: 'elena', timeSlot: 'afternoon', surfaceConstraint: 'any' },
  { id: 'lloyd', name: 'Lloyd', utr: 9.9, age: 16, preferredSurface: 'any', available: false, recentOpponents: [], leadCoach: 'marcus', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'maddie', name: 'Maddie', utr: 8.34, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['nikolai', 'till'], leadCoach: 'elena', timeSlot: 'morning', surfaceConstraint: 'hard' },
  { id: 'oaklee', name: 'Oaklee', utr: 10.9, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['toto', 'anna_iris', 'jason'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'hard' },
  { id: 'oscar', name: 'Oscar', utr: 9.2, age: 14, preferredSurface: 'clay', available: true, recentOpponents: ['nikolai', 'sofia_r'], leadCoach: 'dave', timeSlot: 'afternoon', surfaceConstraint: 'clay' },
  { id: 'matthew_k', name: 'Matthew K', utr: 9.6, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['zeph', 'jac', 'nikolai'], leadCoach: 'marcus', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'marco', name: 'Marco', utr: 9.4, age: 16, preferredSurface: 'clay', available: true, recentOpponents: ['bienvenue', 'michael_c'], leadCoach: 'dave', timeSlot: 'morning', surfaceConstraint: 'clay' },
  { id: 'till', name: 'Till', utr: 8.7, age: 14, preferredSurface: 'hard', available: true, recentOpponents: ['billy_od', 'maddie', 'levi'], leadCoach: 'elena', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'caye', name: 'Caye', utr: 10.0, age: 15, preferredSurface: 'clay', available: true, recentOpponents: ['adhrit', 'manuel', 'levi'], leadCoach: 'marcus', timeSlot: 'afternoon', surfaceConstraint: 'any' },
  { id: 'jac', name: 'Jac', utr: 9.12, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['mati', 'reece', 'luke_sev'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'hard' },
  { id: 'nikolai', name: 'Nikolai', utr: 10.45, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['maddie', 'luke_sev', 'oscar'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'otis', name: 'Otis', utr: 8.3, age: 14, preferredSurface: 'hard', available: true, recentOpponents: ['samraaj', 'norman', 'levin'], leadCoach: 'dave', timeSlot: 'morning', surfaceConstraint: 'hard' },
  { id: 'ollie', name: 'Ollie', utr: 7.9, age: 13, preferredSurface: 'any', available: true, recentOpponents: ['norman', 'levin'], leadCoach: 'elena', timeSlot: 'afternoon', surfaceConstraint: 'any' },
  { id: 'levin', name: 'Levin', utr: 7.6, age: 13, preferredSurface: 'hard', available: true, recentOpponents: ['sophia', 'ollie', 'norman'], leadCoach: 'elena', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'sophia', name: 'Sophia', utr: 7.4, age: 14, preferredSurface: 'clay', available: true, recentOpponents: ['levin', 'victoria'], leadCoach: 'marcus', timeSlot: 'morning', surfaceConstraint: 'clay' },
  { id: 'tom_l', name: 'Tom L', utr: 8.8, age: 15, preferredSurface: 'hard', available: false, recentOpponents: ['zen'], leadCoach: 'dave', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'samraaj', name: 'Samraaj', utr: 8.1, age: 14, preferredSurface: 'hard', available: true, recentOpponents: ['otis', 'mario', 'norman'], leadCoach: 'dave', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'mario', name: 'Mario', utr: 8.5, age: 15, preferredSurface: 'clay', available: true, recentOpponents: ['maciej', 'levin', 'samraaj'], leadCoach: 'marcus', timeSlot: 'afternoon', surfaceConstraint: 'clay' },
  { id: 'norman', name: 'Norman', utr: 7.8, age: 13, preferredSurface: 'hard', available: true, recentOpponents: ['ollie', 'otis', 'levin'], leadCoach: 'elena', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'luke_sev', name: 'Luke Sev', utr: 9.8, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['nikolai', 'michael_c', 'seb_m'], leadCoach: 'sergio', timeSlot: 'morning', surfaceConstraint: 'hard' },
  { id: 'maciej', name: 'Maciej', utr: 11.0, age: 17, preferredSurface: 'hard', available: true, recentOpponents: ['mario', 'austin_m', 'harley'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'manuel', name: 'Manuel', utr: 9.3, age: 15, preferredSurface: 'clay', available: false, recentOpponents: ['caye'], leadCoach: 'marcus', timeSlot: 'any', surfaceConstraint: 'clay' },
  { id: 'michael_c', name: 'Michael C', utr: 9.5, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['luke_sev', 'levi', 'marco'], leadCoach: 'dave', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'levi', name: 'Levi', utr: 9.7, age: 15, preferredSurface: 'clay', available: true, recentOpponents: ['adhrit', 'michael_c', 'caye'], leadCoach: 'marcus', timeSlot: 'afternoon', surfaceConstraint: 'any' },
  { id: 'sofia_r', name: 'Sofia R', utr: 8.9, age: 14, preferredSurface: 'clay', available: true, recentOpponents: ['oscar'], leadCoach: 'elena', timeSlot: 'any', surfaceConstraint: 'clay' },
  { id: 'seb_m', name: 'Seb M', utr: 9.4, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['luke_sev', 'nikolai', 'jac'], leadCoach: 'dave', timeSlot: 'morning', surfaceConstraint: 'any' },
  { id: 'austin_m', name: 'Austin M', utr: 10.6, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['maciej', 'angus'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'hard' },
  { id: 'victoria', name: 'Victoria', utr: 7.2, age: 14, preferredSurface: 'hard', available: true, recentOpponents: ['sophia', 'samraaj'], leadCoach: 'elena', timeSlot: 'afternoon', surfaceConstraint: 'any' },
  { id: 'anna_iris', name: 'Anna Iris', utr: 10.3, age: 15, preferredSurface: 'clay', available: true, recentOpponents: ['oaklee', 'toto', 'levi'], leadCoach: 'marcus', timeSlot: 'any', surfaceConstraint: 'clay' },
  { id: 'billy_c', name: 'Billy C', utr: 9.1, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['matthew_k'], leadCoach: 'dave', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'luke_brady', name: 'Luke Brady', utr: 9.0, age: 15, preferredSurface: 'hard', available: true, recentOpponents: ['luke_s'], leadCoach: 'marcus', timeSlot: 'morning', surfaceConstraint: 'hard' },
  { id: 'lewis_h', name: 'Lewis Hopkins', utr: 10.4, age: 16, preferredSurface: 'hard', available: true, recentOpponents: ['otis'], leadCoach: 'sergio', timeSlot: 'any', surfaceConstraint: 'any' },
  { id: 'zofia', name: 'Zofia Sowa', utr: 7.5, age: 13, preferredSurface: 'clay', available: true, recentOpponents: ['grayson'], leadCoach: 'elena', timeSlot: 'afternoon', surfaceConstraint: 'clay' },
]

// Determine play direction based on UTR comparison
export function getPlayDirection(playerUtr: number, opponentUtr: number): PlayDirection {
  const diff = opponentUtr - playerUtr
  if (diff > 0.3) return 'up'
  if (diff < -0.3) return 'down'
  return 'equal'
}

// Get color class for play direction
export function getDirectionColor(direction: PlayDirection): string {
  switch (direction) {
    case 'up': return 'text-red-600 bg-red-50'
    case 'down': return 'text-green-600 bg-green-50'
    case 'equal': return 'text-green-600 bg-green-50'
    default: return 'text-stone-500 bg-stone-50'
  }
}

// Get quality rating based on UTR difference
export function getMatchupQuality(utrDiff: number): { quality: GeneratedMatchup['quality']; color: string } {
  const absDiff = Math.abs(utrDiff)
  if (absDiff <= 0.25) {
    return { quality: 'excellent', color: 'bg-green-100 text-green-800 border-green-200' }
  } else if (absDiff <= 0.5) {
    return { quality: 'good', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  } else if (absDiff <= 1.0) {
    return { quality: 'stretch', color: 'bg-orange-100 text-orange-800 border-orange-200' }
  } else {
    return { quality: 'mismatch', color: 'bg-red-100 text-red-800 border-red-200' }
  }
}

// Generate matchup notes
function generateNotes(player1: UTRPlayer, player2: UTRPlayer, quality: GeneratedMatchup['quality']): string {
  const notes: string[] = []

  if (quality === 'excellent') {
    notes.push('Great competitive match')
  } else if (quality === 'good') {
    notes.push('Good balanced match')
  } else if (quality === 'stretch') {
    notes.push('Development opportunity')
  } else {
    notes.push('Significant skill gap')
  }

  return notes.join(' | ')
}

// Check if time slots are compatible
function areTimeSlotsCompatible(slot1: TimeSlot, slot2: TimeSlot): boolean {
  if (slot1 === 'any' || slot2 === 'any') return true
  return slot1 === slot2
}

// Check if surfaces are compatible
function areSurfacesCompatible(surface1: Surface, surface2: Surface): boolean {
  if (surface1 === 'any' || surface2 === 'any') return true
  return surface1 === surface2
}

// Get compatible surface for two players
function getCompatibleSurface(player1: UTRPlayer, player2: UTRPlayer): Surface {
  if (player1.surfaceConstraint !== 'any') return player1.surfaceConstraint
  if (player2.surfaceConstraint !== 'any') return player2.surfaceConstraint
  if (player1.preferredSurface !== 'any') return player1.preferredSurface
  if (player2.preferredSurface !== 'any') return player2.preferredSurface
  return 'hard' // Default
}

// Get compatible time slot
function getCompatibleTimeSlot(player1: UTRPlayer, player2: UTRPlayer): TimeSlot {
  if (player1.timeSlot !== 'any') return player1.timeSlot
  if (player2.timeSlot !== 'any') return player2.timeSlot
  return 'morning' // Default
}

// Get assigned court based on surface
function getAssignedCourt(surface: Surface): string {
  const matchingCourts = courts.filter(c => c.surface === surface)
  return matchingCourts.length > 0 ? matchingCourts[0].name : 'Court 1'
}

// Get assigned coach (prefer lead coach of higher UTR player)
function getAssignedCoach(player1: UTRPlayer, player2: UTRPlayer): string {
  const higherPlayer = player1.utr >= player2.utr ? player1 : player2
  const coach = coaches.find(c => c.id === higherPlayer.leadCoach)
  return coach?.name || 'TBD'
}

// Calculate optimization score for a set of matchups
function calculateScheduleScore(matchups: GeneratedMatchup[], players: UTRPlayer[]): {
  score: number
  breakdown: ScheduleOption['breakdown']
} {
  if (matchups.length === 0) {
    return { score: 0, breakdown: { utrBalance: 0, coachCoverage: 0, surfaceMatch: 0, timeMatch: 0, recentAvoidance: 0 } }
  }

  let utrBalance = 0
  let coachCoverage = 0
  let surfaceMatch = 0
  let timeMatch = 0
  let recentAvoidance = 0

  for (const matchup of matchups) {
    // UTR Balance (closer = better)
    const absDiff = Math.abs(matchup.utrDifference)
    if (absDiff <= 0.25) utrBalance += 100
    else if (absDiff <= 0.5) utrBalance += 75
    else if (absDiff <= 1.0) utrBalance += 50
    else utrBalance += 25

    // Coach coverage (lead coach watching = better)
    const leadCoach1 = coaches.find(c => c.id === matchup.player1.leadCoach)?.name
    const leadCoach2 = coaches.find(c => c.id === matchup.player2.leadCoach)?.name
    if (matchup.assignedCoach === leadCoach1 || matchup.assignedCoach === leadCoach2) {
      coachCoverage += 100
    } else {
      coachCoverage += 50
    }

    // Surface match (player gets preferred surface)
    if (matchup.surface === matchup.player1.preferredSurface || matchup.surface === matchup.player2.preferredSurface) {
      surfaceMatch += 100
    } else {
      surfaceMatch += 70
    }

    // Time match (constraints met)
    if (
      (matchup.player1.timeSlot === 'any' || matchup.player1.timeSlot === matchup.timeSlot) &&
      (matchup.player2.timeSlot === 'any' || matchup.player2.timeSlot === matchup.timeSlot)
    ) {
      timeMatch += 100
    } else {
      timeMatch += 50
    }

    // Recent avoidance (not recent match = better)
    if (!matchup.isRecentMatch) {
      recentAvoidance += 100
    } else {
      recentAvoidance += 30
    }
  }

  const count = matchups.length
  const breakdown = {
    utrBalance: Math.round(utrBalance / count),
    coachCoverage: Math.round(coachCoverage / count),
    surfaceMatch: Math.round(surfaceMatch / count),
    timeMatch: Math.round(timeMatch / count),
    recentAvoidance: Math.round(recentAvoidance / count),
  }

  const score = Math.round(
    (breakdown.utrBalance * 0.35) +
    (breakdown.coachCoverage * 0.15) +
    (breakdown.surfaceMatch * 0.15) +
    (breakdown.timeMatch * 0.15) +
    (breakdown.recentAvoidance * 0.20)
  )

  return { score, breakdown }
}

// Get score label and color
function getScoreLabel(score: number): { label: ScheduleOption['scoreLabel']; color: string } {
  if (score >= 85) return { label: 'excellent', color: 'bg-green-500' }
  if (score >= 70) return { label: 'good', color: 'bg-blue-500' }
  if (score >= 50) return { label: 'ok', color: 'bg-orange-500' }
  return { label: 'poor', color: 'bg-red-500' }
}

// Main matchup generation algorithm - generates multiple schedule options
export function generateScheduleOptions(
  players: UTRPlayer[],
  numOptions: number = 3
): ScheduleOption[] {
  const availablePlayers = players.filter(p => p.available)
  const options: ScheduleOption[] = []

  // Generate multiple schedule variations
  for (let optionIdx = 0; optionIdx < numOptions; optionIdx++) {
    const sorted = [...availablePlayers].sort((a, b) => {
      // Add some randomization to get different matchups
      const randomFactor = optionIdx === 0 ? 0 : (Math.random() - 0.5) * 0.3
      return (b.utr + randomFactor) - (a.utr + randomFactor)
    })

    const matched = new Set<string>()
    const matchups: GeneratedMatchup[] = []
    let courtIndex = 0

    for (const player of sorted) {
      if (matched.has(player.id)) continue

      let bestOpponent: UTRPlayer | null = null
      let bestScore = -Infinity

      for (const opponent of sorted) {
        if (opponent.id === player.id || matched.has(opponent.id)) continue

        // Check time slot compatibility
        if (!areTimeSlotsCompatible(player.timeSlot, opponent.timeSlot)) continue

        // Check surface compatibility
        if (!areSurfacesCompatible(player.surfaceConstraint, opponent.surfaceConstraint)) continue

        const utrDiff = Math.abs(player.utr - opponent.utr)

        // Calculate score
        let score = 100 - (utrDiff * 50)

        // Prefer avoiding recent opponents
        if (player.recentOpponents.includes(opponent.id)) {
          score -= 30
        }

        // Prefer similar ages
        const ageDiff = Math.abs(player.age - opponent.age)
        score -= ageDiff * 2

        if (score > bestScore) {
          bestScore = score
          bestOpponent = opponent
        }
      }

      if (bestOpponent) {
        const utrDifference = player.utr - bestOpponent.utr
        const { quality, color } = getMatchupQuality(utrDifference)
        const surface = getCompatibleSurface(player, bestOpponent)
        const timeSlot = getCompatibleTimeSlot(player, bestOpponent)
        const isRecentMatch = player.recentOpponents.includes(bestOpponent.id)

        matchups.push({
          id: `match-${optionIdx}-${matchups.length}`,
          player1: player,
          player2: bestOpponent,
          utrDifference,
          quality,
          qualityColor: color,
          notes: generateNotes(player, bestOpponent, quality),
          court: courts[courtIndex % courts.length].name,
          timeSlot,
          surface,
          assignedCoach: getAssignedCoach(player, bestOpponent),
          status: 'pending',
          isRecentMatch,
          player1Direction: getPlayDirection(player.utr, bestOpponent.utr),
          player2Direction: getPlayDirection(bestOpponent.utr, player.utr),
        })

        matched.add(player.id)
        matched.add(bestOpponent.id)
        courtIndex++
      }
    }

    const unmatched = availablePlayers.filter(p => !matched.has(p.id))
    const { score, breakdown } = calculateScheduleScore(matchups, availablePlayers)
    const { label, color } = getScoreLabel(score)

    options.push({
      id: `schedule-${optionIdx}`,
      matchups,
      unmatchedPlayers: unmatched,
      score,
      scoreLabel: label,
      scoreColor: color,
      breakdown,
    })
  }

  // Sort by score descending
  options.sort((a, b) => b.score - a.score)

  return options
}

// Toggle player availability
export function togglePlayerAvailability(playerId: string, players: UTRPlayer[]): UTRPlayer[] {
  return players.map(p =>
    p.id === playerId ? { ...p, available: !p.available } : p
  )
}

// Update player constraint
export function updatePlayerConstraint(
  playerId: string,
  players: UTRPlayer[],
  field: 'timeSlot' | 'surfaceConstraint',
  value: TimeSlot | Surface
): UTRPlayer[] {
  return players.map(p =>
    p.id === playerId ? { ...p, [field]: value } : p
  )
}
