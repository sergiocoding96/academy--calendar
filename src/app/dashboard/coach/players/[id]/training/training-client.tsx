'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { TrainingLoadForm } from '@/features/player-database/components'
import { usePlayer } from '@/features/player-database/hooks'
import { cn } from '@/lib/utils'
import type { PlayerWithDetails } from '@/features/player-database/types'

interface TrainingClientProps {
  initialPlayer: PlayerWithDetails
}

export default function CoachPlayerTrainingClient({ initialPlayer }: TrainingClientProps) {
  const params = useParams()
  const playerId = params.id as string
  const [showAddForm, setShowAddForm] = useState(false)

  const { player, loading, error, refetch } = usePlayer(playerId, {
    withDetails: true,
    initialData: initialPlayer,
  })

  const handleSuccess = () => {
    setShowAddForm(false)
    refetch()
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

  const trainingLoads = (player as PlayerWithDetails).training_loads || []
  const sortedLoads = [...trainingLoads].sort(
    (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
  )
  const avgRPE = trainingLoads.length > 0
    ? (trainingLoads.reduce((sum: number, l: any) => sum + l.rpe, 0) / trainingLoads.length).toFixed(1)
    : '-'
  const avgDuration = trainingLoads.length > 0
    ? Math.round(trainingLoads.reduce((sum: number, l: any) => sum + l.duration_minutes, 0) / trainingLoads.length)
    : 0
  const weekLoads = trainingLoads.filter((l: any) => {
    const date = new Date(l.session_date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  })

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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Training Loads</h1>
            <p className="text-stone-500">{player.full_name}&apos;s training history</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Log Training
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">This Week</p>
          <p className="text-2xl font-bold text-stone-800">{weekLoads.length}</p>
          <p className="text-xs text-stone-400">sessions</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Avg RPE</p>
          <p className="text-2xl font-bold text-stone-800">{avgRPE}</p>
          <p className="text-xs text-stone-400">of 10</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Avg Duration</p>
          <p className="text-2xl font-bold text-stone-800">{avgDuration}</p>
          <p className="text-xs text-stone-400">minutes</p>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6">
          <TrainingLoadForm
            playerId={playerId}
            onSuccess={handleSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200">
        <div className="p-4 border-b border-stone-200">
          <h2 className="font-semibold text-stone-800">Training History</h2>
        </div>

        {sortedLoads.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {sortedLoads.map((load: any) => (
              <div key={load.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg',
                    load.rpe >= 8 ? 'bg-red-100 text-red-700' :
                    load.rpe >= 6 ? 'bg-yellow-100 text-yellow-700' :
                    load.rpe >= 4 ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  )}>
                    {load.rpe}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">
                      {new Date(load.session_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-stone-500">
                      {load.session_type || 'Training'} • {load.duration_minutes} min
                    </p>
                  </div>
                </div>
                {load.notes && (
                  <p className="text-sm text-stone-500 max-w-xs truncate">{load.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-stone-500">
            No training loads recorded yet
          </div>
        )}
      </div>
    </div>
  )
}
