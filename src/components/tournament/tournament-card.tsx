'use client'

import { useState } from 'react'
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Trophy,
  Globe,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, isPast, parseISO } from 'date-fns'
import type { ScrapedTournament } from '@/types/agent'
import type { TournamentWithDetails } from '@/hooks/tournament'

// Configuration for tournament type styling
const typeConfig: Record<string, { gradient: string; glow: string; label: string }> = {
  proximity: {
    gradient: 'from-rose-600 via-red-600 to-red-700',
    glow: 'shadow-red-500/30',
    label: 'LOCAL',
  },
  national: {
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    glow: 'shadow-slate-500/30',
    label: 'NATIONAL',
  },
  international: {
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    glow: 'shadow-orange-500/30',
    label: 'INTERNATIONAL',
  },
  itf: {
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    glow: 'shadow-blue-500/30',
    label: 'ITF',
  },
  tennis_europe: {
    gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
    glow: 'shadow-emerald-500/30',
    label: 'TE',
  },
  federation: {
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
    glow: 'shadow-purple-500/30',
    label: 'FED',
  },
}

// Category badge colors
const categoryColors: Record<string, string> = {
  'U10': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'U12': 'bg-blue-100 text-blue-700 border-blue-200',
  'U14': 'bg-purple-100 text-purple-700 border-purple-200',
  'U16': 'bg-orange-100 text-orange-700 border-orange-200',
  'U18': 'bg-red-100 text-red-700 border-red-200',
  'Adults': 'bg-stone-100 text-stone-700 border-stone-200',
}

// Surface badge colors
const surfaceColors: Record<string, string> = {
  'Clay': 'bg-orange-100 text-orange-700',
  'Hard': 'bg-blue-100 text-blue-700',
  'Grass': 'bg-green-100 text-green-700',
  'Indoor': 'bg-purple-100 text-purple-700',
  'Carpet': 'bg-pink-100 text-pink-700',
}

// Registration status configuration
const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  open: { icon: CheckCircle, color: 'text-green-600', label: 'Open' },
  closed: { icon: XCircle, color: 'text-red-600', label: 'Closed' },
  full: { icon: AlertCircle, color: 'text-amber-600', label: 'Full' },
}

type TournamentData = ScrapedTournament | TournamentWithDetails

interface TournamentCardProps {
  tournament: TournamentData
  onClick?: () => void
  isExpanded?: boolean
  assignedPlayers?: number
  className?: string
}

export function TournamentCard({
  tournament,
  onClick,
  isExpanded = false,
  assignedPlayers = 0,
  className,
}: TournamentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get tournament type - handle both ScrapedTournament and Tournament types
  const tournamentType = ('tournament_type' in tournament ? tournament.tournament_type : null) || 'proximity'
  const config = typeConfig[tournamentType] || typeConfig.proximity

  // Parse dates
  const startDate = tournament.start_date ? parseISO(tournament.start_date) : null
  const endDate = tournament.end_date ? parseISO(tournament.end_date) : null
  const entryDeadline = 'entry_deadline' in tournament && tournament.entry_deadline
    ? parseISO(tournament.entry_deadline)
    : null

  // Calculate deadline status
  const daysToDeadline = entryDeadline ? differenceInDays(entryDeadline, new Date()) : null
  const isDeadlineSoon = daysToDeadline !== null && daysToDeadline <= 7 && daysToDeadline > 0
  const isDeadlinePast = entryDeadline ? isPast(entryDeadline) : false

  // Determine registration status
  const registrationStatus: 'open' | 'closed' | 'full' = isDeadlinePast ? 'closed' : 'open'
  const StatusIcon = statusConfig[registrationStatus].icon

  // Get surface if available
  const surface = 'surface' in tournament ? tournament.surface : null

  // Get website URL
  const websiteUrl = 'website_url' in tournament
    ? tournament.website_url
    : ('website' in tournament ? tournament.website : null)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer',
        isHovered ? 'scale-[1.01] shadow-2xl' : 'shadow-lg',
        className
      )}
    >
      {/* Card gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-r', config.gradient)} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />

      {/* Shine effect on hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
          'transition-transform duration-700 -skew-x-12',
          isHovered ? 'translate-x-full' : '-translate-x-full'
        )}
      />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Type badge */}
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold tracking-wider">
                {config.label}
              </span>

              {/* Category badge */}
              {tournament.category && (
                <span className={cn(
                  'px-2 py-0.5 rounded-lg text-xs font-semibold border',
                  categoryColors[tournament.category] || 'bg-white/20 text-white border-white/20'
                )}>
                  {tournament.category}
                </span>
              )}

              {/* Level badge */}
              {tournament.level && (
                <span className="px-2 py-0.5 bg-white/10 rounded-lg text-white/90 text-xs font-medium">
                  {tournament.level}
                </span>
              )}

              {/* Surface badge */}
              {surface && (
                <span className={cn(
                  'px-2 py-0.5 rounded-lg text-xs font-medium',
                  surfaceColors[surface] || 'bg-white/20 text-white'
                )}>
                  {surface}
                </span>
              )}
            </div>

            {/* Tournament name */}
            <h4 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight line-clamp-2">
              {tournament.name}
            </h4>

            {/* Location */}
            {tournament.location && (
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate">{tournament.location}</span>
                {'country' in tournament && tournament.country && (
                  <span className="text-white/60">• {tournament.country}</span>
                )}
              </div>
            )}

            {/* Dates */}
            {startDate && (
              <div className="flex items-center gap-2 text-white/80 mb-3">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">
                  {format(startDate, 'MMM d')}
                  {endDate && ` - ${format(endDate, 'MMM d, yyyy')}`}
                  {!endDate && `, ${format(startDate, 'yyyy')}`}
                </span>
              </div>
            )}

            {/* Expandable details */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                {/* Entry deadline */}
                {entryDeadline && (
                  <div className={cn(
                    'flex items-center gap-2',
                    isDeadlineSoon ? 'text-amber-300' : isDeadlinePast ? 'text-white/50' : 'text-white/80'
                  )}>
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">
                      Entry deadline: {format(entryDeadline, 'MMM d, yyyy')}
                      {isDeadlineSoon && ` (${daysToDeadline} days left)`}
                      {isDeadlinePast && ' (Passed)'}
                    </span>
                  </div>
                )}

                {/* Website link */}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium underline underline-offset-2">
                      Tournament website
                    </span>
                  </a>
                )}
              </div>
            )}

            {/* Footer info */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              {/* Registration status */}
              <div className={cn('flex items-center gap-1.5', statusConfig[registrationStatus].color)}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-medium text-white/90">
                  {statusConfig[registrationStatus].label}
                </span>
              </div>

              {/* Assigned players */}
              {assignedPlayers > 0 && (
                <div className="flex items-center gap-1.5 text-white/80">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{assignedPlayers} players</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow indicator */}
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center',
              'transition-all duration-300',
              isHovered ? 'bg-white/20 translate-x-1' : ''
            )}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
