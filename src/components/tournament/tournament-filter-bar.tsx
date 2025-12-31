'use client'

import { useState, useCallback, useRef } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SourcesSelector } from './sources-selector'
import { DateRangePicker, type DateRange } from './date-range-picker'
import { addWeeks } from 'date-fns'

interface TournamentFilterBarProps {
  className?: string
  onFiltersChange?: (filters: {
    sources: string[]
    dateRange: DateRange
  }) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function TournamentFilterBar({
  className,
  onFiltersChange,
  onRefresh,
  isRefreshing = false,
}: TournamentFilterBarProps) {
  // Use refs to avoid stale closures in callbacks
  const sourcesRef = useRef<string[]>([])
  const dateRangeRef = useRef<DateRange>({
    from: new Date(),
    to: addWeeks(new Date(), 8),
  })

  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addWeeks(new Date(), 8),
  })

  const handleSourcesChange = useCallback((sources: string[]) => {
    sourcesRef.current = sources
    setSelectedSources(sources)
    onFiltersChange?.({ sources, dateRange: dateRangeRef.current })
  }, [onFiltersChange])

  const handleDateRangeChange = useCallback((range: DateRange) => {
    dateRangeRef.current = range
    setDateRange(range)
    onFiltersChange?.({ sources: sourcesRef.current, dateRange: range })
  }, [onFiltersChange])

  const handleRefresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  return (
    <div className={cn(
      'bg-white rounded-2xl border border-stone-200 shadow-lg p-4',
      className
    )}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SourcesSelector onSelectionChange={handleSourcesChange} />
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Scrape/Refresh Button - Phase 3 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || selectedSources.length === 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
              'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25',
              'hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg'
            )}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scraping...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Discover</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-stone-500">
          <span>
            <strong className="text-stone-700">{selectedSources.length}</strong> sources selected
          </span>
          <span className="text-stone-300">|</span>
          <span>
            Results will be cached for faster loading
          </span>
        </div>
        <div className="text-xs text-stone-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
