'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, Plus, X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { InjuryForm } from '@/features/player-database/components'
import { usePlayer } from '@/features/player-database/hooks'
import { cn } from '@/lib/utils'

export default function CoachPlayerInjuriesPage() {
  const params = useParams()
  const playerId = params.id as string
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingInjury, setEditingInjury] = useState<any>(null)

  const { player, loading, error, refetch } = usePlayer(playerId, { withDetails: true })

  const handleSuccess = () => {
    setShowAddForm(false)
    setEditingInjury(null)
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

  const injuries = (player as any).injuries || []

  // Separate active and cleared injuries
  const activeInjuries = injuries.filter((i: any) => i.status !== 'cleared')
  const clearedInjuries = injuries.filter((i: any) => i.status === 'cleared')

  // Sort by date
  const sortActive = [...activeInjuries].sort(
    (a, b) => new Date(b.injury_date).getTime() - new Date(a.injury_date).getTime()
  )
  const sortCleared = [...clearedInjuries].sort(
    (a, b) => new Date(b.injury_date).getTime() - new Date(a.injury_date).getTime()
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'moderate': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'severe': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-stone-100 text-stone-700 border-stone-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700'
      case 'recovering': return 'bg-yellow-100 text-yellow-700'
      case 'cleared': return 'bg-green-100 text-green-700'
      default: return 'bg-stone-100 text-stone-700'
    }
  }

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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Injuries</h1>
              <p className="text-stone-500">{player.full_name}&apos;s injury history</p>
            </div>
          </div>

          {!showAddForm && !editingInjury && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              Log Injury
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Active</p>
          <p className={cn(
            'text-2xl font-bold',
            activeInjuries.length > 0 ? 'text-red-600' : 'text-stone-800'
          )}>
            {activeInjuries.length}
          </p>
          <p className="text-xs text-stone-400">injuries</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Recovering</p>
          <p className="text-2xl font-bold text-yellow-600">
            {activeInjuries.filter((i: any) => i.status === 'recovering').length}
          </p>
          <p className="text-xs text-stone-400">injuries</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Total Cleared</p>
          <p className="text-2xl font-bold text-green-600">{clearedInjuries.length}</p>
          <p className="text-xs text-stone-400">injuries</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingInjury) && (
        <div className="mb-6">
          <InjuryForm
            playerId={playerId}
            injury={editingInjury}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowAddForm(false)
              setEditingInjury(null)
            }}
          />
        </div>
      )}

      {/* Active Injuries */}
      {sortActive.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-stone-800 mb-4">Active Injuries</h2>
          <div className="space-y-3">
            {sortActive.map((injury: any) => (
              <div
                key={injury.id}
                className="bg-white rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded border',
                        getSeverityColor(injury.severity)
                      )}>
                        {injury.severity}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded',
                        getStatusColor(injury.status)
                      )}>
                        {injury.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-stone-800">{injury.body_part}</h3>
                    <p className="text-sm text-stone-600">{injury.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                      <span>Injured: {new Date(injury.injury_date).toLocaleDateString()}</span>
                      {injury.expected_return && (
                        <span>Expected return: {new Date(injury.expected_return).toLocaleDateString()}</span>
                      )}
                    </div>
                    {injury.notes && (
                      <p className="mt-2 text-sm text-stone-500 italic">{injury.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingInjury(injury)}
                    className="px-3 py-1 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cleared Injuries */}
      {sortCleared.length > 0 && (
        <div>
          <h2 className="font-semibold text-stone-800 mb-4">Injury History</h2>
          <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
            {sortCleared.map((injury: any) => (
              <div key={injury.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-stone-700">{injury.body_part}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                        Cleared
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">{injury.description}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(injury.injury_date).toLocaleDateString()} - {new Date(injury.actual_return || injury.injury_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingInjury(injury)}
                    className="px-3 py-1 text-sm text-stone-500 hover:text-stone-700"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {injuries.length === 0 && !showAddForm && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-stone-300" />
          <p className="text-stone-600 mb-4">No injuries recorded</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Log First Injury
          </button>
        </div>
      )}
    </div>
  )
}
