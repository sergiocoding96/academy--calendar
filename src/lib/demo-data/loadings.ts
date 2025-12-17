// Demo load monitoring data based on Sergios Dashboard CSV
// SRPE = Session Rating of Perceived Exertion (intensity x duration)

export interface LoadingEntry {
  date: string
  playerId: string
  playerName: string
  dailySRPE: number
  numberOfServes: number
  projectedSRPE: number
}

export interface PlayerLoadSummary {
  playerId: string
  playerName: string
  weeklyTotalSRPE: number
  weeklyTotalServes: number
  avgDailySRPE: number
  loadZone: 'low' | 'optimal' | 'high' | 'veryHigh'
  trend: 'increasing' | 'decreasing' | 'stable'
}

// Demo players from the CSV data
export const loadingPlayers = [
  { id: 'jac-leonard', name: 'Jac Leonard' },
  { id: 'luke-servaes', name: 'Luke Servaes' },
  { id: 'maddie-turnbull', name: 'Maddie Turnbull' },
  { id: 'nikolai-tingstad', name: 'Nikolai Tingstad' },
  { id: 'oscar-riley', name: 'Oscar Riley' },
]

// Demo loading data based on the CSV structure
export const loadingData: LoadingEntry[] = [
  // Jac Leonard
  { date: '2025-10-06', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 1680, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-07', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 450, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-08', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-09', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-10', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-11', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 270, numberOfServes: 30, projectedSRPE: 0 },
  { date: '2025-10-12', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-13', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 1350, numberOfServes: 0, projectedSRPE: 1080 },
  { date: '2025-10-14', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 1260, numberOfServes: 200, projectedSRPE: 1080 },
  { date: '2025-10-15', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 1440, numberOfServes: 70, projectedSRPE: 1350 },
  { date: '2025-10-16', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 1080, numberOfServes: 100, projectedSRPE: 1260 },
  { date: '2025-10-17', playerId: 'jac-leonard', playerName: 'Jac Leonard', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },

  // Luke Servaes
  { date: '2025-10-06', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 780, numberOfServes: 70, projectedSRPE: 0 },
  { date: '2025-10-07', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 540, numberOfServes: 20, projectedSRPE: 0 },
  { date: '2025-10-08', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 450, numberOfServes: 50, projectedSRPE: 0 },
  { date: '2025-10-09', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 300, numberOfServes: 20, projectedSRPE: 0 },
  { date: '2025-10-10', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 360, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-11', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 360, numberOfServes: 10, projectedSRPE: 0 },
  { date: '2025-10-12', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-13', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 360, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-14', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 630, numberOfServes: 70, projectedSRPE: 0 },
  { date: '2025-10-15', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 720, numberOfServes: 100, projectedSRPE: 0 },
  { date: '2025-10-16', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 840, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-17', playerId: 'luke-servaes', playerName: 'Luke Servaes', dailySRPE: 180, numberOfServes: 20, projectedSRPE: 0 },

  // Maddie Turnbull
  { date: '2025-10-06', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 630, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-07', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 810, numberOfServes: 50, projectedSRPE: 0 },
  { date: '2025-10-08', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-09', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-10', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-11', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-12', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 540, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-13', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 1440, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-14', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 1500, numberOfServes: 50, projectedSRPE: 0 },
  { date: '2025-10-15', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 810, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-16', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 1740, numberOfServes: 100, projectedSRPE: 0 },
  { date: '2025-10-17', playerId: 'maddie-turnbull', playerName: 'Maddie Turnbull', dailySRPE: 1170, numberOfServes: 60, projectedSRPE: 0 },

  // Nikolai Tingstad
  { date: '2025-10-06', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 2250, numberOfServes: 30, projectedSRPE: 0 },
  { date: '2025-10-07', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 2610, numberOfServes: 10, projectedSRPE: 0 },
  { date: '2025-10-08', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 1620, numberOfServes: 90, projectedSRPE: 0 },
  { date: '2025-10-09', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 1980, numberOfServes: 40, projectedSRPE: 0 },
  { date: '2025-10-10', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 1170, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-11', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-12', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-13', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 2070, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-14', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 1800, numberOfServes: 100, projectedSRPE: 0 },
  { date: '2025-10-15', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 1260, numberOfServes: 10, projectedSRPE: 0 },
  { date: '2025-10-16', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 1380, numberOfServes: 30, projectedSRPE: 0 },
  { date: '2025-10-17', playerId: 'nikolai-tingstad', playerName: 'Nikolai Tingstad', dailySRPE: 990, numberOfServes: 50, projectedSRPE: 0 },

  // Oscar Riley
  { date: '2025-10-06', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 2130, numberOfServes: 70, projectedSRPE: 0 },
  { date: '2025-10-07', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 2070, numberOfServes: 70, projectedSRPE: 0 },
  { date: '2025-10-08', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 1380, numberOfServes: 90, projectedSRPE: 0 },
  { date: '2025-10-09', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 1200, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-10', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 60, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-11', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-12', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 0, numberOfServes: 0, projectedSRPE: 0 },
  { date: '2025-10-13', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 1830, numberOfServes: 30, projectedSRPE: 0 },
  { date: '2025-10-14', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 750, numberOfServes: 20, projectedSRPE: 0 },
  { date: '2025-10-15', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 1320, numberOfServes: 40, projectedSRPE: 0 },
  { date: '2025-10-16', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 780, numberOfServes: 60, projectedSRPE: 0 },
  { date: '2025-10-17', playerId: 'oscar-riley', playerName: 'Oscar Riley', dailySRPE: 1620, numberOfServes: 120, projectedSRPE: 0 },
]

// Load zone thresholds (SRPE per day)
export const loadZoneThresholds = {
  low: { min: 0, max: 600 },
  optimal: { min: 601, max: 1200 },
  high: { min: 1201, max: 1800 },
  veryHigh: { min: 1801, max: Infinity },
}

// Helper function to determine load zone
export function getLoadZone(srpe: number): 'low' | 'optimal' | 'high' | 'veryHigh' {
  if (srpe <= loadZoneThresholds.low.max) return 'low'
  if (srpe <= loadZoneThresholds.optimal.max) return 'optimal'
  if (srpe <= loadZoneThresholds.high.max) return 'high'
  return 'veryHigh'
}

// Helper function to get load zone color
export function getLoadZoneColor(zone: string): string {
  switch (zone) {
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'optimal': return 'text-green-600 bg-green-50 border-green-200'
    case 'high': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'veryHigh': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-stone-600 bg-stone-50 border-stone-200'
  }
}

// Get player data for a date range
export function getPlayerLoadData(playerId: string, startDate?: string, endDate?: string): LoadingEntry[] {
  let data = loadingData.filter(entry => entry.playerId === playerId)

  if (startDate) {
    data = data.filter(entry => entry.date >= startDate)
  }
  if (endDate) {
    data = data.filter(entry => entry.date <= endDate)
  }

  return data.sort((a, b) => a.date.localeCompare(b.date))
}

// Calculate summary for a player
export function calculatePlayerSummary(playerId: string, days: number = 7): PlayerLoadSummary {
  const player = loadingPlayers.find(p => p.id === playerId)
  const data = getPlayerLoadData(playerId).slice(-days)

  const totalSRPE = data.reduce((sum, entry) => sum + entry.dailySRPE, 0)
  const totalServes = data.reduce((sum, entry) => sum + entry.numberOfServes, 0)
  const avgDailySRPE = totalSRPE / Math.max(days, 1)

  // Calculate trend (compare first half to second half)
  const midpoint = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, midpoint)
  const secondHalf = data.slice(midpoint)
  const firstAvg = firstHalf.reduce((sum, e) => sum + e.dailySRPE, 0) / Math.max(firstHalf.length, 1)
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.dailySRPE, 0) / Math.max(secondHalf.length, 1)

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (secondAvg > firstAvg * 1.1) trend = 'increasing'
  else if (secondAvg < firstAvg * 0.9) trend = 'decreasing'

  return {
    playerId,
    playerName: player?.name || 'Unknown',
    weeklyTotalSRPE: totalSRPE,
    weeklyTotalServes: totalServes,
    avgDailySRPE,
    loadZone: getLoadZone(avgDailySRPE),
    trend,
  }
}
