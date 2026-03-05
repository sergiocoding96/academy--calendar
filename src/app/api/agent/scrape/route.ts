/**
 * Tournament Scrape API - Scheduled scraping endpoint
 *
 * Triggered by Vercel Cron (weekly) to fetch tournaments from external sources.
 * Stores results in scraped_tournaments table for review.
 *
 * Cron config in vercel.json:
 * { "crons": [{ "path": "/api/agent/scrape", "schedule": "0 6 * * 1" }] }
 * (Runs every Monday at 6:00 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server'
import { scrapeUpcomingITFJuniors, isScrapflyConfigured } from '@/lib/agent/scraper'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for scraping

/**
 * Verify cron secret for scheduled jobs
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In development, allow without secret
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // Vercel sends: Authorization: Bearer <CRON_SECRET>
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check Scrapfly configuration
  if (!isScrapflyConfigured()) {
    return NextResponse.json(
      {
        error: 'Scraper not configured',
        message: 'Add SCRAPFLY_API_KEY to environment variables',
      },
      { status: 503 }
    )
  }

  const startTime = Date.now()
  const results = {
    success: false,
    tournamentsFound: 0,
    tournamentsSaved: 0,
    errors: [] as string[],
    duration: 0,
  }

  try {
    console.log('[Scrape Cron] Starting scheduled tournament scrape...')

    // Scrape ITF junior tournaments
    const itfResult = await scrapeUpcomingITFJuniors()

    if (!itfResult.success) {
      results.errors.push(...itfResult.errors)
    }

    results.tournamentsFound = itfResult.tournaments.length
    console.log(`[Scrape Cron] Found ${results.tournamentsFound} tournaments`)

    // Save to database if we found tournaments
    if (itfResult.tournaments.length > 0) {
      const supabase = await createClient()

      // Prepare data for upsert
      const tournamentsData = itfResult.tournaments.map(t => ({
        id: t.id,
        source_id: t.source_id,
        external_id: t.external_id || t.id,
        name: t.name,
        start_date: t.start_date || null,
        end_date: t.end_date || null,
        location: t.location || null,
        country: t.country || null,
        category: t.category || null,
        tournament_type: t.tournament_type || null,
        level: t.level || null,
        surface: t.surface || null,
        entry_deadline: t.entry_deadline || null,
        website: t.website || null,
        status: 'pending' as const,
        scraped_at: new Date().toISOString(),
        raw_data: t.raw_data || {},
      }))

      // Use RPC or raw insert to bypass type checking for dynamic tables
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (supabase as any)
        .from('scraped_tournaments')
        .upsert(tournamentsData, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })

      if (upsertError) {
        results.errors.push(`Database error: ${upsertError.message}`)
      } else {
        results.tournamentsSaved = tournamentsData.length
      }

      // Log the scrape job — field names match the ScrapeLog type in src/types/agent.ts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('scrape_logs').insert({
        source_id: 'itf',
        status: results.errors.length === 0 ? 'completed' : 'failed',
        tournaments_found: results.tournamentsFound,
        tournaments_new: results.tournamentsSaved,
        errors: results.errors.length > 0 ? results.errors : null,
        duration_ms: Date.now() - startTime,
      })
    }

    results.success = results.errors.length === 0
    results.duration = Date.now() - startTime

    console.log(`[Scrape Cron] Completed in ${results.duration}ms`)

    return NextResponse.json(results, {
      status: results.success ? 200 : 207, // 207 = partial success
    })

  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    results.duration = Date.now() - startTime

    console.error('[Scrape Cron] Failed:', error)

    return NextResponse.json(results, { status: 500 })
  }
}

// Also support POST for manual triggers from admin UI
// Separated from GET so the cron-secret check does not apply to user-initiated requests.
export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Only admins/coaches may trigger manual scrapes to protect Scrapfly quota
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!profile || !['coach', 'admin'].includes((profile as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Run the actual scrape logic directly (not via GET to avoid cron-secret check)
  if (!isScrapflyConfigured()) {
    return NextResponse.json(
      { error: 'Scraper not configured', message: 'Add SCRAPFLY_API_KEY to environment variables' },
      { status: 503 }
    )
  }

  const startTime = Date.now()
  const results = { success: false, tournamentsFound: 0, tournamentsSaved: 0, errors: [] as string[], duration: 0 }

  try {
    const itfResult = await scrapeUpcomingITFJuniors()
    if (!itfResult.success) results.errors.push(...itfResult.errors)
    results.tournamentsFound = itfResult.tournaments.length

    if (itfResult.tournaments.length > 0) {
      const db = await createClient()
      const tournamentsData = itfResult.tournaments.map(t => ({
        id: t.id, source_id: t.source_id, external_id: t.external_id || t.id,
        name: t.name, start_date: t.start_date || null, end_date: t.end_date || null,
        location: t.location || null, country: t.country || null, category: t.category || null,
        tournament_type: t.tournament_type || null, level: t.level || null, surface: t.surface || null,
        entry_deadline: t.entry_deadline || null, website: t.website || null,
        status: 'pending' as const, scraped_at: new Date().toISOString(), raw_data: t.raw_data || {},
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (db as any).from('scraped_tournaments').upsert(tournamentsData, { onConflict: 'id', ignoreDuplicates: false })
      if (upsertError) results.errors.push(`Database error: ${upsertError.message}`)
      else results.tournamentsSaved = tournamentsData.length
    }

    results.success = results.errors.length === 0
    results.duration = Date.now() - startTime
    return NextResponse.json(results, { status: results.success ? 200 : 207 })
  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    results.duration = Date.now() - startTime
    return NextResponse.json(results, { status: 500 })
  }
}
