'use client'

import { useState, useCallback, useMemo } from 'react'
import { LayoutGrid, List, Users, Plus, RefreshCw } from 'lucide-react'
import { PlayerCard } from './PlayerCard'
import { PlayerTable } from './PlayerTable'
import { PlayerSearch } from './PlayerSearch'
import { PlayerFilters } from './PlayerFilters'
import { usePlayers } from '../hooks'
import { cn } from '@/lib/utils'
import type { Player, PlayerFilters as PlayerFiltersType, Profile } from '../types'

type ViewMode = 'grid' | 'table'

interface PlayerListProps {
  initialFilters?: PlayerFiltersType
  coaches?: Profile[]
  getPlayerHref?: (player: Player) => string
  onPlayerClick?: (player: Player) => void
  onAddPlayer?: () => void
  showAddButton?: boolean
  activeInjuryIds?: Set<string>
  className?: string
}

export function PlayerList({
  initialFilters = {},
  coaches = [],
  getPlayerHref,
  onPlayerClick,
  onAddPlayer,
  showAddButton = true,
  activeInjuryIds = new Set(),
  className,
}: PlayerListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { players, loading, error, filters, setFilters, refetch } = usePlayers(initialFilters)

  const handleSearchChange = useCallback(
    (search: string) => {
      setFilters({ ...filters, search: search || undefined })
    },
    [filters, setFilters]
  )

  const handleFiltersChange = useCallback(
    (newFilters: PlayerFiltersType) => {
      setFilters(newFilters)
    },
    [setFilters]
  )

  // Filter players by search term (client-side for quick filtering)
  const filteredPlayers = useMemo(() => {
    if (!filters.search) return players
    const searchLower = filters.search.toLowerCase()
    return players.filter(
      (player) =>
        player.full_name.toLowerCase().includes(searchLower) ||
        player.nickname?.toLowerCase().includes(searchLower) ||
        player.email?.toLowerCase().includes(searchLower)
    )
  }, [players, filters.search])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Players
            <span className="text-sm font-normal text-stone-500">
              ({filteredPlayers.length})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              )}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>

          {/* Add Button */}
          {showAddButton && onAddPlayer && (
            <button
              onClick={onAddPlayer}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <PlayerSearch
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="w-full lg:w-80"
        />
        <PlayerFilters
          filters={filters}
          onChange={handleFiltersChange}
          coaches={coaches}
          className="flex-1"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading players</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-stone-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-stone-200 rounded w-32 mb-2" />
                  <div className="h-4 bg-stone-200 rounded w-20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-stone-100 rounded-lg" />
                <div className="h-16 bg-stone-100 rounded-lg" />
                <div className="h-16 bg-stone-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPlayers.length === 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">
            {filters.search || Object.keys(filters).length > 1
              ? 'No players match your filters'
              : 'No players yet'}
          </h3>
          <p className="text-stone-500 mb-4">
            {filters.search || Object.keys(filters).length > 1
              ? 'Try adjusting your search or filters'
              : 'Add your first player to get started'}
          </p>
          {showAddButton && onAddPlayer && !filters.search && (
            <button
              onClick={onAddPlayer}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && filteredPlayers.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              hasActiveInjury={activeInjuryIds.has(player.id)}
              href={getPlayerHref?.(player)}
              onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && filteredPlayers.length > 0 && viewMode === 'table' && (
        <PlayerTable
          players={filteredPlayers}
          activeInjuryIds={activeInjuryIds}
          getHref={getPlayerHref}
          onPlayerClick={onPlayerClick}
        />
      )}
    </div>
  )
}
