'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CIRCUITS, getHttpCircuits, getScrapflyCircuits, type CircuitInfo } from '@/lib/agent/scraper/circuits-config'

const STORAGE_KEY = 'tournament-sources-selected'

export interface UseTournamentSourcesReturn {
  // All circuits
  circuits: CircuitInfo[]
  httpCircuits: CircuitInfo[]
  scrapflyCircuits: CircuitInfo[]

  // Selection state
  selectedIds: string[]
  selectedCircuits: CircuitInfo[]

  // Actions
  selectCircuit: (id: string) => void
  deselectCircuit: (id: string) => void
  toggleCircuit: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  selectAllHttp: () => void
  selectAllScrapfly: () => void
  selectByCategory: (category: string) => void

  // State helpers
  isSelected: (id: string) => boolean
  hasScrapflySelected: boolean
  selectedCount: number
}

/**
 * Hook for managing tournament circuit source selection
 * Persists selection to localStorage
 */
export function useTournamentSources(): UseTournamentSourcesReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Validate that stored IDs still exist in CIRCUITS
          const validIds = parsed.filter((id: string) =>
            CIRCUITS.some(c => c.id === id)
          )
          setSelectedIds(validIds)
        }
      } else {
        // Default: select all HTTP circuits (free)
        setSelectedIds(getHttpCircuits().map(c => c.id))
      }
    } catch (error) {
      console.error('Error loading tournament sources from localStorage:', error)
      // Fallback to HTTP circuits
      setSelectedIds(getHttpCircuits().map(c => c.id))
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage when selection changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds))
      } catch (error) {
        console.error('Error saving tournament sources to localStorage:', error)
      }
    }
  }, [selectedIds, isInitialized])

  // Memoized circuit lists
  const httpCircuits = useMemo(() => getHttpCircuits(), [])
  const scrapflyCircuits = useMemo(() => getScrapflyCircuits(), [])

  // Memoized selected circuits
  const selectedCircuits = useMemo(() =>
    CIRCUITS.filter(c => selectedIds.includes(c.id)),
    [selectedIds]
  )

  // Selection actions
  const selectCircuit = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const deselectCircuit = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id))
  }, [])

  const toggleCircuit = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      }
      return [...prev, id]
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(CIRCUITS.map(c => c.id))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds([])
  }, [])

  const selectAllHttp = useCallback(() => {
    setSelectedIds(httpCircuits.map(c => c.id))
  }, [httpCircuits])

  const selectAllScrapfly = useCallback(() => {
    setSelectedIds(scrapflyCircuits.map(c => c.id))
  }, [scrapflyCircuits])

  const selectByCategory = useCallback((category: string) => {
    const matching = CIRCUITS.filter(c => c.categories.includes(category))
    setSelectedIds(matching.map(c => c.id))
  }, [])

  // Helper functions
  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds])

  const hasScrapflySelected = useMemo(() =>
    selectedIds.some(id => scrapflyCircuits.some(c => c.id === id)),
    [selectedIds, scrapflyCircuits]
  )

  return {
    // All circuits
    circuits: CIRCUITS,
    httpCircuits,
    scrapflyCircuits,

    // Selection state
    selectedIds,
    selectedCircuits,

    // Actions
    selectCircuit,
    deselectCircuit,
    toggleCircuit,
    selectAll,
    deselectAll,
    selectAllHttp,
    selectAllScrapfly,
    selectByCategory,

    // State helpers
    isSelected,
    hasScrapflySelected,
    selectedCount: selectedIds.length,
  }
}
