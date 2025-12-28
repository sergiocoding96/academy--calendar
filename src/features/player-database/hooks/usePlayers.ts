'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPlayers } from '../lib/queries'
import { createPlayer } from '../lib/mutations'
import type { Player, PlayerFilters, PlayerInsert } from '../types'

interface UsePlayersReturn {
  players: Player[]
  loading: boolean
  error: Error | null
  filters: PlayerFilters
  setFilters: (filters: PlayerFilters) => void
  refetch: () => Promise<void>
  addPlayer: (data: PlayerInsert) => Promise<Player>
}

export function usePlayers(initialFilters: PlayerFilters = {}): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFiltersState] = useState<PlayerFilters>(initialFilters)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getPlayers(filters)
      setPlayers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch players'))
      setPlayers([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const setFilters = useCallback((newFilters: PlayerFilters) => {
    setFiltersState(newFilters)
  }, [])

  const addPlayer = useCallback(async (data: PlayerInsert): Promise<Player> => {
    try {
      const newPlayer = await createPlayer(data)
      setPlayers(prev => [...prev, newPlayer].sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      ))
      return newPlayer
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create player')
    }
  }, [])

  return {
    players,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchPlayers,
    addPlayer
  }
}
