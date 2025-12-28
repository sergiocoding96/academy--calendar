/**
 * HTML Parser Utilities - Extract tournament data from scraped HTML
 *
 * Uses Cheerio for fast, jQuery-like HTML parsing.
 */

import * as cheerio from 'cheerio'
import type { ScrapedTournament } from '@/types/agent'

export interface ParsedTournament {
  name: string
  startDate: string | null
  endDate: string | null
  location: string | null
  country: string | null
  category: string | null
  level: string | null
  surface: string | null
  entryDeadline: string | null
  website: string | null
  rawData: Record<string, string>
}

/**
 * Parse a date string into ISO format (YYYY-MM-DD)
 */
export function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null

  const cleaned = dateStr.trim()
  if (!cleaned) return null

  try {
    // Common date formats
    const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
      // YYYY-MM-DD
      [/^(\d{4})-(\d{2})-(\d{2})$/, (m) => `${m[1]}-${m[2]}-${m[3]}`],
      // DD/MM/YYYY
      [/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`],
      // MM/DD/YYYY (US format)
      [/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (m) => `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`],
      // DD.MM.YYYY
      [/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`],
      // Month DD, YYYY
      [/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/i, (m) => {
        const months: Record<string, string> = {
          january: '01', february: '02', march: '03', april: '04',
          may: '05', june: '06', july: '07', august: '08',
          september: '09', october: '10', november: '11', december: '12',
          jan: '01', feb: '02', mar: '03', apr: '04', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
        }
        const month = months[m[1].toLowerCase()]
        if (!month) return ''
        return `${m[3]}-${month}-${m[2].padStart(2, '0')}`
      }],
      // DD Month YYYY
      [/^(\d{1,2})\s+(\w+)\s+(\d{4})$/i, (m) => {
        const months: Record<string, string> = {
          january: '01', february: '02', march: '03', april: '04',
          may: '05', june: '06', july: '07', august: '08',
          september: '09', october: '10', november: '11', december: '12',
          jan: '01', feb: '02', mar: '03', apr: '04', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
        }
        const month = months[m[2].toLowerCase()]
        if (!month) return ''
        return `${m[3]}-${month}-${m[1].padStart(2, '0')}`
      }],
    ]

    for (const [pattern, formatter] of patterns) {
      const match = cleaned.match(pattern)
      if (match) {
        const result = formatter(match)
        if (result && /^\d{4}-\d{2}-\d{2}$/.test(result)) {
          return result
        }
      }
    }

    // Fallback: try Date constructor
    const date = new Date(cleaned)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Normalize category strings to standard format
 */
export function normalizeCategory(category: string | null | undefined): string | null {
  if (!category) return null

  const normalized = category.toLowerCase().trim()

  const categoryMap: Record<string, string> = {
    'u12': 'U12', 'u-12': 'U12', 'under 12': 'U12', '12 & under': 'U12', '12u': 'U12',
    'u14': 'U14', 'u-14': 'U14', 'under 14': 'U14', '14 & under': 'U14', '14u': 'U14',
    'u16': 'U16', 'u-16': 'U16', 'under 16': 'U16', '16 & under': 'U16', '16u': 'U16',
    'u18': 'U18', 'u-18': 'U18', 'under 18': 'U18', '18 & under': 'U18', '18u': 'U18',
    'men': 'Open', 'women': 'Open', 'mens': 'Open', 'womens': 'Open',
    'open': 'Open', 'pro': 'Open', 'professional': 'Open',
    'senior': 'Senior', 'seniors': 'Senior', '35+': 'Senior', '40+': 'Senior',
  }

  return categoryMap[normalized] || category.trim()
}

/**
 * Normalize surface strings
 */
export function normalizeSurface(surface: string | null | undefined): string | null {
  if (!surface) return null

  const normalized = surface.toLowerCase().trim()

  const surfaceMap: Record<string, string> = {
    'hard': 'Hard', 'hardcourt': 'Hard', 'hard court': 'Hard',
    'clay': 'Clay', 'red clay': 'Clay', 'terre battue': 'Clay',
    'grass': 'Grass', 'lawn': 'Grass',
    'indoor': 'Indoor Hard', 'indoor hard': 'Indoor Hard',
    'carpet': 'Carpet', 'indoor carpet': 'Carpet',
  }

  return surfaceMap[normalized] || surface.trim()
}

/**
 * Extract text content, handling whitespace
 */
export function extractText($el: ReturnType<cheerio.CheerioAPI>): string {
  return $el.text().replace(/\s+/g, ' ').trim()
}

/**
 * Generate a unique ID for a scraped tournament
 */
export function generateTournamentId(
  name: string,
  startDate: string | null,
  location: string | null
): string {
  const combined = `${name}-${startDate || 'unknown'}-${location || 'unknown'}`.toLowerCase()
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `scraped_${Math.abs(hash).toString(16)}`
}

/**
 * Convert parsed tournament to ScrapedTournament type
 */
export function toScrapedTournament(
  parsed: ParsedTournament,
  source: string,
  sourceUrl: string
): ScrapedTournament {
  const id = generateTournamentId(parsed.name, parsed.startDate, parsed.location)

  return {
    id,
    source_id: source,
    external_id: id,
    name: parsed.name,
    start_date: parsed.startDate || '',
    end_date: parsed.endDate || parsed.startDate || '',
    location: parsed.location || 'Unknown',
    country: parsed.country || null,
    category: parsed.category || null,
    tournament_type: parsed.level || null,
    level: parsed.level || null,
    surface: parsed.surface || null,
    entry_deadline: parsed.entryDeadline || null,
    website: parsed.website || sourceUrl,
    status: 'pending',
    scraped_at: new Date().toISOString(),
    raw_data: parsed.rawData,
  }
}

/**
 * Create a Cheerio instance from HTML
 */
export function loadHtml(html: string): cheerio.CheerioAPI {
  return cheerio.load(html)
}
