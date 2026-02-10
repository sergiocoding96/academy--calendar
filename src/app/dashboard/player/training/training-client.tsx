'use client'

import { useState } from 'react'
import { Activity, TrendingUp, Calendar, Clock } from 'lucide-react'
import { TrainingLoadForm } from '@/features/player-database/components'
import { useTrainingLoads } from '@/features/player-database/hooks'
import type { TrainingLoad } from '@/features/player-database/types'
import { cn } from '@/lib/utils'

interface PlayerTrainingClientProps {
  playerId: string
  initialLoads: TrainingLoad[]
}

export function PlayerTrainingClient({ playerId, initialLoads }: PlayerTrainingClientProps) {
  const [showForm, setShowForm] = useState(false)

  const { trainingLoads, loading, refetch } = useTrainingLoads(playerId, {
    initialData: initialLoads,
  })

  const handleSuccess = () => {
    setShowForm(false)
    refetch()
  }

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 7)

  const weekLoads = trainingLoads.filter(load =>
    new Date(load.session_date) >= weekStart
  )

  const weeklyLoad = weekLoads.reduce((sum, load) => {
    return sum + ((load.rpe || 0) * (load.duration_minutes || 0))
  }, 0)

  const avgRpe = weekLoads.length > 0
    ? weekLoads.reduce((sum, load) => sum + (load.rpe || 0), 0) / weekLoads.length
    : 0

  const totalSessions = weekLoads.length

  const getRpeColor = (rpe: number) => {
    if (rpe >= 8) return 'text-red-600'
    if (rpe >= 6) return 'text-orange-600'
    if (rpe >= 4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRpeBg = (rpe: number) => {
    if (rpe >= 8) return 'bg-red-100'
    if (rpe >= 6) return 'bg-orange-100'
    if (rpe >= 4) return 'bg-yellow-100'
    return 'bg-green-100'
  }

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Individual'
      case 'group': return 'Group'
      case 'match': return 'Match'
      case 'fitness': return 'Fitness'
      default: return type
    }
  }

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Training Log</h1>
            <p className="text-stone-500">Track your tennis training sessions and RPE</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Log Session
          </button>
        )}
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Weekly Load</p>
              <p className="text-2xl font-bold text-stone-800">{weeklyLoad.toLocaleString()}</p>
              <p className="text-xs text-stone-400">RPE × minutes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', getRpeBg(avgRpe))}>
              <Activity className={cn('w-6 h-6', getRpeColor(avgRpe))} />
            </div>
            <div>
              <p className="text-sm text-stone-500">Avg RPE</p>
              <p className={cn('text-2xl font-bold', getRpeColor(avgRpe))}>
                {avgRpe.toFixed(1)}
              </p>
              <p className="text-xs text-stone-400">this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Sessions</p>
              <p className="text-2xl font-bold text-stone-800">{totalSessions}</p>
              <p className="text-xs text-stone-400">this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log Form */}
      {showForm && (
        <div className="mb-8">
          <TrainingLoadForm
            playerId={playerId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Training History */}
      <h2 className="font-semibold text-stone-800 mb-4">Recent Sessions</h2>

      {trainingLoads.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {trainingLoads.slice(0, 20).map((load) => (
            <div key={load.id} className="p-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getRpeBg(load.rpe || 0))}>
                    <span className={cn('text-lg font-bold', getRpeColor(load.rpe || 0))}>
                      {load.rpe || '-'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">
                      {getSessionTypeLabel(load.session_type || 'training')} Training
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(load.session_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {load.duration_minutes || 0} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-400">Load</p>
                  <p className="font-semibold text-stone-700">
                    {((load.rpe || 0) * (load.duration_minutes || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
              {load.notes && (
                <p className="mt-2 text-sm text-stone-500 pl-14">{load.notes}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-stone-300" />
          <p className="text-stone-600 mb-4">No training sessions logged yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Log Your First Session
          </button>
        </div>
      )}
    </div>
  )
}

