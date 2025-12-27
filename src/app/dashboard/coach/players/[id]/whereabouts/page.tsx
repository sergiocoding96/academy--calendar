'use client'

import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { WhereaboutsCalendar } from '@/features/player-database/components'
import { usePlayer } from '@/features/player-database/hooks'
import { useWhereabouts } from '@/features/player-database/hooks'

export default function CoachPlayerWhereaboutsPage() {
  const params = useParams()
  const playerId = params.id as string

  const { player, loading: playerLoading, error: playerError } = usePlayer(playerId)
  const { whereabouts, loading: whereaboutsLoading, refetch } = useWhereabouts(playerId)

  const loading = playerLoading || whereaboutsLoading

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (playerError || !player) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{playerError?.message || 'Failed to load player'}</p>
        <Link href="/dashboard/coach/players" className="text-red-600 hover:text-red-700">
          Back to players
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/coach/players/${playerId}`}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {player.full_name}
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-stone-800">Whereabouts</h1>
          <p className="text-stone-500">{player.full_name}&apos;s availability and travel schedule</p>
        </div>
      </div>

      {/* Whereabouts Calendar */}
      <WhereaboutsCalendar
        playerId={playerId}
        whereabouts={whereabouts}
        onWhereaboutsChange={refetch}
      />
    </div>
  )
}
