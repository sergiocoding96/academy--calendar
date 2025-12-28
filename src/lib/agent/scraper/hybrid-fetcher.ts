/**
 * Hybrid Fetcher - Tries regular HTTP first, falls back to Scrapfly
 *
 * Strategy:
 * 1. Try regular fetch() - fast, free
 * 2. If blocked/failed, use Scrapfly - reliable, costs credits
 *
 * This minimizes API costs while ensuring reliability.
 */

import { scrapflyFetch, isScrapflyConfigured } from './scrapfly-client'

export interface FetchResult {
  success: boolean
  html: string | null
  url: string
  statusCode: number
  method: 'http' | 'scrapfly'
  error?: string
  /** Time taken in milliseconds */
  duration: number
}

export interface HybridFetchOptions {
  /** Timeout for regular HTTP request (ms) */
  httpTimeout?: number
  /** Timeout for Scrapfly request (ms) */
  scrapflyTimeout?: number
  /** Force use of Scrapfly (skip HTTP attempt) */
  forceScrapfly?: boolean
  /** Enable JavaScript rendering in Scrapfly */
  renderJs?: boolean
  /** Custom headers for HTTP request */
  headers?: Record<string, string>
  /** User agent string */
  userAgent?: string
}

// Common signs that a request was blocked
const BLOCKED_INDICATORS = [
  'access denied',
  'blocked',
  'captcha',
  'cloudflare',
  'please verify',
  'rate limit',
  'too many requests',
  'forbidden',
  'bot detected',
  'unusual traffic',
]

// Sites known to need Scrapfly (JS rendering or anti-bot)
const SCRAPFLY_REQUIRED_DOMAINS = [
  'tenniseurope.org',
  'itftennis.com',
  'utrsports.net',
]

/**
 * Check if HTML content indicates the request was blocked
 */
function isBlockedResponse(html: string): boolean {
  const lowerHtml = html.toLowerCase()
  return BLOCKED_INDICATORS.some(indicator => lowerHtml.includes(indicator))
}

/**
 * Check if a URL likely needs Scrapfly based on domain
 */
function needsScrapfly(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return SCRAPFLY_REQUIRED_DOMAINS.some(domain => hostname.includes(domain))
  } catch {
    return false
  }
}

/**
 * Try regular HTTP fetch
 */
async function tryHttpFetch(
  url: string,
  options: HybridFetchOptions
): Promise<FetchResult> {
  const startTime = Date.now()

  try {
    const headers: Record<string, string> = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
      'User-Agent': options.userAgent ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...options.headers,
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(options.httpTimeout || 15000),
      redirect: 'follow',
    })

    const duration = Date.now() - startTime
    const html = await response.text()

    // Check if we got blocked
    if (!response.ok || isBlockedResponse(html)) {
      return {
        success: false,
        html: null,
        url,
        statusCode: response.status,
        method: 'http',
        duration,
        error: response.ok ? 'Blocked by anti-bot protection' : `HTTP ${response.status}`,
      }
    }

    // Check if content looks like actual HTML (not empty or error page)
    if (html.length < 500 || !html.includes('<')) {
      return {
        success: false,
        html: null,
        url,
        statusCode: response.status,
        method: 'http',
        duration,
        error: 'Response too short or not HTML',
      }
    }

    return {
      success: true,
      html,
      url: response.url, // May differ due to redirects
      statusCode: response.status,
      method: 'http',
      duration,
    }
  } catch (error) {
    return {
      success: false,
      html: null,
      url,
      statusCode: 0,
      method: 'http',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch using Scrapfly
 */
async function tryScrapflyFetch(
  url: string,
  options: HybridFetchOptions
): Promise<FetchResult> {
  const startTime = Date.now()

  if (!isScrapflyConfigured()) {
    return {
      success: false,
      html: null,
      url,
      statusCode: 0,
      method: 'scrapfly',
      duration: Date.now() - startTime,
      error: 'Scrapfly not configured (SCRAPFLY_API_KEY missing)',
    }
  }

  const result = await scrapflyFetch(url, {
    renderJs: options.renderJs ?? true,
    timeout: options.scrapflyTimeout || 45000,
  })

  return {
    success: result.success,
    html: result.html,
    url: result.url,
    statusCode: result.statusCode,
    method: 'scrapfly',
    duration: Date.now() - startTime,
    error: result.error,
  }
}

/**
 * Hybrid fetch - tries HTTP first, falls back to Scrapfly if needed
 */
export async function hybridFetch(
  url: string,
  options: HybridFetchOptions = {}
): Promise<FetchResult> {
  // Check if this domain is known to require Scrapfly
  const requiresScrapfly = needsScrapfly(url)

  // Skip HTTP if forced or known to need Scrapfly
  if (options.forceScrapfly || requiresScrapfly) {
    console.log(`[Hybrid] Using Scrapfly directly for: ${url}`)
    return tryScrapflyFetch(url, options)
  }

  // Try regular HTTP first
  console.log(`[Hybrid] Trying HTTP for: ${url}`)
  const httpResult = await tryHttpFetch(url, options)

  if (httpResult.success) {
    console.log(`[Hybrid] HTTP succeeded in ${httpResult.duration}ms`)
    return httpResult
  }

  // HTTP failed, try Scrapfly as fallback
  console.log(`[Hybrid] HTTP failed (${httpResult.error}), falling back to Scrapfly`)
  const scrapflyResult = await tryScrapflyFetch(url, options)

  if (scrapflyResult.success) {
    console.log(`[Hybrid] Scrapfly succeeded in ${scrapflyResult.duration}ms`)
  } else {
    console.log(`[Hybrid] Both methods failed for: ${url}`)
  }

  return scrapflyResult
}

/**
 * Fetch multiple URLs with hybrid approach
 */
export async function hybridFetchMultiple(
  urls: string[],
  options: HybridFetchOptions = {},
  delayMs: number = 500
): Promise<FetchResult[]> {
  const results: FetchResult[] = []

  for (let i = 0; i < urls.length; i++) {
    const result = await hybridFetch(urls[i], options)
    results.push(result)

    // Delay between requests
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Test a URL to determine the best fetch method
 * Useful for building a site configuration
 */
export async function testFetchMethod(url: string): Promise<{
  httpWorks: boolean
  scrapflyWorks: boolean
  recommended: 'http' | 'scrapfly' | 'none'
  httpResult?: FetchResult
  scrapflyResult?: FetchResult
}> {
  console.log(`[Test] Testing fetch methods for: ${url}`)

  // Test HTTP
  const httpResult = await tryHttpFetch(url, { httpTimeout: 10000 })

  // Test Scrapfly
  const scrapflyResult = await tryScrapflyFetch(url, {
    renderJs: true,
    scrapflyTimeout: 30000,
  })

  const httpWorks = httpResult.success
  const scrapflyWorks = scrapflyResult.success

  let recommended: 'http' | 'scrapfly' | 'none' = 'none'
  if (httpWorks) {
    recommended = 'http' // Prefer HTTP (free)
  } else if (scrapflyWorks) {
    recommended = 'scrapfly'
  }

  return {
    httpWorks,
    scrapflyWorks,
    recommended,
    httpResult,
    scrapflyResult,
  }
}

/**
 * Add a domain to the Scrapfly-required list at runtime
 */
export function addScrapflyRequiredDomain(domain: string): void {
  if (!SCRAPFLY_REQUIRED_DOMAINS.includes(domain.toLowerCase())) {
    SCRAPFLY_REQUIRED_DOMAINS.push(domain.toLowerCase())
  }
}
