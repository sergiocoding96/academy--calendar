'use client'

import Link from 'next/link'
import { ChevronRight, AlertTriangle, Calendar, TrendingUp } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Player } from '../types'

interface PlayerCardProps {
  player: Player
  hasActiveInjury?: boolean
  upcomingEventsCount?: number
  href?: string
  onClick?: () => void
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

export function PlayerCard({
  player,
  hasActiveInjury = false,
  upcomingEventsCount = 0,
  href,
  onClick,
}: PlayerCardProps) {
  const content = (
    <div className="bg-white rounded-xl border border-stone-200 p-6 hover:border-red-200 hover:shadow-md transition-all">
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          name={player.full_name}
          src={player.photo_url || undefined}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-800 truncate">
              {player.full_name}
            </h3>
            {hasActiveInjury && (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
          {player.nickname && (
            <p className="text-sm text-stone-500">&quot;{player.nickname}&quot;</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {player.category && (
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  categoryColors[player.category] || 'bg-stone-100 text-stone-700'
                }`}
              >
                {categoryLabels[player.category] || player.category}
              </span>
            )}
            {!player.is_active && (
              <Badge variant="warning" size="sm">Inactive</Badge>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-stone-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-stone-400" />
            <p className="text-lg font-bold text-stone-800">
              {player.current_utr?.toFixed(2) || '-'}
            </p>
          </div>
          <p className="text-xs text-stone-500">UTR</p>
        </div>
        <div className="p-2 bg-stone-50 rounded-lg">
          <p className="text-lg font-bold text-stone-800">
            {player.category || '-'}
          </p>
          <p className="text-xs text-stone-500">Category</p>
        </div>
        <div className="p-2 bg-stone-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3 text-stone-400" />
            <p className="text-lg font-bold text-stone-800">
              {upcomingEventsCount}
            </p>
          </div>
          <p className="text-xs text-stone-500">Events</p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    )
  }

  return content
}
