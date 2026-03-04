'use client'

import { AlertTriangle, Calendar, CheckCircle } from 'lucide-react'
import type { PlayerWithDetails } from '@/features/player-database/types'
import { cn } from '@/lib/utils'

interface PlayerInjuriesClientProps {
  player: PlayerWithDetails
}

export function PlayerInjuriesClient({ player }: PlayerInjuriesClientProps) {
  const injuries = player.injuries || []

  const activeInjuries = injuries.filter((i) => i.status !== 'cleared')
  const clearedInjuries = injuries.filter((i) => i.status === 'cleared')

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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Injuries</h1>
          <p className="text-stone-500">View your injury status and history</p>
        </div>
      </div>

      {/* Current Status */}
      {activeInjuries.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Active Injury Alert</p>
              <p className="text-sm text-red-600">
                You have {activeInjuries.length} active injur{activeInjuries.length === 1 ? 'y' : 'ies'}.
                Please follow your recovery plan.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">All Clear</p>
              <p className="text-sm text-green-600">
                You have no active injuries. Keep up the good work!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Injuries */}
      {sortActive.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-stone-800 mb-4">Active Injuries</h2>
          <div className="space-y-3">
            {sortActive.map((injury) => (
              <div
                key={injury.id}
                className="bg-white rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    injury.status === 'active' ? 'bg-red-100' : 'bg-yellow-100'
                  )}>
                    <AlertTriangle className={cn(
                      'w-5 h-5',
                      injury.status === 'active' ? 'text-red-600' : 'text-yellow-600'
                    )} />
                  </div>
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
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Injured: {new Date(injury.injury_date).toLocaleDateString()}
                      </span>
                      {injury.expected_return && (
                        <span>
                          Expected return: {new Date(injury.expected_return).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {injury.notes && (
                      <p className="mt-2 text-sm text-stone-500 italic">{injury.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Injury History */}
      {sortCleared.length > 0 && (
        <div>
          <h2 className="font-semibold text-stone-800 mb-4">Injury History</h2>
          <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
            {sortCleared.map((injury) => (
              <div key={injury.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h3 className="font-medium text-stone-700">{injury.body_part}</h3>
                      <p className="text-sm text-stone-500">{injury.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                      Cleared
                    </span>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(injury.injury_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {injuries.length === 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <p className="text-stone-600">No injuries recorded</p>
          <p className="text-sm text-stone-400 mt-1">Stay healthy and keep training!</p>
        </div>
      )}

      {/* Note for players */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> If you have an injury, please report it to your coach immediately.
          Injury records are managed by your coaching staff.
        </p>
      </div>
    </div>
  )
}

