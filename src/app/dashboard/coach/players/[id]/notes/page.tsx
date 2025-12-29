'use client'

import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { NotesManager } from '@/features/player-database/components'
import { usePlayer } from '@/features/player-database/hooks'

export default function CoachPlayerNotesPage() {
  const params = useParams()
  const playerId = params.id as string

  const { player, loading, error, refetch } = usePlayer(playerId, { withDetails: true })

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error?.message || 'Failed to load player'}</p>
        <Link href="/dashboard/coach/players" className="text-red-600 hover:text-red-700">
          Back to players
        </Link>
      </div>
    )
  }

  const notes = (player as any).notes || []

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
          <h1 className="text-2xl font-bold text-stone-800">Player Notes</h1>
          <p className="text-stone-500">Notes and observations for {player.full_name}</p>
        </div>
      </div>

      {/* Notes Manager */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <NotesManager
          playerId={playerId}
          notes={notes}
          onNotesChange={refetch}
        />
      </div>
    </div>
  )
}
