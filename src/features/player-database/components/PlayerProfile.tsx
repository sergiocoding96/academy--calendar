'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlayer } from '../hooks/usePlayer'
import type { PlayerWithDetails } from '../types'
import { PlayerHeader } from './PlayerHeader'
import { PlayerStats } from './PlayerStats'
import { PlayerTabs, usePlayerTabs, type PlayerTabId } from './PlayerTabs'
import { PlayerQuickActions } from './PlayerQuickActions'

interface PlayerProfileProps {
  playerId: string
  onBack?: () => void
  onEdit?: () => void
  className?: string
}

// Tab content placeholder - will be replaced with actual content components
function TabContent({ tab, player }: { tab: PlayerTabId; player: any }) {
  switch (tab) {
    case 'overview':
      return (
        <div className="space-y-6">
          <PlayerStats
            trainingLoads={player.training_loads}
            injuries={player.injuries}
            whereabouts={[]}
          />

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {player.parent_name && (
                <div>
                  <p className="text-sm text-stone-500">Parent/Guardian</p>
                  <p className="font-medium text-stone-900">{player.parent_name}</p>
                  {player.parent_phone && (
                    <p className="text-sm text-stone-600">{player.parent_phone}</p>
                  )}
                  {player.parent_email && (
                    <p className="text-sm text-stone-600">{player.parent_email}</p>
                  )}
                </div>
              )}
              {player.emergency_contact && (
                <div>
                  <p className="text-sm text-stone-500">Emergency Contact</p>
                  <p className="font-medium text-stone-900">{player.emergency_contact}</p>
                  {player.emergency_phone && (
                    <p className="text-sm text-stone-600">{player.emergency_phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Notes Preview */}
          {player.notes && player.notes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900 mb-4">Recent Notes</h3>
              <div className="space-y-3">
                {player.notes.slice(0, 3).map((note: any) => (
                  <div key={note.id} className="p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {note.category && (
                        <span className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded">
                          {note.category}
                        </span>
                      )}
                      <span className="text-xs text-stone-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 line-clamp-2">{note.note_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )

    case 'training':
      return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Training Loads</h3>
          {player.training_loads && player.training_loads.length > 0 ? (
            <div className="space-y-3">
              {player.training_loads.map((load: any) => (
                <div
                  key={load.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {new Date(load.session_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-stone-500">
                      {load.duration_minutes} min • {load.session_type || 'Training'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-lg font-bold',
                      load.rpe >= 8 ? 'text-red-600' :
                      load.rpe >= 6 ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      RPE {load.rpe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No training loads recorded</p>
          )}
        </div>
      )

    case 'injuries':
      return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Injuries</h3>
          {player.injuries && player.injuries.length > 0 ? (
            <div className="space-y-3">
              {player.injuries.map((injury: any) => (
                <div
                  key={injury.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    injury.status === 'cleared'
                      ? 'bg-green-50 border-green-200'
                      : injury.severity === 'severe'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{injury.body_part}</p>
                      <p className="text-sm text-stone-600">{injury.description}</p>
                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(injury.injury_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      injury.status === 'cleared' ? 'bg-green-200 text-green-700' :
                      injury.status === 'recovered' ? 'bg-blue-200 text-blue-700' :
                      'bg-red-200 text-red-700'
                    )}>
                      {injury.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No injuries recorded</p>
          )}
        </div>
      )

    case 'notes':
      return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Notes</h3>
          {player.notes && player.notes.length > 0 ? (
            <div className="space-y-3">
              {player.notes.map((note: any) => (
                <div key={note.id} className="p-4 bg-stone-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.category && (
                        <span className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded">
                          {note.category}
                        </span>
                      )}
                      {note.is_ai_context && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded">
                          AI Context
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700">{note.note_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No notes recorded</p>
          )}
        </div>
      )

    case 'whereabouts':
      return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Whereabouts</h3>
          <p className="text-stone-500 text-center py-8">
            Whereabouts calendar coming soon
          </p>
        </div>
      )

    case 'utr':
      return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-900 mb-4">UTR History</h3>
          {player.utr_history && player.utr_history.length > 0 ? (
            <div className="space-y-3">
              {player.utr_history.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {new Date(entry.recorded_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-stone-500">{entry.source || 'Manual entry'}</p>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    {entry.utr_value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">No UTR history recorded</p>
          )}
        </div>
      )

    default:
      return null
  }
}

export function PlayerProfile({
  playerId,
  onBack,
  onEdit,
  className,
}: PlayerProfileProps) {
  const { player, loading, error } = usePlayer(playerId, { withDetails: true })
  const { activeTab, setActiveTab } = usePlayerTabs('overview')
  const [showAddTraining, setShowAddTraining] = useState(false)
  const [showAddInjury, setShowAddInjury] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)

  // Count active injuries for badge (only available with withDetails)
  const playerWithDetails = player as PlayerWithDetails | null
  const activeInjuryCount = playerWithDetails?.injuries?.filter(
    (i) => i.status !== 'cleared'
  ).length ?? 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 mb-4">
          {error?.message || 'Failed to load player'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back Button & Actions Row */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to players</span>
          </button>
        )}
        <PlayerQuickActions
          playerId={playerId}
          onEdit={onEdit}
          onAddTraining={() => setShowAddTraining(true)}
          onAddInjury={() => setShowAddInjury(true)}
          onAddNote={() => setShowAddNote(true)}
        />
      </div>

      {/* Header */}
      <PlayerHeader player={player} />

      {/* Tabs */}
      <PlayerTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        injuryCount={activeInjuryCount}
      />

      {/* Tab Content */}
      <TabContent tab={activeTab} player={player} />
    </div>
  )
}
