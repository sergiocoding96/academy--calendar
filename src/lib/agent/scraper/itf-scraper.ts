/**
 * ITF Scraper - Scrape tournaments from ITF World Tennis Tour
 *
 * Targets: https://www.itftennis.com/en/tournament-calendar/
 * Uses Scrapfly for reliable fetching + Cheerio for parsing
 */

import { scrapflyFetch, isScrapflyConfigured } from './scrapfly-client'
import {
  loadHtml,
  parseDate,
  normalizeCategory,
  normalizeSurface,
  extractText,
  toScrapedTournament,
  type ParsedTournament,
} from './parser'
import type { ScrapedTournament } from '@/types/agent'

export interface ITFSearchParams {
  category?: string // U12, U14, U16, U18, Open
  country?: string // Country name or code
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  gender?: 'M' | 'F' | 'mixed'
  limit?: number
}

export interface ITFScraperResult {
  success: boolean
  tournaments: ScrapedTournament[]
  errors: string[]
  source: string
  scrapedAt: string
}

const ITF_BASE_URL = 'https://www.itftennis.com'
const ITF_CALENDAR_URL = `${ITF_BASE_URL}/en/tournament-calendar/`

// Category mapping for ITF URL parameters
const CATEGORY_MAP: Record<string, string> = {
  'U12': 'juniors-12-and-under',
  'U14': 'juniors-14-and-under',
  'U16': 'juniors-16-and-under',
  'U18': 'juniors-18-and-under',
  'Open': 'world-tennis-tour',
}

/**
 * Build ITF calendar URL with search parameters
 */
function buildSearchUrl(params: ITFSearchParams): string {
  const url = new URL(ITF_CALENDAR_URL)

  // Add category filter
  if (params.category && CATEGORY_MAP[params.category]) {
    url.searchParams.set('categories', CATEGORY_MAP[params.category])
  }

  // Add date range
  if (params.dateFrom) {
    url.searchParams.set('startDate', params.dateFrom)
  }
  if (params.dateTo) {
    url.searchParams.set('endDate', params.dateTo)
  }

  // Add country filter
  if (params.country) {
    url.searchParams.set('country', params.country)
  }

  return url.toString()
}

/**
 * Parse tournament cards from ITF calendar page
 */
function parseTournamentCards(html: string): ParsedTournament[] {
  const $ = loadHtml(html)
  const tournaments: ParsedTournament[] = []

  // ITF uses tournament cards - selector may need adjustment based on actual HTML
  // Common selectors to try: .tournament-card, .event-item, [data-tournament], .calendar-item
  const selectors = [
    '.tournament-card',
    '.event-card',
    '.calendar-event',
    '[data-event-type="tournament"]',
    '.tournament-item',
    'article.tournament',
  ]

  // Find tournament elements using various selectors
  let foundSelector = ''
  for (const selector of selectors) {
    if ($(selector).length > 0) {
      foundSelector = selector
      break
    }
  }

  // If no cards found, try parsing table rows (some ITF pages use tables)
  if (!foundSelector) {
    foundSelector = 'table tbody tr:has(a[href*="tournament"])'
  }

  $(foundSelector).each((_, element) => {
    try {
      const $el = $(element)

      // Extract tournament name
      const name = extractText($el.find('h3, h4, .tournament-name, .event-name, a[href*="tournament"]').first())
      if (!name) return // Skip if no name found

      // Extract dates
      const dateText = extractText($el.find('.date, .dates, .tournament-date, time'))
      const dates = parseDateRange(dateText)

      // Extract location
      const location = extractText($el.find('.location, .venue, .city'))
      const country = extractText($el.find('.country, .nation'))

      // Extract category/level
      const categoryText = extractText($el.find('.category, .age-group, .tour'))
      const levelText = extractText($el.find('.grade, .level, .tier'))

      // Extract surface
      const surface = extractText($el.find('.surface, .court-type'))

      // Extract link
      const link = $el.find('a[href*="tournament"]').attr('href')
      const website = link ? (link.startsWith('http') ? link : `${ITF_BASE_URL}${link}`) : null

      tournaments.push({
        name,
        startDate: dates.start,
        endDate: dates.end,
        location: location || null,
        country: country || null,
        category: normalizeCategory(categoryText),
        level: levelText || null,
        surface: normalizeSurface(surface),
        entryDeadline: null,
        website,
        rawData: {
          dateText,
          categoryText,
          levelText,
          html: $el.html()?.substring(0, 500) || '',
        },
      })
    } catch (error) {
      console.warn('Failed to parse tournament card:', error)
    }
  })

  return tournaments
}

/**
 * Parse a date range string like "Jan 15 - Jan 21, 2025"
 */
function parseDateRange(dateText: string): { start: string | null; end: string | null } {
  if (!dateText) return { start: null, end: null }

  // Try to split by common separators
  const separators = [' - ', ' to ', ' – ', '–', '-']

  for (const sep of separators) {
    if (dateText.includes(sep)) {
      const parts = dateText.split(sep).map(p => p.trim())
      if (parts.length === 2) {
        // If end date doesn't have year, append from start date
        let startStr = parts[0]
        let endStr = parts[1]

        // Extract year from the string
        const yearMatch = dateText.match(/\d{4}/)
        const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()

        if (!endStr.match(/\d{4}/)) {
          endStr = `${endStr} ${year}`
        }
        if (!startStr.match(/\d{4}/)) {
          startStr = `${startStr} ${year}`
        }

        return {
          start: parseDate(startStr),
          end: parseDate(endStr),
        }
      }
    }
  }

  // Single date
  return {
    start: parseDate(dateText),
    end: parseDate(dateText),
  }
}

/**
 * Search ITF tournaments
 */
export async function searchITF(params: ITFSearchParams = {}): Promise<ITFScraperResult> {
  const result: ITFScraperResult = {
    success: false,
    tournaments: [],
    errors: [],
    source: 'ITF World Tennis Tour',
    scrapedAt: new Date().toISOString(),
  }

  // Check if Scrapfly is configured
  if (!isScrapflyConfigured()) {
    result.errors.push('Scrapfly API key not configured. Add SCRAPFLY_API_KEY to environment variables.')
    return result
  }

  try {
    const searchUrl = buildSearchUrl(params)
    console.log(`[ITF Scraper] Fetching: ${searchUrl}`)

    // Fetch with Scrapfly (may need JS rendering for dynamic content)
    const response = await scrapflyFetch(searchUrl, {
      renderJs: true, // ITF likely uses JavaScript
      timeout: 45000,
    })

    if (!response.success || !response.html) {
      result.errors.push(response.error || 'Failed to fetch ITF calendar')
      return result
    }

    // Parse the HTML
    const parsed = parseTournamentCards(response.html)
    console.log(`[ITF Scraper] Found ${parsed.length} tournaments`)

    // Convert to ScrapedTournament format
    const tournaments = parsed
      .map(p => toScrapedTournament(p, 'itf', searchUrl))
      .slice(0, params.limit || 50)

    result.tournaments = tournaments
    result.success = true

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  return result
}

/**
 * Get all upcoming ITF junior tournaments (for weekly scrape)
 */
export async function scrapeUpcomingITFJuniors(): Promise<ITFScraperResult> {
  const today = new Date()
  const threeMonthsLater = new Date(today)
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)

  const allTournaments: ScrapedTournament[] = []
  const allErrors: string[] = []

  // Scrape each junior category
  const categories = ['U12', 'U14', 'U16', 'U18']

  for (const category of categories) {
    console.log(`[ITF Scraper] Scraping ${category} tournaments...`)

    const result = await searchITF({
      category,
      dateFrom: today.toISOString().split('T')[0],
      dateTo: threeMonthsLater.toISOString().split('T')[0],
      limit: 100,
    })

    if (result.success) {
      allTournaments.push(...result.tournaments)
    }
    if (result.errors.length > 0) {
      allErrors.push(...result.errors.map(e => `[${category}] ${e}`))
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return {
    success: allErrors.length === 0,
    tournaments: allTournaments,
    errors: allErrors,
    source: 'ITF World Tennis Tour',
    scrapedAt: new Date().toISOString(),
  }
}
