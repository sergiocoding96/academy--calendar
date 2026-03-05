'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { UtrChart, UtrForm, UtrComparison } from '@/features/player-database/components'
import { usePlayer, useUtrHistory } from '@/features/player-database/hooks'
import type { Player } from '@/features/player-database/types'

interface UtrClientProps {
  initialPlayer: Player
}

export default function CoachPlayerUtrClient({ initialPlayer }: UtrClientProps) {
  const params = useParams()
  const playerId = params.id as string
  const [showForm, setShowForm] = useState(false)

  const { player, loading: playerLoading, error: playerError } = usePlayer(playerId, {
    initialData: initialPlayer,
  })
  const { utrHistory, loading: utrLoading, stats, refetch } = useUtrHistory(playerId)

  const loading = playerLoading || utrLoading

  const handleSuccess = () => {
    setShowForm(false)
    refetch()
  }

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
      <div className="mb-6">
        <Link
          href={`/dashboard/coach/players/${playerId}`}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {player.full_name}
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">UTR Tracking</h1>
              <p className="text-stone-500">{player.full_name}&apos;s UTR history and analytics</p>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              Add UTR Entry
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Current UTR</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.currentUtr?.toFixed(2) || '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Highest</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.highestUtr?.toFixed(2) || '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Average</p>
          <p className="text-2xl font-bold text-stone-800">
            {stats.averageUtr?.toFixed(2) || '-'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Change</p>
          <p className={`text-2xl font-bold ${
            stats.utrChange && stats.utrChange > 0 ? 'text-green-600' :
            stats.utrChange && stats.utrChange < 0 ? 'text-red-600' : 'text-stone-600'
          }`}>
            {stats.utrChange !== null
              ? `${stats.utrChange > 0 ? '+' : ''}${stats.utrChange.toFixed(2)}`
              : '-'
            }
          </p>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <UtrForm
            playerId={playerId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UtrChart utrHistory={utrHistory} height={250} />
        <UtrComparison currentPlayerId={playerId} />
      </div>
    </div>
  )
}
