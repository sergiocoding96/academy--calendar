'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Player } from '../types'

type SortField = 'full_name' | 'category' | 'current_utr'
type SortDirection = 'asc' | 'desc'

interface PlayerTableProps {
  players: Player[]
  activeInjuryIds?: Set<string>
  getHref?: (player: Player) => string
  onPlayerClick?: (player: Player) => void
  className?: string
}

const categoryLabels: Record<string, string> = {
  Open: 'Open',
  Adult: 'Adult',
  U18: 'U18',
  U16: 'U16',
  U14: 'U14',
  U12: 'U12',
  U10: 'U10',
}

const categoryColors: Record<string, string> = {
  Open: 'bg-purple-100 text-purple-700',
  Adult: 'bg-blue-100 text-blue-700',
  U18: 'bg-cyan-100 text-cyan-700',
  U16: 'bg-green-100 text-green-700',
  U14: 'bg-amber-100 text-amber-700',
  U12: 'bg-orange-100 text-orange-700',
  U10: 'bg-rose-100 text-rose-700',
}

export function PlayerTable({
  players,
  activeInjuryIds = new Set(),
  getHref,
  onPlayerClick,
  className,
}: PlayerTableProps) {
  const [sortField, setSortField] = useState<SortField>('full_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aVal: string | number | null = null
      let bVal: string | number | null = null

      switch (sortField) {
        case 'full_name':
          aVal = a.full_name.toLowerCase()
          bVal = b.full_name.toLowerCase()
          break
        case 'category':
          aVal = a.category || ''
          bVal = b.category || ''
          break
        case 'current_utr':
          aVal = a.current_utr || 0
          bVal = b.current_utr || 0
          break
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [players, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  const headerClass =
    'px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider cursor-pointer hover:bg-stone-100 select-none'

  return (
    <div className={cn('bg-white rounded-xl border border-stone-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th
                className={headerClass}
                onClick={() => handleSort('full_name')}
              >
                <div className="flex items-center gap-1">
                  Player
                  <SortIcon field="full_name" />
                </div>
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  Category
                  <SortIcon field="category" />
                </div>
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort('current_utr')}
              >
                <div className="flex items-center gap-1">
                  UTR
                  <SortIcon field="current_utr" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {sortedPlayers.map((player) => {
              const hasInjury = activeInjuryIds.has(player.id)
              const href = getHref?.(player)

              const rowContent = (
                <>
                  {/* Player Info */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={player.full_name}
                        src={player.photo_url || undefined}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-800">
                            {player.full_name}
                          </span>
                          {hasInjury && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {player.nickname && (
                          <span className="text-sm text-stone-500">
                            &quot;{player.nickname}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {player.category && (
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          categoryColors[player.category] ||
                          categoryColors.recreational
                        }`}
                      >
                        {categoryLabels[player.category] || player.category}
                      </span>
                    )}
                  </td>

                  {/* UTR */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium text-stone-800">
                      {player.current_utr?.toFixed(2) || '-'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {player.is_active ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Inactive</Badge>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </td>
                </>
              )

              if (href) {
                return (
                  <tr
                    key={player.id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <Link
                      href={href}
                      className="contents"
                    >
                      {rowContent}
                    </Link>
                  </tr>
                )
              }

              return (
                <tr
                  key={player.id}
                  onClick={() => onPlayerClick?.(player)}
                  className={cn(
                    'hover:bg-stone-50 transition-colors',
                    onPlayerClick && 'cursor-pointer'
                  )}
                >
                  {rowContent}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {players.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          No players found
        </div>
      )}
    </div>
  )
}
