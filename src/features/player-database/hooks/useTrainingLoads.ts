'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getPlayerTrainingLoads } from '../lib/queries'
import { createTrainingLoadAction, updateTrainingLoadAction, deleteTrainingLoadAction } from '../actions'
import type { TrainingLoad, TrainingLoadInsert, TrainingLoadUpdate, DateRange } from '../types'

interface UseTrainingLoadsOptions {
  dateRange?: DateRange
  /** Optional initial data to avoid first client fetch. */
  initialData?: TrainingLoad[]
}

interface UseTrainingLoadsReturn {
  trainingLoads: TrainingLoad[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addLoad: (data: Omit<TrainingLoadInsert, 'player_id'>) => Promise<TrainingLoad>
  updateLoad: (loadId: string, data: TrainingLoadUpdate) => Promise<void>
  removeLoad: (loadId: string) => Promise<void>
  averageRpe: number | null
  totalMinutes: number
}

export function useTrainingLoads(
  playerId: string | null,
  options: UseTrainingLoadsOptions = {}
): UseTrainingLoadsReturn {
  const { dateRange, initialData } = options
  const [trainingLoads, setTrainingLoads] = useState<TrainingLoad[]>(initialData ?? [])
  const [loading, setLoading] = useState(initialData === undefined)
  const [error, setError] = useState<Error | null>(null)
  const hasSkippedInitialFetch = useRef(false)

  // Serialize dateRange to avoid infinite loops from object reference changes
  const dateRangeKey = dateRange ? `${dateRange.start?.getTime() ?? ''}_${dateRange.end?.getTime() ?? ''}` : ''

  const fetchLoads = useCallback(async () => {
    if (!playerId) {
      setTrainingLoads([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getPlayerTrainingLoads(playerId, dateRange)
      setTrainingLoads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch training loads'))
      setTrainingLoads([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, dateRangeKey])

  useEffect(() => {
    if (initialData !== undefined && !hasSkippedInitialFetch.current) {
      hasSkippedInitialFetch.current = true
      return
    }
    fetchLoads()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLoads])

  const addLoad = useCallback(async (data: Omit<TrainingLoadInsert, 'player_id'>): Promise<TrainingLoad> => {
    if (!playerId) throw new Error('No player ID provided')

    try {
      const newLoad = await createTrainingLoadAction({ ...data, player_id: playerId })
      setTrainingLoads(prev => [newLoad, ...prev])
      return newLoad
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add training load')
    }
  }, [playerId])

  const updateLoad = useCallback(async (loadId: string, data: TrainingLoadUpdate) => {
    try {
      const updated = await updateTrainingLoadAction(playerId!, loadId, data)
      setTrainingLoads(prev =>
        prev.map(load => load.id === loadId ? updated : load)
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update training load')
    }
  }, [])

  const removeLoad = useCallback(async (loadId: string) => {
    try {
      await deleteTrainingLoadAction(playerId!, loadId)
      setTrainingLoads(prev => prev.filter(load => load.id !== loadId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete training load')
    }
  }, [])

  // Calculate stats (memoized to prevent recalculation every render)
  const averageRpe = useMemo(() => trainingLoads.length > 0
    ? trainingLoads.reduce((sum, load) => sum + (load.rpe || 0), 0) / trainingLoads.length
    : null, [trainingLoads])

  const totalMinutes = useMemo(() => trainingLoads.reduce((sum, load) => sum + (load.duration_minutes || 0), 0), [trainingLoads])

  return {
    trainingLoads,
    loading,
    error,
    refetch: fetchLoads,
    addLoad,
    updateLoad,
    removeLoad,
    averageRpe,
    totalMinutes
  }
}
