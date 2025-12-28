'use client'

import { User, Mail, Phone, Calendar, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Player, Profile } from '../types'

interface PlayerHeaderProps {
  player: Player & { coach?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null }
  className?: string
}

const categoryColors: Record<string, string> = {
  'U10': 'bg-purple-100 text-purple-700',
  'U12': 'bg-blue-100 text-blue-700',
  'U14': 'bg-green-100 text-green-700',
  'U16': 'bg-yellow-100 text-yellow-700',
  'U18': 'bg-orange-100 text-orange-700',
  'Open': 'bg-red-100 text-red-700',
  'Adult': 'bg-stone-100 text-stone-700',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not specified'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function calculateAge(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  const birth = new Date(dateStr)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function PlayerHeader({ player, className }: PlayerHeaderProps) {
  const age = calculateAge(player.date_of_birth)
  const categoryColor = player.category
    ? categoryColors[player.category] || 'bg-stone-100 text-stone-700'
    : 'bg-stone-100 text-stone-700'

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-stone-200 p-6', className)}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-stone-400" />
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                {player.full_name}
                {player.nickname && (
                  <span className="text-stone-500 font-normal ml-2">
                    "{player.nickname}"
                  </span>
                )}
              </h1>

              <div className="flex items-center gap-3 mt-2">
                {player.category && (
                  <span className={cn('px-2.5 py-0.5 rounded-full text-sm font-medium', categoryColor)}>
                    {player.category}
                  </span>
                )}
                {player.gender && (
                  <span className="text-stone-500 text-sm">
                    {player.gender}
                  </span>
                )}
                {!player.is_active && (
                  <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* UTR Badge */}
            {player.current_utr && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-600">
                  <Trophy className="w-5 h-5" />
                  <span className="text-2xl font-bold">{player.current_utr.toFixed(2)}</span>
                </div>
                <span className="text-xs text-stone-500">UTR Rating</span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Date of Birth / Age */}
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span className="text-sm">
                {formatDate(player.date_of_birth)}
                {age !== null && <span className="text-stone-400 ml-1">({age} years)</span>}
              </span>
            </div>

            {/* Email */}
            {player.email && (
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-4 h-4 text-stone-400" />
                <a
                  href={`mailto:${player.email}`}
                  className="text-sm hover:text-red-600 transition-colors"
                >
                  {player.email}
                </a>
              </div>
            )}

            {/* Phone */}
            {player.phone && (
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-4 h-4 text-stone-400" />
                <a
                  href={`tel:${player.phone}`}
                  className="text-sm hover:text-red-600 transition-colors"
                >
                  {player.phone}
                </a>
              </div>
            )}
          </div>

          {/* Coach Assignment */}
          {player.coach && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <span className="text-sm text-stone-500">Assigned Coach: </span>
              <span className="text-sm font-medium text-stone-700">
                {player.coach.full_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
