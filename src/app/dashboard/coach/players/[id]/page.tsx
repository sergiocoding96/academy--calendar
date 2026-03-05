import { getPlayerWithDetailsServer } from '@/features/player-database/lib/queries-server'
import { CoachPlayerDetailClient } from './coach-player-detail-client'

interface CoachPlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CoachPlayerDetailPage({ params }: CoachPlayerDetailPageProps) {
  const { id } = await params
  const player = await getPlayerWithDetailsServer(id)

  return (
    <CoachPlayerDetailClient
      playerId={id}
      initialPlayer={player}
    />
  )
}
