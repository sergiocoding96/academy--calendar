import { getPlayerWithDetailsServer } from '@/features/player-database/lib/queries-server'
import { CoachPlayerDetailClient } from './coach-player-detail-client'

interface CoachPlayerDetailPageProps {
  params: { id: string }
}

export default async function CoachPlayerDetailPage({ params }: CoachPlayerDetailPageProps) {
  const player = await getPlayerWithDetailsServer(params.id)

  return (
    <CoachPlayerDetailClient
      playerId={params.id}
      initialPlayer={player}
    />
  )
}
