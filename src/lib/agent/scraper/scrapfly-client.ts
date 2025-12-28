/**
 * Scrapfly Client - Wrapper for Scrapfly web scraping API
 *
 * Simple, reliable web scraping without managing proxies or anti-bot detection.
 * Free tier: 1,000 requests/month (plenty for weekly scrapes)
 */

export interface ScrapflyConfig {
  apiKey: string
  /** Enable JavaScript rendering (costs more API credits) */
  renderJs?: boolean
  /** Wait for specific element before returning */
  waitForSelector?: string
  /** Request timeout in milliseconds */
  timeout?: number
  /** Country for proxy location */
  country?: string
}

export interface ScrapflyResponse {
  success: boolean
  html: string | null
  url: string
  statusCode: number
  error?: string
}

const SCRAPFLY_API_URL = 'https://api.scrapfly.io/scrape'

/**
 * Check if Scrapfly is configured
 */
export function isScrapflyConfigured(): boolean {
  return !!process.env.SCRAPFLY_API_KEY
}

/**
 * Fetch a URL using Scrapfly
 */
export async function scrapflyFetch(
  url: string,
  options: Partial<ScrapflyConfig> = {}
): Promise<ScrapflyResponse> {
  const apiKey = process.env.SCRAPFLY_API_KEY

  if (!apiKey) {
    return {
      success: false,
      html: null,
      url,
      statusCode: 0,
      error: 'SCRAPFLY_API_KEY not configured',
    }
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      key: apiKey,
      url: url,
    })

    // Optional: JavaScript rendering (for dynamic sites)
    if (options.renderJs) {
      params.append('render_js', 'true')
    }

    // Optional: Wait for element (useful for SPAs)
    if (options.waitForSelector) {
      params.append('wait_for_selector', options.waitForSelector)
    }

    // Optional: Proxy country
    if (options.country) {
      params.append('country', options.country)
    }

    const response = await fetch(`${SCRAPFLY_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(options.timeout || 60000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        html: null,
        url,
        statusCode: response.status,
        error: `Scrapfly error: ${response.status} - ${errorText}`,
      }
    }

    const data = await response.json()

    // Scrapfly returns the result in a specific structure
    if (data.result?.content) {
      return {
        success: true,
        html: data.result.content,
        url: data.result.url || url,
        statusCode: data.result.status_code || 200,
      }
    }

    return {
      success: false,
      html: null,
      url,
      statusCode: 0,
      error: 'Unexpected Scrapfly response format',
    }
  } catch (error) {
    return {
      success: false,
      html: null,
      url,
      statusCode: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch multiple URLs with Scrapfly (respects rate limits)
 */
export async function scrapflyFetchMultiple(
  urls: string[],
  options: Partial<ScrapflyConfig> = {},
  delayMs: number = 500
): Promise<ScrapflyResponse[]> {
  const results: ScrapflyResponse[] = []

  for (let i = 0; i < urls.length; i++) {
    const result = await scrapflyFetch(urls[i], options)
    results.push(result)

    // Delay between requests to be nice to the API
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}
