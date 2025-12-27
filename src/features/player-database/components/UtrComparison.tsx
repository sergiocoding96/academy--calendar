'use client'

import { useMemo } from 'react'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import { usePlayers } from '../hooks'
import { cn } from '@/lib/utils'

interface UtrComparisonProps {
  currentPlayerId?: string
  className?: string
}

export function UtrComparison({ currentPlayerId, className }: UtrComparisonProps) {
  const { players, loading } = usePlayers()

  const sortedPlayers = useMemo(() => {
    return [...players]
      .filter(p => p.current_utr !== null && p.current_utr > 0)
      .sort((a, b) => (b.current_utr || 0) - (a.current_utr || 0))
  }, [players])

  const stats = useMemo(() => {
    if (sortedPlayers.length === 0) return null

    const utrs = sortedPlayers.map(p => p.current_utr || 0)
    const avg = utrs.reduce((a, b) => a + b, 0) / utrs.length
    const max = Math.max(...utrs)
    const min = Math.min(...utrs)

    return { avg, max, min, count: sortedPlayers.length }
  }, [sortedPlayers])

  const currentPlayerRank = useMemo(() => {
    if (!currentPlayerId) return null
    const index = sortedPlayers.findIndex(p => p.id === currentPlayerId)
    return index >= 0 ? index + 1 : null
  }, [sortedPlayers, currentPlayerId])

  if (loading) {
    return (
      <div className={cn('bg-white rounded-xl border border-stone-200 p-6', className)}>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (sortedPlayers.length === 0) {
    return (
      <div className={cn('bg-white rounded-xl border border-stone-200 p-6 text-center', className)}>
        <Users className="w-12 h-12 mx-auto mb-4 text-stone-300" />
        <p className="text-stone-600">No UTR data available for comparison</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-xl border border-stone-200', className)}>
      {/* Header */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">Academy UTR Rankings</h3>
            <p className="text-sm text-stone-500">{stats?.count || 0} players with UTR data</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-stone-100">
          <div className="text-center">
            <p className="text-sm text-stone-500">Highest</p>
            <p className="text-xl font-bold text-green-600">{stats.max.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-stone-500">Average</p>
            <p className="text-xl font-bold text-stone-800">{stats.avg.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-stone-500">Lowest</p>
            <p className="text-xl font-bold text-orange-600">{stats.min.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Current player highlight */}
      {currentPlayerRank && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Your Rank</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-red-600">#{currentPlayerRank}</span>
              <span className="text-sm text-red-500">of {sortedPlayers.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-stone-700 mb-3">Leaderboard</h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {sortedPlayers.slice(0, 15).map((player, index) => {
            const isCurrentPlayer = player.id === currentPlayerId
            const rank = index + 1

            return (
              <div
                key={player.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg transition-colors',
                  isCurrentPlayer ? 'bg-red-50 border border-red-200' : 'hover:bg-stone-50'
                )}
              >
                {/* Rank */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  rank === 2 ? 'bg-stone-200 text-stone-700' :
                  rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-stone-100 text-stone-600'
                )}>
                  {rank}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium truncate',
                    isCurrentPlayer ? 'text-red-700' : 'text-stone-800'
                  )}>
                    {player.full_name}
                    {isCurrentPlayer && <span className="ml-2 text-xs">(You)</span>}
                  </p>
                  {player.category && (
                    <p className="text-xs text-stone-500 capitalize">{player.category}</p>
                  )}
                </div>

                {/* UTR */}
                <div className="text-right">
                  <p className={cn(
                    'font-bold',
                    isCurrentPlayer ? 'text-red-600' : 'text-stone-800'
                  )}>
                    {player.current_utr?.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}

          {sortedPlayers.length > 15 && (
            <p className="text-center text-sm text-stone-400 pt-2">
              +{sortedPlayers.length - 15} more players
            </p>
          )}
        </div>
      </div>

      {/* Distribution bar */}
      {stats && (
        <div className="p-4 border-t border-stone-100">
          <h4 className="text-xs font-medium text-stone-500 mb-2">UTR Distribution</h4>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex">
            {[0, 1, 2, 3, 4].map((tier) => {
              const tierMin = stats.min + (tier * (stats.max - stats.min) / 5)
              const tierMax = stats.min + ((tier + 1) * (stats.max - stats.min) / 5)
              const count = sortedPlayers.filter(p => {
                const utr = p.current_utr || 0
                return utr >= tierMin && utr < tierMax
              }).length
              const percentage = (count / sortedPlayers.length) * 100

              return (
                <div
                  key={tier}
                  className={cn(
                    tier === 0 ? 'bg-red-400' :
                    tier === 1 ? 'bg-orange-400' :
                    tier === 2 ? 'bg-yellow-400' :
                    tier === 3 ? 'bg-green-400' :
                    'bg-green-600'
                  )}
                  style={{ width: `${percentage}%` }}
                  title={`${tierMin.toFixed(1)}-${tierMax.toFixed(1)}: ${count} players`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>{stats.min.toFixed(1)}</span>
            <span>{stats.max.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
