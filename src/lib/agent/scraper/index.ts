/**
 * Scraper Module - Web scraping for tournament discovery
 */

export { scrapflyFetch, isScrapflyConfigured } from './scrapfly-client'
export type { ScrapflyConfig, ScrapflyResponse } from './scrapfly-client'

export {
  parseDate,
  normalizeCategory,
  normalizeSurface,
  loadHtml,
  toScrapedTournament,
  generateTournamentId,
} from './parser'
export type { ParsedTournament } from './parser'

export { searchITF, scrapeUpcomingITFJuniors } from './itf-scraper'
export type { ITFSearchParams, ITFScraperResult } from './itf-scraper'
