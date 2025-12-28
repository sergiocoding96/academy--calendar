/**
 * Generic Circuit Scraper - Scrape tournaments from any circuit URL
 *
 * Uses hybrid fetching (HTTP first, Scrapfly fallback) and
 * configurable parsing rules per circuit.
 */

import { hybridFetch, testFetchMethod, type FetchResult } from './hybrid-fetcher'
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

/**
 * Circuit configuration - defines how to scrape a specific circuit
 */
export interface CircuitConfig {
  /** Unique identifier for this circuit */
  id: string
  /** Display name */
  name: string
  /** Base URL for the calendar/search page */
  calendarUrl: string
  /** Whether this circuit needs Scrapfly (JS rendering) */
  needsScrapfly?: boolean
  /** CSS selectors for parsing */
  selectors: {
    /** Container for each tournament */
    tournamentCard: string
    /** Selectors within the card */
    name?: string
    dates?: string
    location?: string
    country?: string
    category?: string
    level?: string
    surface?: string
    link?: string
  }
  /** Optional URL builder for search parameters */
  buildSearchUrl?: (params: CircuitSearchParams) => string
}

export interface CircuitSearchParams {
  category?: string
  dateFrom?: string
  dateTo?: string
  country?: string
  query?: string
}

export interface CircuitScraperResult {
  success: boolean
  tournaments: ScrapedTournament[]
  errors: string[]
  circuit: string
  fetchMethod: 'http' | 'scrapfly'
  scrapedAt: string
  duration: number
}

/**
 * Known circuit configurations
 * These will be populated based on user's circuit URLs
 */
export const CIRCUIT_CONFIGS: Map<string, CircuitConfig> = new Map()

/**
 * Register a new circuit configuration
 */
export function registerCircuit(config: CircuitConfig): void {
  CIRCUIT_CONFIGS.set(config.id, config)
  console.log(`[Circuit] Registered circuit: ${config.name}`)
}

/**
 * Default selectors to try when parsing unknown sites
 */
const DEFAULT_SELECTORS = {
  tournamentCard: [
    '.tournament-card',
    '.event-card',
    '.tournament-item',
    '.calendar-event',
    '.event-item',
    'article.tournament',
    'tr[data-tournament]',
    '.torneo',
    '.competicion',
    'table tbody tr',
  ],
  name: ['h3', 'h4', '.tournament-name', '.event-name', '.nombre', 'a[href*="tournament"]', 'a[href*="torneo"]', 'td:first-child'],
  dates: ['.date', '.dates', '.fecha', 'time', '.tournament-date', 'td:nth-child(2)'],
  location: ['.location', '.venue', '.city', '.ciudad', '.sede', 'td:nth-child(3)'],
  category: ['.category', '.age-group', '.categoria', '.tour', 'td:nth-child(4)'],
  level: ['.grade', '.level', '.tier', '.nivel'],
  surface: ['.surface', '.court-type', '.superficie'],
  link: ['a[href*="tournament"]', 'a[href*="torneo"]', 'a[href*="event"]', 'a'],
}

/**
 * Parse tournaments from HTML using circuit config or auto-detection
 */
function parseTournaments(
  html: string,
  config?: CircuitConfig,
  sourceUrl?: string
): ParsedTournament[] {
  const $ = loadHtml(html)
  const tournaments: ParsedTournament[] = []

  // Determine card selector
  let cardSelector = config?.selectors.tournamentCard
  if (!cardSelector) {
    // Auto-detect card selector
    for (const selector of DEFAULT_SELECTORS.tournamentCard) {
      if ($(selector).length > 0) {
        cardSelector = selector
        break
      }
    }
  }

  if (!cardSelector) {
    console.warn('[Circuit] Could not find tournament cards')
    return tournaments
  }

  $(cardSelector).each((_, element) => {
    try {
      const $el = $(element)

      // Extract fields using config selectors or defaults
      const findText = (configSelector?: string, defaults?: string[]): string => {
        if (configSelector) {
          return extractText($el.find(configSelector).first())
        }
        for (const sel of defaults || []) {
          const text = extractText($el.find(sel).first())
          if (text) return text
        }
        return ''
      }

      const name = findText(config?.selectors.name, DEFAULT_SELECTORS.name)
      if (!name) return // Skip if no name

      const dateText = findText(config?.selectors.dates, DEFAULT_SELECTORS.dates)
      const location = findText(config?.selectors.location, DEFAULT_SELECTORS.location)
      const categoryText = findText(config?.selectors.category, DEFAULT_SELECTORS.category)
      const levelText = findText(config?.selectors.level, DEFAULT_SELECTORS.level)
      const surface = findText(config?.selectors.surface, DEFAULT_SELECTORS.surface)

      // Extract link
      let link: string | null = null
      const linkSelector = config?.selectors.link || DEFAULT_SELECTORS.link[0]
      const linkEl = $el.find(linkSelector).attr('href')
      if (linkEl) {
        try {
          link = linkEl.startsWith('http') ? linkEl : new URL(linkEl, sourceUrl).toString()
        } catch {
          link = linkEl
        }
      }

      // Parse date range
      const dates = parseDateRange(dateText)

      tournaments.push({
        name,
        startDate: dates.start,
        endDate: dates.end,
        location: location || null,
        country: extractCountry(location),
        category: normalizeCategory(categoryText),
        level: levelText || null,
        surface: normalizeSurface(surface),
        entryDeadline: null,
        website: link,
        rawData: { dateText, categoryText, levelText },
      })
    } catch (error) {
      console.warn('[Circuit] Failed to parse card:', error)
    }
  })

  return tournaments
}

/**
 * Parse a date range string
 */
function parseDateRange(text: string): { start: string | null; end: string | null } {
  if (!text) return { start: null, end: null }

  const separators = [' - ', ' to ', ' – ', ' al ', '–', '-']

  for (const sep of separators) {
    if (text.includes(sep)) {
      const parts = text.split(sep).map(p => p.trim())
      if (parts.length >= 2) {
        const yearMatch = text.match(/\d{4}/)
        const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()

        let start = parts[0]
        let end = parts[1]

        if (!end.match(/\d{4}/)) end = `${end} ${year}`
        if (!start.match(/\d{4}/)) start = `${start} ${year}`

        return {
          start: parseDate(start),
          end: parseDate(end),
        }
      }
    }
  }

  return { start: parseDate(text), end: parseDate(text) }
}

/**
 * Try to extract country from location string
 */
function extractCountry(location: string | null): string | null {
  if (!location) return null

  // Common country patterns
  const countries = [
    'Spain', 'España', 'France', 'Francia', 'Germany', 'Alemania',
    'Italy', 'Italia', 'Portugal', 'UK', 'United Kingdom', 'USA',
    'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Sweden',
    'Czech Republic', 'Poland', 'Croatia', 'Greece', 'Turkey',
  ]

  for (const country of countries) {
    if (location.toLowerCase().includes(country.toLowerCase())) {
      return country
    }
  }

  // Check for country code at end (e.g., "Barcelona, ESP")
  const codeMatch = location.match(/,\s*([A-Z]{2,3})$/)
  if (codeMatch) {
    return codeMatch[1]
  }

  return null
}

/**
 * Scrape tournaments from a circuit
 */
export async function scrapeCircuit(
  circuitId: string,
  params: CircuitSearchParams = {}
): Promise<CircuitScraperResult> {
  const config = CIRCUIT_CONFIGS.get(circuitId)

  if (!config) {
    return {
      success: false,
      tournaments: [],
      errors: [`Circuit not found: ${circuitId}`],
      circuit: circuitId,
      fetchMethod: 'http',
      scrapedAt: new Date().toISOString(),
      duration: 0,
    }
  }

  return scrapeUrl(config.calendarUrl, {
    circuitName: config.name,
    config,
    params,
  })
}

/**
 * Scrape tournaments from any URL (with optional config)
 */
export async function scrapeUrl(
  url: string,
  options: {
    circuitName?: string
    config?: CircuitConfig
    params?: CircuitSearchParams
  } = {}
): Promise<CircuitScraperResult> {
  const startTime = Date.now()
  const circuitName = options.circuitName || new URL(url).hostname

  const result: CircuitScraperResult = {
    success: false,
    tournaments: [],
    errors: [],
    circuit: circuitName,
    fetchMethod: 'http',
    scrapedAt: new Date().toISOString(),
    duration: 0,
  }

  try {
    // Build search URL if params provided
    let fetchUrl = url
    if (options.config?.buildSearchUrl && options.params) {
      fetchUrl = options.config.buildSearchUrl(options.params)
    }

    console.log(`[Circuit] Scraping ${circuitName}: ${fetchUrl}`)

    // Fetch with hybrid approach
    const fetchResult = await hybridFetch(fetchUrl, {
      forceScrapfly: options.config?.needsScrapfly,
      renderJs: true,
    })

    result.fetchMethod = fetchResult.method
    result.duration = Date.now() - startTime

    if (!fetchResult.success || !fetchResult.html) {
      result.errors.push(fetchResult.error || 'Failed to fetch page')
      return result
    }

    // Parse tournaments
    const parsed = parseTournaments(fetchResult.html, options.config, fetchUrl)
    console.log(`[Circuit] Found ${parsed.length} tournaments from ${circuitName}`)

    // Convert to ScrapedTournament format
    result.tournaments = parsed.map(p =>
      toScrapedTournament(p, options.config?.id || 'unknown', fetchUrl)
    )
    result.success = true

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    result.duration = Date.now() - startTime
  }

  return result
}

/**
 * Scrape multiple circuits in parallel
 */
export async function scrapeMultipleCircuits(
  circuitIds: string[],
  params: CircuitSearchParams = {}
): Promise<CircuitScraperResult[]> {
  const results = await Promise.all(
    circuitIds.map(id => scrapeCircuit(id, params))
  )
  return results
}

/**
 * Test and analyze a URL to help configure a new circuit
 */
export async function analyzeUrl(url: string): Promise<{
  fetchTest: Awaited<ReturnType<typeof testFetchMethod>>
  sampleTournaments: ParsedTournament[]
  suggestedConfig: Partial<CircuitConfig>
}> {
  // Test fetch methods
  const fetchTest = await testFetchMethod(url)

  // Try to parse with auto-detection
  let sampleTournaments: ParsedTournament[] = []
  const html = fetchTest.httpResult?.html || fetchTest.scrapflyResult?.html

  if (html) {
    sampleTournaments = parseTournaments(html, undefined, url)
  }

  // Suggest configuration
  const hostname = new URL(url).hostname
  const suggestedConfig: Partial<CircuitConfig> = {
    id: hostname.replace(/\./g, '_'),
    name: hostname,
    calendarUrl: url,
    needsScrapfly: fetchTest.recommended === 'scrapfly',
  }

  return {
    fetchTest,
    sampleTournaments,
    suggestedConfig,
  }
}

// Pre-register known circuits
registerCircuit({
  id: 'itf',
  name: 'ITF World Tennis Tour',
  calendarUrl: 'https://www.itftennis.com/en/tournament-calendar/',
  needsScrapfly: true,
  selectors: {
    tournamentCard: '.tournament-card, .event-card, article.tournament',
    name: 'h3, h4, .tournament-name',
    dates: '.date, .dates, time',
    location: '.location, .venue',
    category: '.category, .age-group',
    level: '.grade, .level',
  },
})

registerCircuit({
  id: 'tennis_europe',
  name: 'Tennis Europe',
  calendarUrl: 'https://www.tenniseurope.org/sport/calendar',
  needsScrapfly: true,
  selectors: {
    tournamentCard: '.tournament-item, .event-row, tr[data-event]',
    name: '.tournament-name, .event-name, td:first-child',
    dates: '.dates, .event-date',
    location: '.location, .venue',
    category: '.category, .age-group',
  },
})
