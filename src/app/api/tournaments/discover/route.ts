/**
 * Tournament Discovery API
 *
 * Searches for tournaments based on selected sources and date range.
 * Queries both academy_tournaments and scraped_tournaments tables.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface DiscoverRequest {
  sources: string[]
  dateRange: {
    from: string
    to: string
  }
}

// Map source IDs to tournament_type values
const sourceToTypeMap: Record<string, string[]> = {
  'itf-juniors': ['itf'],
  'itf-seniors': ['itf'],
  'tennis-europe': ['tennis_europe'],
  'utr-events': ['utr'],
  'ate-spain': ['federation'],
  'rfet-spain': ['federation', 'national'],
  'lta-uk': ['federation', 'national'],
  'usta-usa': ['federation', 'national'],
  'fft-france': ['federation', 'national'],
  'dtb-germany': ['federation', 'national'],
  'fit-italy': ['federation', 'national'],
  'local-clubs': ['proximity', 'local'],
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoverRequest = await request.json()
    const { sources, dateRange } = body

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'At least one source must be selected' },
        { status: 400 }
      )
    }

    if (!dateRange?.from || !dateRange?.to) {
      return NextResponse.json(
        { error: 'Date range is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build list of tournament types to search for
    const tournamentTypes = new Set<string>()
    sources.forEach(source => {
      const types = sourceToTypeMap[source] || []
      types.forEach(t => tournamentTypes.add(t))
    })

    const typesArray = Array.from(tournamentTypes)

    // Query academy tournaments (approved/confirmed)
    const { data: academyTournaments, error: academyError } = await supabase
      .from('academy_tournaments')
      .select('*')
      .gte('start_date', dateRange.from)
      .lte('start_date', dateRange.to)
      .order('start_date')

    if (academyError) {
      console.error('Error fetching academy tournaments:', academyError)
    }

    // Query scraped tournaments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scrapedQuery = (supabase as any)
      .from('scraped_tournaments')
      .select('*')
      .gte('start_date', dateRange.from)
      .lte('start_date', dateRange.to)

    // Filter by tournament type if we have specific types
    if (typesArray.length > 0) {
      scrapedQuery = scrapedQuery.in('tournament_type', typesArray)
    }

    const { data: scrapedTournaments, error: scrapedError } = await scrapedQuery.order('start_date')

    if (scrapedError) {
      console.error('Error fetching scraped tournaments:', scrapedError)
    }

    // Combine results, marking source
    const tournaments = [
      ...(academyTournaments || []).map((t: Record<string, unknown>) => ({
        ...t,
        _source: 'academy',
      })),
      ...(scrapedTournaments || []).map((t: Record<string, unknown>) => ({
        ...t,
        _source: 'scraped',
      })),
    ]

    // Sort by start_date
    tournaments.sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date as string).getTime() : 0
      const dateB = b.start_date ? new Date(b.start_date as string).getTime() : 0
      return dateA - dateB
    })

    return NextResponse.json({
      success: true,
      tournaments,
      meta: {
        total: tournaments.length,
        academyCount: academyTournaments?.length || 0,
        scrapedCount: scrapedTournaments?.length || 0,
        sources,
        dateRange,
      },
    })

  } catch (error) {
    console.error('Discovery error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 }
    )
  }
}
