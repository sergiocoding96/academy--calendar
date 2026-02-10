'use client'

import { useRouter } from 'next/navigation'
import { PlayerProfile } from '@/features/player-database/components'
import type { PlayerWithDetails } from '@/features/player-database/types'

interface CoachPlayerDetailClientProps {
  playerId: string
  initialPlayer: PlayerWithDetails
}

export function CoachPlayerDetailClient({
  playerId,
  initialPlayer,
}: CoachPlayerDetailClientProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard/coach/players')
  }

  const handleEdit = () => {
    router.push(`/dashboard/coach/players/${playerId}/edit`)
  }

  return (
    <div className="p-8">
      <PlayerProfile
        playerId={playerId}
        initialPlayer={initialPlayer}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </div>
  )
}

