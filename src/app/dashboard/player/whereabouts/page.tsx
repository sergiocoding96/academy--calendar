'use client'

import { MapPin } from 'lucide-react'
import { WhereaboutsCalendar } from '@/features/player-database/components'
import { useWhereabouts } from '@/features/player-database/hooks'
import { useAuth } from '@/components/auth/auth-provider'

export default function PlayerWhereaboutsPage() {
  const { profile } = useAuth()
  const playerId = profile?.player_id || ''

  const { whereabouts, loading, refetch } = useWhereabouts(playerId)

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Whereabouts</h1>
          <p className="text-stone-500">Update your availability and travel schedule</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          Keep your whereabouts updated so your coaches know when you&apos;re available for training.
          Click on a date to add or update your location and availability status.
        </p>
      </div>

      {/* Whereabouts Calendar */}
      <WhereaboutsCalendar
        playerId={playerId}
        whereabouts={whereabouts}
        onWhereaboutsChange={refetch}
      />

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-medium text-stone-800 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-stone-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-sm text-stone-600">Traveling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-stone-600">Competition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-stone-600">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}
