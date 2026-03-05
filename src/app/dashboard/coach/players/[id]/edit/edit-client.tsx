'use client'

import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PlayerForm } from '@/features/player-database/components'
import { usePlayer } from '@/features/player-database/hooks'
import type { Player } from '@/features/player-database/types'

interface EditClientProps {
  initialPlayer: Player
}

export default function CoachPlayerEditClient({ initialPlayer }: EditClientProps) {
  const router = useRouter()
  const params = useParams()
  const playerId = params.id as string

  const { player, loading, error } = usePlayer(playerId, { initialData: initialPlayer })

  const handleSuccess = () => {
    router.push(`/dashboard/coach/players/${playerId}`)
  }

  const handleCancel = () => {
    router.push(`/dashboard/coach/players/${playerId}`)
  }

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

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/coach/players/${playerId}`}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {player.full_name}
        </Link>
      </div>

      <PlayerForm
        player={player}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
