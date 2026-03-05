'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getPlayerWhereabouts, getUpcomingWhereabouts } from '../lib/queries'
import { createWhereabouts, updateWhereabouts, deleteWhereabouts } from '../lib/mutations'
import type { Whereabouts, WhereaboutsInsert, WhereaboutsUpdate, DateRange } from '../types'

interface UseWhereaboutsOptions {
  dateRange?: DateRange
  upcomingOnly?: boolean
  /** Optional initial data to avoid first client fetch. */
  initialData?: Whereabouts[]
}

interface UseWhereaboutsReturn {
  whereabouts: Whereabouts[]
  upcomingWhereabouts: Whereabouts[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addWhereabouts: (data: Omit<WhereaboutsInsert, 'player_id'>) => Promise<Whereabouts>
  updateWhereabouts: (whereaboutsId: string, data: WhereaboutsUpdate) => Promise<void>
  removeWhereabouts: (whereaboutsId: string) => Promise<void>
  getWhereaboutsForDate: (date: string) => Whereabouts | undefined
}

export function useWhereabouts(
  playerId: string | null,
  options: UseWhereaboutsOptions = {}
): UseWhereaboutsReturn {
  const { dateRange, upcomingOnly = false, initialData } = options
  const [whereabouts, setWhereabouts] = useState<Whereabouts[]>(initialData ?? [])
  const [loading, setLoading] = useState(initialData === undefined)
  const [error, setError] = useState<Error | null>(null)
  const hasSkippedInitialFetch = useRef(false)

  // Serialize dateRange to avoid infinite loops from object reference changes
  const dateRangeKey = dateRange ? `${dateRange.start?.getTime() ?? ''}_${dateRange.end?.getTime() ?? ''}` : ''

  const fetchWhereabouts = useCallback(async () => {
    if (!playerId) {
      setWhereabouts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = upcomingOnly
        ? await getUpcomingWhereabouts(playerId)
        : await getPlayerWhereabouts(playerId, dateRange)
      setWhereabouts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch whereabouts'))
      setWhereabouts([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, dateRangeKey, upcomingOnly])

  useEffect(() => {
    if (initialData !== undefined && !hasSkippedInitialFetch.current) {
      hasSkippedInitialFetch.current = true
      return
    }
    fetchWhereabouts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWhereabouts])

  const addWhereabouts = useCallback(async (data: Omit<WhereaboutsInsert, 'player_id'>): Promise<Whereabouts> => {
    if (!playerId) throw new Error('No player ID provided')

    try {
      const newWhereabouts = await createWhereabouts({ ...data, player_id: playerId })
      setWhereabouts(prev => [...prev, newWhereabouts].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ))
      return newWhereabouts
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add whereabouts')
    }
  }, [playerId])

  const updateWhereaboutsHandler = useCallback(async (whereaboutsId: string, data: WhereaboutsUpdate) => {
    try {
      const updated = await updateWhereabouts(whereaboutsId, data)
      setWhereabouts(prev =>
        prev.map(w => w.id === whereaboutsId ? updated : w)
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update whereabouts')
    }
  }, [])

  const removeWhereabouts = useCallback(async (whereaboutsId: string) => {
    try {
      await deleteWhereabouts(whereaboutsId)
      setWhereabouts(prev => prev.filter(w => w.id !== whereaboutsId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete whereabouts')
    }
  }, [])

  // Helper to get whereabouts for a specific date (checks if date falls within start_date and end_date)
  const getWhereaboutsForDate = useCallback((date: string): Whereabouts | undefined => {
    return whereabouts.find(w => w.start_date <= date && w.end_date >= date)
  }, [whereabouts])

  // Derived state - upcoming whereabouts (memoized to prevent unnecessary re-renders)
  const upcomingWhereabouts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return whereabouts.filter(w => w.end_date >= today)
  }, [whereabouts])

  return {
    whereabouts,
    upcomingWhereabouts,
    loading,
    error,
    refetch: fetchWhereabouts,
    addWhereabouts,
    updateWhereabouts: updateWhereaboutsHandler,
    removeWhereabouts,
    getWhereaboutsForDate
  }
}
