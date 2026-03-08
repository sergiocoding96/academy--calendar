import { getPlayerWithDetailsServer } from '@/features/player-database/lib/queries-server'
import { CoachPlayerDetailClient } from './coach-player-detail-client'

interface CoachPlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CoachPlayerDetailPage({ params }: CoachPlayerDetailPageProps) {
  const { id } = await params

  try {
    const player = await getPlayerWithDetailsServer(id)
    return (
      <CoachPlayerDetailClient
        playerId={id}
        initialPlayer={player}
      />
    )
  } catch {
    return (
      <div className="p-8 text-center">
        <p className="text-stone-500">Could not load player data. Please try again later.</p>
      </div>
    )
  }
}
