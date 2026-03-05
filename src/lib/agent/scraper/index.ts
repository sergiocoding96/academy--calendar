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

export { scrapeCircuit, scrapeMultipleCircuits } from './circuit-scraper'
export type { CircuitSearchParams, CircuitScraperResult } from './circuit-scraper'

export { hybridFetch, hybridFetchMultiple } from './hybrid-fetcher'
export type { FetchResult, HybridFetchOptions } from './hybrid-fetcher'
