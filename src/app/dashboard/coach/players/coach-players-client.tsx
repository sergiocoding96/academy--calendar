'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PlayerList, PlayerForm, type PlayerListRef } from '@/features/player-database/components'
import type { Player, Profile } from '@/features/player-database/types'
import { Plus, X } from 'lucide-react'

interface CoachPlayersClientProps {
  initialPlayers: Player[]
  initialCoaches: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>[]
}

export function CoachPlayersClient({
  initialPlayers,
  initialCoaches,
}: CoachPlayersClientProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const listRef = useRef<PlayerListRef>(null)

  const handlePlayerClick = (player: Player) => {
    router.push(`/dashboard/coach/players/${player.id}`)
  }

  const handlePlayerCreated = () => {
    setShowAddForm(false)
    listRef.current?.refetch()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Player Database</h1>
          <p className="text-stone-500 mt-1">View and manage all players in the academy</p>
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
              Add Player
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <PlayerForm
            onSuccess={handlePlayerCreated}
            onCancel={() => setShowAddForm(false)}
            coaches={initialCoaches}
          />
        </div>
      )}

      <PlayerList
        ref={listRef}
        initialPlayers={initialPlayers}
        coaches={initialCoaches as Profile[]}
        onPlayerClick={handlePlayerClick}
        showAddButton={false}
      />
    </div>
  )
}
