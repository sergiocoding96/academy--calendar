// Demo season statistics data (PA Report style)

export interface TermStats {
  term: string
  startDate: string
  endDate: string
  matchesPlayed: number
  wins: number
  losses: number
  winPercentage: number
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
}

export interface SurfaceStats {
  surface: 'hard' | 'clay' | 'grass' | 'indoor'
  matchesPlayed: number
  wins: number
  losses: number
  winPercentage: number
}

export interface TournamentResult {
  name: string
  date: string
  surface: 'hard' | 'clay' | 'grass' | 'indoor'
  result: string
  roundReached: string
  points: number
}

export interface MonthlyPerformance {
  month: string
  year: number
  matchesPlayed: number
  wins: number
  losses: number
  winPercentage: number
}

export interface OpponentLevelStats {
  level: 'higher_ranked' | 'similar_ranked' | 'lower_ranked'
  label: string
  matchesPlayed: number
  wins: number
  losses: number
  winPercentage: number
}

export interface SeasonOverview {
  playerId: string
  playerName: string
  currentUTR: number
  seasonStartUTR: number
  utrChange: number
  termStats: TermStats[]
  surfaceStats: SurfaceStats[]
  tournaments: TournamentResult[]
  monthlyPerformance: MonthlyPerformance[]
  opponentLevelStats: OpponentLevelStats[]
  highlights: string[]
  areasToImprove: string[]
}

// Demo data based on PA Report patterns (Nikolai Tingstad style)
export const demoSeasonData: SeasonOverview[] = [
  {
    playerId: 'nikolai',
    playerName: 'Nikolai Tingstad',
    currentUTR: 10.45,
    seasonStartUTR: 9.82,
    utrChange: 0.63,
    termStats: [
      {
        term: 'Autumn Term 1',
        startDate: '2025-09-01',
        endDate: '2025-10-18',
        matchesPlayed: 12,
        wins: 9,
        losses: 3,
        winPercentage: 75,
        setsWon: 19,
        setsLost: 8,
        gamesWon: 142,
        gamesLost: 98,
      },
      {
        term: 'Autumn Term 2',
        startDate: '2025-10-28',
        endDate: '2025-12-13',
        matchesPlayed: 8,
        wins: 5,
        losses: 3,
        winPercentage: 62.5,
        setsWon: 12,
        setsLost: 7,
        gamesWon: 89,
        gamesLost: 72,
      },
    ],
    surfaceStats: [
      { surface: 'hard', matchesPlayed: 14, wins: 10, losses: 4, winPercentage: 71 },
      { surface: 'clay', matchesPlayed: 4, wins: 3, losses: 1, winPercentage: 75 },
      { surface: 'indoor', matchesPlayed: 2, wins: 1, losses: 1, winPercentage: 50 },
      { surface: 'grass', matchesPlayed: 0, wins: 0, losses: 0, winPercentage: 0 },
    ],
    tournaments: [
      { name: 'J3 Manchester', date: '2025-09-15', surface: 'hard', result: 'QF', roundReached: 'Quarter-finals', points: 15 },
      { name: 'Grade 3 Liverpool', date: '2025-09-28', surface: 'hard', result: 'SF', roundReached: 'Semi-finals', points: 25 },
      { name: 'J4 Bath', date: '2025-10-12', surface: 'clay', result: 'W', roundReached: 'Winner', points: 50 },
      { name: 'J3 Bristol', date: '2025-11-02', surface: 'hard', result: 'R16', roundReached: 'Round of 16', points: 8 },
      { name: 'Grade 2 London', date: '2025-11-16', surface: 'indoor', result: 'QF', roundReached: 'Quarter-finals', points: 20 },
    ],
    monthlyPerformance: [
      { month: 'September', year: 2025, matchesPlayed: 8, wins: 6, losses: 2, winPercentage: 75 },
      { month: 'October', year: 2025, matchesPlayed: 6, wins: 5, losses: 1, winPercentage: 83 },
      { month: 'November', year: 2025, matchesPlayed: 5, wins: 3, losses: 2, winPercentage: 60 },
      { month: 'December', year: 2025, matchesPlayed: 1, wins: 0, losses: 1, winPercentage: 0 },
    ],
    opponentLevelStats: [
      { level: 'higher_ranked', label: 'Higher Ranked (+0.5 UTR)', matchesPlayed: 6, wins: 2, losses: 4, winPercentage: 33 },
      { level: 'similar_ranked', label: 'Similar Ranked (±0.5 UTR)', matchesPlayed: 10, wins: 8, losses: 2, winPercentage: 80 },
      { level: 'lower_ranked', label: 'Lower Ranked (-0.5 UTR)', matchesPlayed: 4, wins: 4, losses: 0, winPercentage: 100 },
    ],
    highlights: [
      'Won J4 Bath tournament - first title of the season',
      'UTR improved from 9.82 to 10.45 (+0.63)',
      '75% win rate in Autumn Term 1',
      'Strong clay court record (75% wins)',
    ],
    areasToImprove: [
      'Performance against higher-ranked opponents (33% win rate)',
      'Indoor court adaptation needed',
      'Consistency in December declined',
    ],
  },
  {
    playerId: 'jac',
    playerName: 'Jac Leonard',
    currentUTR: 9.12,
    seasonStartUTR: 8.65,
    utrChange: 0.47,
    termStats: [
      {
        term: 'Autumn Term 1',
        startDate: '2025-09-01',
        endDate: '2025-10-18',
        matchesPlayed: 10,
        wins: 6,
        losses: 4,
        winPercentage: 60,
        setsWon: 14,
        setsLost: 10,
        gamesWon: 108,
        gamesLost: 92,
      },
      {
        term: 'Autumn Term 2',
        startDate: '2025-10-28',
        endDate: '2025-12-13',
        matchesPlayed: 7,
        wins: 4,
        losses: 3,
        winPercentage: 57,
        setsWon: 9,
        setsLost: 7,
        gamesWon: 68,
        gamesLost: 58,
      },
    ],
    surfaceStats: [
      { surface: 'hard', matchesPlayed: 12, wins: 7, losses: 5, winPercentage: 58 },
      { surface: 'clay', matchesPlayed: 3, wins: 2, losses: 1, winPercentage: 67 },
      { surface: 'indoor', matchesPlayed: 2, wins: 1, losses: 1, winPercentage: 50 },
      { surface: 'grass', matchesPlayed: 0, wins: 0, losses: 0, winPercentage: 0 },
    ],
    tournaments: [
      { name: 'J4 Manchester', date: '2025-09-08', surface: 'hard', result: 'R16', roundReached: 'Round of 16', points: 8 },
      { name: 'Grade 3 Leeds', date: '2025-09-22', surface: 'hard', result: 'QF', roundReached: 'Quarter-finals', points: 15 },
      { name: 'J4 Birmingham', date: '2025-10-06', surface: 'clay', result: 'SF', roundReached: 'Semi-finals', points: 25 },
      { name: 'J4 Sheffield', date: '2025-11-10', surface: 'hard', result: 'R32', roundReached: 'Round of 32', points: 4 },
    ],
    monthlyPerformance: [
      { month: 'September', year: 2025, matchesPlayed: 7, wins: 4, losses: 3, winPercentage: 57 },
      { month: 'October', year: 2025, matchesPlayed: 5, wins: 3, losses: 2, winPercentage: 60 },
      { month: 'November', year: 2025, matchesPlayed: 4, wins: 2, losses: 2, winPercentage: 50 },
      { month: 'December', year: 2025, matchesPlayed: 1, wins: 1, losses: 0, winPercentage: 100 },
    ],
    opponentLevelStats: [
      { level: 'higher_ranked', label: 'Higher Ranked (+0.5 UTR)', matchesPlayed: 5, wins: 1, losses: 4, winPercentage: 20 },
      { level: 'similar_ranked', label: 'Similar Ranked (±0.5 UTR)', matchesPlayed: 8, wins: 5, losses: 3, winPercentage: 63 },
      { level: 'lower_ranked', label: 'Lower Ranked (-0.5 UTR)', matchesPlayed: 4, wins: 4, losses: 0, winPercentage: 100 },
    ],
    highlights: [
      'UTR improved from 8.65 to 9.12 (+0.47)',
      'Strong performance on clay (67% wins)',
      'Consistent improvement throughout the term',
    ],
    areasToImprove: [
      'Needs to develop game against higher-ranked players',
      'November performance dipped - fitness to review',
    ],
  },
  {
    playerId: 'maddie',
    playerName: 'Maddie Turnbull',
    currentUTR: 8.34,
    seasonStartUTR: 7.89,
    utrChange: 0.45,
    termStats: [
      {
        term: 'Autumn Term 1',
        startDate: '2025-09-01',
        endDate: '2025-10-18',
        matchesPlayed: 9,
        wins: 5,
        losses: 4,
        winPercentage: 56,
        setsWon: 12,
        setsLost: 9,
        gamesWon: 94,
        gamesLost: 82,
      },
      {
        term: 'Autumn Term 2',
        startDate: '2025-10-28',
        endDate: '2025-12-13',
        matchesPlayed: 6,
        wins: 4,
        losses: 2,
        winPercentage: 67,
        setsWon: 9,
        setsLost: 5,
        gamesWon: 62,
        gamesLost: 48,
      },
    ],
    surfaceStats: [
      { surface: 'hard', matchesPlayed: 10, wins: 6, losses: 4, winPercentage: 60 },
      { surface: 'clay', matchesPlayed: 3, wins: 2, losses: 1, winPercentage: 67 },
      { surface: 'indoor', matchesPlayed: 2, wins: 1, losses: 1, winPercentage: 50 },
      { surface: 'grass', matchesPlayed: 0, wins: 0, losses: 0, winPercentage: 0 },
    ],
    tournaments: [
      { name: 'J5 York', date: '2025-09-14', surface: 'hard', result: 'SF', roundReached: 'Semi-finals', points: 20 },
      { name: 'J5 Newcastle', date: '2025-10-05', surface: 'hard', result: 'QF', roundReached: 'Quarter-finals', points: 12 },
      { name: 'J5 Nottingham', date: '2025-11-09', surface: 'indoor', result: 'F', roundReached: 'Finalist', points: 35 },
    ],
    monthlyPerformance: [
      { month: 'September', year: 2025, matchesPlayed: 6, wins: 3, losses: 3, winPercentage: 50 },
      { month: 'October', year: 2025, matchesPlayed: 4, wins: 2, losses: 2, winPercentage: 50 },
      { month: 'November', year: 2025, matchesPlayed: 4, wins: 3, losses: 1, winPercentage: 75 },
      { month: 'December', year: 2025, matchesPlayed: 1, wins: 1, losses: 0, winPercentage: 100 },
    ],
    opponentLevelStats: [
      { level: 'higher_ranked', label: 'Higher Ranked (+0.5 UTR)', matchesPlayed: 4, wins: 1, losses: 3, winPercentage: 25 },
      { level: 'similar_ranked', label: 'Similar Ranked (±0.5 UTR)', matchesPlayed: 7, wins: 4, losses: 3, winPercentage: 57 },
      { level: 'lower_ranked', label: 'Lower Ranked (-0.5 UTR)', matchesPlayed: 4, wins: 4, losses: 0, winPercentage: 100 },
    ],
    highlights: [
      'Finalist at J5 Nottingham - best result of the season',
      'UTR improved from 7.89 to 8.34 (+0.45)',
      'Strong finish to the term (75% in November)',
    ],
    areasToImprove: [
      'September and October consistency needs work',
      'Closing out matches against similar-ranked opponents',
    ],
  },
]

// Helper functions
export function getPlayerSeasonData(playerId: string): SeasonOverview | undefined {
  return demoSeasonData.find(p => p.playerId === playerId)
}

export function getAllPlayers(): { id: string; name: string }[] {
  return demoSeasonData.map(p => ({ id: p.playerId, name: p.playerName }))
}

export function calculateSeasonTotals(data: SeasonOverview): {
  totalMatches: number
  totalWins: number
  totalLosses: number
  overallWinPercentage: number
  totalPoints: number
} {
  const totalMatches = data.termStats.reduce((sum, t) => sum + t.matchesPlayed, 0)
  const totalWins = data.termStats.reduce((sum, t) => sum + t.wins, 0)
  const totalLosses = data.termStats.reduce((sum, t) => sum + t.losses, 0)
  const totalPoints = data.tournaments.reduce((sum, t) => sum + t.points, 0)

  return {
    totalMatches,
    totalWins,
    totalLosses,
    overallWinPercentage: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
    totalPoints,
  }
}
