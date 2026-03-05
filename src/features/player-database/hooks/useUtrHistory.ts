'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getPlayerUtrHistory } from '../lib/queries'
import { addUtrEntry, deleteUtrEntry } from '../lib/mutations'
import type { UtrHistory, UtrHistoryInsert, DateRange } from '../types'

interface UseUtrHistoryOptions {
  dateRange?: DateRange
}

interface UtrStats {
  currentUtr: number | null
  highestUtr: number | null
  lowestUtr: number | null
  averageUtr: number | null
  totalEntries: number
  utrChange: number | null // Change from oldest to newest
}

interface UseUtrHistoryReturn {
  utrHistory: UtrHistory[]
  loading: boolean
  error: Error | null
  stats: UtrStats
  refetch: () => Promise<void>
  addEntry: (data: Omit<UtrHistoryInsert, 'player_id'>) => Promise<UtrHistory>
  removeEntry: (entryId: string) => Promise<void>
}

export function useUtrHistory(
  playerId: string | null,
  options: UseUtrHistoryOptions = {}
): UseUtrHistoryReturn {
  const { dateRange } = options
  const [utrHistory, setUtrHistory] = useState<UtrHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Serialize dateRange to avoid infinite loops from object reference changes
  const dateRangeKey = dateRange ? `${dateRange.start?.getTime() ?? ''}_${dateRange.end?.getTime() ?? ''}` : ''

  const fetchUtrHistory = useCallback(async () => {
    if (!playerId) {
      setUtrHistory([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getPlayerUtrHistory(playerId, dateRange)
      setUtrHistory(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch UTR history'))
      setUtrHistory([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, dateRangeKey])

  useEffect(() => {
    fetchUtrHistory()
  }, [fetchUtrHistory])

  const addEntry = useCallback(async (data: Omit<UtrHistoryInsert, 'player_id'>): Promise<UtrHistory> => {
    if (!playerId) throw new Error('No player ID provided')

    try {
      const newEntry = await addUtrEntry({ ...data, player_id: playerId })
      setUtrHistory(prev => [newEntry, ...prev].sort((a, b) =>
        new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
      ))
      return newEntry
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add UTR entry')
    }
  }, [playerId])

  const removeEntry = useCallback(async (entryId: string) => {
    try {
      await deleteUtrEntry(entryId)
      setUtrHistory(prev => prev.filter(entry => entry.id !== entryId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete UTR entry')
    }
  }, [])

  // Calculate UTR statistics
  const stats = useMemo((): UtrStats => {
    if (utrHistory.length === 0) {
      return {
        currentUtr: null,
        highestUtr: null,
        lowestUtr: null,
        averageUtr: null,
        totalEntries: 0,
        utrChange: null
      }
    }

    const utrValues = utrHistory.map(h => h.utr_value)
    const sortedByDate = [...utrHistory].sort((a, b) =>
      new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
    )

    const currentUtr = sortedByDate[0]?.utr_value ?? null
    const oldestUtr = sortedByDate[sortedByDate.length - 1]?.utr_value ?? null

    return {
      currentUtr,
      highestUtr: Math.max(...utrValues),
      lowestUtr: Math.min(...utrValues),
      averageUtr: utrValues.reduce((sum, v) => sum + v, 0) / utrValues.length,
      totalEntries: utrHistory.length,
      utrChange: currentUtr !== null && oldestUtr !== null
        ? currentUtr - oldestUtr
        : null
    }
  }, [utrHistory])

  return {
    utrHistory,
    loading,
    error,
    stats,
    refetch: fetchUtrHistory,
    addEntry,
    removeEntry
  }
}
