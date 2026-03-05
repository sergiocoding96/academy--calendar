'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPlayerInjuries, getActiveInjuries } from '../lib/queries'
import { createInjury, updateInjury, clearInjury, deleteInjury } from '../lib/mutations'
import type { Injury, InjuryInsert, InjuryUpdate } from '../types'

interface UseInjuriesOptions {
  activeOnly?: boolean
}

interface UseInjuriesReturn {
  injuries: Injury[]
  activeInjuries: Injury[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addInjury: (data: Omit<InjuryInsert, 'player_id'>) => Promise<Injury>
  updateInjury: (injuryId: string, data: InjuryUpdate) => Promise<void>
  clearInjury: (injuryId: string, returnDate: string) => Promise<void>
  removeInjury: (injuryId: string) => Promise<void>
  hasActiveInjury: boolean
}

export function useInjuries(
  playerId: string | null,
  options: UseInjuriesOptions = {}
): UseInjuriesReturn {
  const { activeOnly = false } = options
  const [injuries, setInjuries] = useState<Injury[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInjuries = useCallback(async () => {
    if (!playerId) {
      setInjuries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = activeOnly
        ? await getActiveInjuries(playerId)
        : await getPlayerInjuries(playerId)
      setInjuries(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch injuries'))
      setInjuries([])
    } finally {
      setLoading(false)
    }
  }, [playerId, activeOnly])

  useEffect(() => {
    fetchInjuries()
  }, [fetchInjuries])

  const addInjury = useCallback(async (data: Omit<InjuryInsert, 'player_id'>): Promise<Injury> => {
    if (!playerId) throw new Error('No player ID provided')

    try {
      const newInjury = await createInjury({ ...data, player_id: playerId })
      setInjuries(prev => [newInjury, ...prev])
      return newInjury
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add injury')
    }
  }, [playerId])

  const updateInjuryHandler = useCallback(async (injuryId: string, data: InjuryUpdate) => {
    try {
      const updated = await updateInjury(injuryId, data)
      setInjuries(prev =>
        prev.map(injury => injury.id === injuryId ? updated : injury)
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update injury')
    }
  }, [])

  const clearInjuryHandler = useCallback(async (injuryId: string, returnDate: string) => {
    try {
      await clearInjury(injuryId, returnDate)
      setInjuries(prev =>
        prev.map(injury =>
          injury.id === injuryId
            ? { ...injury, status: 'cleared' as const, return_date: returnDate }
            : injury
        )
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to clear injury')
    }
  }, [])

  const removeInjury = useCallback(async (injuryId: string) => {
    try {
      await deleteInjury(injuryId)
      setInjuries(prev => prev.filter(injury => injury.id !== injuryId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete injury')
    }
  }, [])

  // Derived state
  const activeInjuries = injuries.filter(injury => injury.status !== 'cleared')
  const hasActiveInjury = activeInjuries.length > 0

  return {
    injuries,
    activeInjuries,
    loading,
    error,
    refetch: fetchInjuries,
    addInjury,
    updateInjury: updateInjuryHandler,
    clearInjury: clearInjuryHandler,
    removeInjury,
    hasActiveInjury
  }
}
