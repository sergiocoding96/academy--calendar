'use client'

import { useRouter, useParams } from 'next/navigation'
import { PlayerProfile } from '@/features/player-database/components'

export default function CoachPlayerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const playerId = params.id as string

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
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </div>
  )
}
