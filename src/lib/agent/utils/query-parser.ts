/**
 * Query Parser for Natural Language Date/Location Expressions
 *
 * Parses human-friendly expressions like "next month", "in January",
 * "Barcelona", "U16" into structured query parameters.
 */

// ============================================
// Types
// ============================================

export interface ParsedDateRange {
  date_from: string
  date_to: string
}

export interface ParsedQuery {
  category?: string
  date_from?: string
  date_to?: string
  location?: string
  tournament_type?: string
  level?: string
}

// ============================================
// Date Parsing
// ============================================

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]

const MONTH_ABBREVS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
]

/**
 * Parse a date expression into a date range
 */
export function parseDateExpression(expression: string): ParsedDateRange | null {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const lowerExpr = expression.toLowerCase().trim()

  // "today"
  if (lowerExpr === 'today') {
    const today = formatDate(now)
    return { date_from: today, date_to: today }
  }

  // "tomorrow"
  if (lowerExpr === 'tomorrow') {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tmrw = formatDate(tomorrow)
    return { date_from: tmrw, date_to: tmrw }
  }

  // "this week"
  if (lowerExpr === 'this week') {
    return getWeekRange(now)
  }

  // "next week"
  if (lowerExpr === 'next week') {
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    return getWeekRange(nextWeek)
  }

  // "this month"
  if (lowerExpr === 'this month') {
    return getMonthRange(currentYear, currentMonth)
  }

  // "next month"
  if (lowerExpr === 'next month') {
    let year = currentYear
    let month = currentMonth + 1
    if (month > 11) {
      month = 0
      year++
    }
    return getMonthRange(year, month)
  }

  // "in X days" or "next X days"
  const daysMatch = lowerExpr.match(/(?:in|next)\s+(\d+)\s+days?/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10)
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + days)
    return {
      date_from: formatDate(now),
      date_to: formatDate(endDate),
    }
  }

  // Month name (e.g., "January", "in February", "March 2025")
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    const monthName = MONTH_NAMES[i]
    const monthAbbrev = MONTH_ABBREVS[i]

    if (lowerExpr.includes(monthName) || lowerExpr.includes(monthAbbrev)) {
      // Check for year
      const yearMatch = lowerExpr.match(/\d{4}/)
      const year = yearMatch ? parseInt(yearMatch[0], 10) : currentYear

      return getMonthRange(year, i)
    }
  }

  // "Q1", "Q2", "Q3", "Q4"
  const quarterMatch = lowerExpr.match(/q([1-4])(?:\s+(\d{4}))?/)
  if (quarterMatch) {
    const quarter = parseInt(quarterMatch[1], 10)
    const year = quarterMatch[2] ? parseInt(quarterMatch[2], 10) : currentYear
    return getQuarterRange(year, quarter)
  }

  // Year only (e.g., "2025")
  if (/^\d{4}$/.test(lowerExpr)) {
    const year = parseInt(lowerExpr, 10)
    return {
      date_from: `${year}-01-01`,
      date_to: `${year}-12-31`,
    }
  }

  // "upcoming" or "future"
  if (lowerExpr === 'upcoming' || lowerExpr === 'future') {
    const futureEnd = new Date(now)
    futureEnd.setMonth(futureEnd.getMonth() + 3) // 3 months ahead
    return {
      date_from: formatDate(now),
      date_to: formatDate(futureEnd),
    }
  }

  return null
}

// ============================================
// Category Parsing
// ============================================

const CATEGORY_PATTERNS: [RegExp, string][] = [
  [/\bu12\b|under\s*12|12\s*and\s*under/i, 'U12'],
  [/\bu14\b|under\s*14|14\s*and\s*under/i, 'U14'],
  [/\bu16\b|under\s*16|16\s*and\s*under/i, 'U16'],
  [/\bu18\b|under\s*18|18\s*and\s*under|junior/i, 'U18'],
  [/\badults?\b|open\s*category|senior/i, 'Adults'],
]

/**
 * Parse category from natural language
 */
export function parseCategory(text: string): string | null {
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(text)) {
      return category
    }
  }
  return null
}

// ============================================
// Tournament Type Parsing
// ============================================

const TYPE_PATTERNS: [RegExp, string][] = [
  [/\blocal\b|proximity|nearby|close/i, 'proximity'],
  [/\bnational\b|country\s*wide/i, 'national'],
  [/\binternational\b|overseas|abroad/i, 'international'],
]

/**
 * Parse tournament type from natural language
 */
export function parseTournamentType(text: string): string | null {
  for (const [pattern, type] of TYPE_PATTERNS) {
    if (pattern.test(text)) {
      return type
    }
  }
  return null
}

// ============================================
// Location Parsing
// ============================================

// Common location keywords to extract
const LOCATION_PREPOSITIONS = ['in', 'at', 'near', 'around', 'from']

/**
 * Extract location from natural language
 * This is a simple extraction - Claude will handle complex cases
 */
export function parseLocation(text: string): string | null {
  const lowerText = text.toLowerCase()

  // Look for patterns like "in Barcelona", "at Valencia", etc.
  for (const prep of LOCATION_PREPOSITIONS) {
    const pattern = new RegExp(`${prep}\\s+([A-Z][a-zA-Z\\s]+)(?:[,.]|$|\\s+(?:tournament|event|competition))`, 'i')
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // Common Spanish cities/regions
  const spanishLocations = [
    'barcelona', 'madrid', 'valencia', 'seville', 'malaga',
    'bilbao', 'zaragoza', 'murcia', 'alicante', 'granada',
    'catalonia', 'andalusia', 'castilla', 'galicia', 'basque',
    'spain', 'españa'
  ]

  for (const location of spanishLocations) {
    if (lowerText.includes(location)) {
      return location.charAt(0).toUpperCase() + location.slice(1)
    }
  }

  return null
}

// ============================================
// Level/Grade Parsing
// ============================================

const LEVEL_PATTERNS: [RegExp, string][] = [
  [/\bgrade\s*1\b|g1\b|level\s*1/i, 'Grade 1'],
  [/\bgrade\s*2\b|g2\b|level\s*2/i, 'Grade 2'],
  [/\bgrade\s*3\b|g3\b|level\s*3/i, 'Grade 3'],
  [/\bgrade\s*4\b|g4\b|level\s*4/i, 'Grade 4'],
  [/\bgrade\s*5\b|g5\b|level\s*5/i, 'Grade 5'],
  [/\bitf\b/i, 'ITF'],
  [/\bte\b|tennis\s*europe/i, 'Tennis Europe'],
]

/**
 * Parse tournament level from natural language
 */
export function parseLevel(text: string): string | null {
  for (const [pattern, level] of LEVEL_PATTERNS) {
    if (pattern.test(text)) {
      return level
    }
  }
  return null
}

// ============================================
// Full Query Parsing
// ============================================

/**
 * Parse a complete natural language query into structured parameters
 */
export function parseQuery(text: string): ParsedQuery {
  const query: ParsedQuery = {}

  // Try to extract date range
  const dateRange = parseDateExpression(text)
  if (dateRange) {
    query.date_from = dateRange.date_from
    query.date_to = dateRange.date_to
  }

  // Extract category
  const category = parseCategory(text)
  if (category) {
    query.category = category
  }

  // Extract tournament type
  const tournamentType = parseTournamentType(text)
  if (tournamentType) {
    query.tournament_type = tournamentType
  }

  // Extract location
  const location = parseLocation(text)
  if (location) {
    query.location = location
  }

  // Extract level
  const level = parseLevel(text)
  if (level) {
    query.level = level
  }

  return query
}

// ============================================
// Helper Functions
// ============================================

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekRange(date: Date): ParsedDateRange {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday as start

  const start = new Date(date)
  start.setDate(diff)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    date_from: formatDate(start),
    date_to: formatDate(end),
  }
}

function getMonthRange(year: number, month: number): ParsedDateRange {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0) // Last day of month

  return {
    date_from: formatDate(start),
    date_to: formatDate(end),
  }
}

function getQuarterRange(year: number, quarter: number): ParsedDateRange {
  const startMonth = (quarter - 1) * 3
  const endMonth = startMonth + 2

  const start = new Date(year, startMonth, 1)
  const end = new Date(year, endMonth + 1, 0)

  return {
    date_from: formatDate(start),
    date_to: formatDate(end),
  }
}
