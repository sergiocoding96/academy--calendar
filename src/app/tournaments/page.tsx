'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Navigation } from '@/components/ui/navigation'
import { TournamentCalendar } from '@/components/tournament/tournament-calendar'
import { TournamentFilterBar } from '@/components/tournament/tournament-filter-bar'
import type { DateRange } from '@/components/tournament/date-range-picker'
import type { CalendarTournament } from '@/hooks/tournament'

interface DiscoveryFilters {
  sources: string[]
  dateRange: DateRange
}

export default function TournamentsPage() {
  // State for discovered tournaments
  const [tournaments, setTournaments] = useState<CalendarTournament[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discoveryMeta, setDiscoveryMeta] = useState<{
    total: number
    academyCount: number
    scrapedCount: number
  } | null>(null)

  // Current filter values (updated by filter bar)
  const [currentFilters, setCurrentFilters] = useState<DiscoveryFilters>({
    sources: [],
    dateRange: { from: new Date(), to: new Date() },
  })

  // Handle filter changes from the filter bar
  const handleFiltersChange = useCallback((filters: DiscoveryFilters) => {
    setCurrentFilters(filters)
  }, [])

  // Handle discover button click
  const handleDiscover = useCallback(async () => {
    const { sources, dateRange } = currentFilters

    if (sources.length === 0) {
      setError('Please select at least one source')
      return
    }

    if (!dateRange.from || !dateRange.to) {
      setError('Please select a date range')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tournaments/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources,
          dateRange: {
            from: format(dateRange.from, 'yyyy-MM-dd'),
            to: format(dateRange.to, 'yyyy-MM-dd'),
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Discovery failed')
      }

      const data = await response.json()

      if (data.success) {
        // Transform the response to match CalendarTournament type
        const transformedTournaments: CalendarTournament[] = data.tournaments.map((t: Record<string, unknown>) => ({
          id: t.id as string,
          name: t.name as string,
          start_date: t.start_date as string,
          end_date: t.end_date as string | null,
          location: t.location as string | null,
          tournament_type: t.tournament_type as string | null,
          category: t.category as string | null,
          level: t.level as string | null,
          surface: t.surface as string | null,
          entry_deadline: t.entry_deadline as string | null,
          website: t.website as string | null,
          country: t.country as string | null,
        }))

        setTournaments(transformedTournaments)
        setDiscoveryMeta(data.meta)
      } else {
        throw new Error(data.error || 'Discovery failed')
      }
    } catch (err) {
      console.error('Discovery error:', err)
      setError(err instanceof Error ? err.message : 'Discovery failed')
    } finally {
      setIsLoading(false)
    }
  }, [currentFilters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      <Navigation />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-800">Tournament Calendar</h1>
          <p className="text-stone-500 mt-1">View and manage tournament schedule, trips, and player entries</p>
        </div>

        {/* Filter Bar */}
        <TournamentFilterBar
          className="mb-6"
          onFiltersChange={handleFiltersChange}
          onRefresh={handleDiscover}
          isRefreshing={isLoading}
        />

        {/* Discovery Results Summary */}
        {discoveryMeta && tournaments && tournaments.length > 0 && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Found {discoveryMeta.total} tournaments
              </span>
              <span className="text-emerald-600 text-sm">
                ({discoveryMeta.academyCount} academy, {discoveryMeta.scrapedCount} external)
              </span>
            </div>
          </div>
        )}

        {/* Calendar with discovered tournaments */}
        <TournamentCalendar
          tournaments={tournaments}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </div>
  )
}
