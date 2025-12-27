'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPlayer, getPlayerWithDetails } from '../lib/queries'
import { updatePlayer, deletePlayer, togglePlayerActive } from '../lib/mutations'
import type { Player, PlayerWithDetails, PlayerUpdate } from '../types'

interface UsePlayerOptions {
  withDetails?: boolean
}

interface UsePlayerReturn {
  player: Player | PlayerWithDetails | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  update: (data: PlayerUpdate) => Promise<void>
  remove: () => Promise<void>
  toggleActive: (isActive: boolean) => Promise<void>
}

export function usePlayer(
  playerId: string | null,
  options: UsePlayerOptions = {}
): UsePlayerReturn {
  const { withDetails = false } = options
  const [player, setPlayer] = useState<Player | PlayerWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPlayer = useCallback(async () => {
    if (!playerId) {
      setPlayer(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = withDetails
        ? await getPlayerWithDetails(playerId)
        : await getPlayer(playerId)
      setPlayer(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch player'))
    } finally {
      setLoading(false)
    }
  }, [playerId, withDetails])

  useEffect(() => {
    fetchPlayer()
  }, [fetchPlayer])

  const update = useCallback(async (data: PlayerUpdate) => {
    if (!playerId) return

    try {
      const updated = await updatePlayer(playerId, data)
      if (updated) {
        setPlayer(prev => prev ? { ...prev, ...updated } as Player | PlayerWithDetails : updated)
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update player')
    }
  }, [playerId])

  const remove = useCallback(async () => {
    if (!playerId) return

    try {
      await deletePlayer(playerId)
      setPlayer(null)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete player')
    }
  }, [playerId])

  const toggleActive = useCallback(async (isActive: boolean) => {
    if (!playerId) return

    try {
      const updated = await togglePlayerActive(playerId, isActive)
      if (updated) {
        setPlayer(prev => prev ? { ...prev, ...updated } as Player | PlayerWithDetails : updated)
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle player status')
    }
  }, [playerId])

  return {
    player,
    loading,
    error,
    refetch: fetchPlayer,
    update,
    remove,
    toggleActive
  }
}
