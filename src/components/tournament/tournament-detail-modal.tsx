'use client'

import { useEffect, useCallback } from 'react'
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  UserPlus,
  CalendarPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, isPast, parseISO } from 'date-fns'
import type { ScrapedTournament } from '@/types/agent'
import type { TournamentWithDetails } from '@/hooks/tournament'

type TournamentData = ScrapedTournament | TournamentWithDetails

interface TournamentDetailModalProps {
  tournament: TournamentData | null
  isOpen: boolean
  onClose: () => void
  onAddToCalendar?: (tournament: TournamentData) => void
  onAssignPlayers?: (tournament: TournamentData) => void
  assignedPlayers?: { id: string; name: string }[]
}

// Configuration for tournament type styling
const typeConfig: Record<string, { gradient: string; bgLight: string; label: string }> = {
  proximity: {
    gradient: 'from-rose-600 to-red-700',
    bgLight: 'bg-red-50',
    label: 'LOCAL',
  },
  national: {
    gradient: 'from-slate-500 to-slate-700',
    bgLight: 'bg-slate-50',
    label: 'NATIONAL',
  },
  international: {
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-orange-50',
    label: 'INTERNATIONAL',
  },
  itf: {
    gradient: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
    label: 'ITF',
  },
  tennis_europe: {
    gradient: 'from-emerald-500 to-emerald-700',
    bgLight: 'bg-emerald-50',
    label: 'TENNIS EUROPE',
  },
  federation: {
    gradient: 'from-purple-500 to-purple-700',
    bgLight: 'bg-purple-50',
    label: 'FEDERATION',
  },
}

export function TournamentDetailModal({
  tournament,
  isOpen,
  onClose,
  onAddToCalendar,
  onAssignPlayers,
  assignedPlayers = [],
}: TournamentDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  if (!isOpen || !tournament) return null

  // Get tournament type
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

  // Get surface and website
  const surface = 'surface' in tournament ? tournament.surface : null
  const websiteUrl = 'website_url' in tournament
    ? tournament.website_url
    : ('website' in tournament ? tournament.website : null)
  const country = 'country' in tournament ? tournament.country : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={cn('relative overflow-hidden')}>
          <div className={cn('absolute inset-0 bg-gradient-to-r', config.gradient)} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />

          <div className="relative p-6 text-white">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold tracking-wider">
                {config.label}
              </span>
              {tournament.category && (
                <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold">
                  {tournament.category}
                </span>
              )}
              {tournament.level && (
                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium">
                  {tournament.level}
                </span>
              )}
            </div>

            {/* Tournament name */}
            <h2 className="text-2xl md:text-3xl font-bold mb-2 pr-10">
              {tournament.name}
            </h2>

            {/* Location */}
            {tournament.location && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {tournament.location}
                  {country && ` • ${country}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Key Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dates */}
              {startDate && (
                <div className={cn('p-4 rounded-xl', config.bgLight)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-stone-600" />
                    <span className="font-semibold text-stone-800">Tournament Dates</span>
                  </div>
                  <p className="text-stone-700">
                    {format(startDate, 'EEEE, MMMM d')}
                    {endDate && (
                      <>
                        <span className="text-stone-400"> → </span>
                        {format(endDate, 'EEEE, MMMM d, yyyy')}
                      </>
                    )}
                    {!endDate && `, ${format(startDate, 'yyyy')}`}
                  </p>
                </div>
              )}

              {/* Entry Deadline */}
              {entryDeadline && (
                <div className={cn(
                  'p-4 rounded-xl',
                  isDeadlinePast ? 'bg-stone-100' : isDeadlineSoon ? 'bg-amber-50' : 'bg-green-50'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={cn(
                      'w-5 h-5',
                      isDeadlinePast ? 'text-stone-500' : isDeadlineSoon ? 'text-amber-600' : 'text-green-600'
                    )} />
                    <span className="font-semibold text-stone-800">Entry Deadline</span>
                    {isDeadlinePast && (
                      <span className="px-2 py-0.5 bg-stone-200 text-stone-600 text-xs font-medium rounded-full">
                        Passed
                      </span>
                    )}
                    {isDeadlineSoon && (
                      <span className="px-2 py-0.5 bg-amber-200 text-amber-700 text-xs font-medium rounded-full">
                        {daysToDeadline} days left
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    'font-medium',
                    isDeadlinePast ? 'text-stone-500 line-through' : 'text-stone-700'
                  )}>
                    {format(entryDeadline, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              )}

              {/* Surface */}
              {surface && (
                <div className="p-4 rounded-xl bg-stone-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-stone-600" />
                    <span className="font-semibold text-stone-800">Surface</span>
                  </div>
                  <p className="text-stone-700 font-medium">{surface}</p>
                </div>
              )}

              {/* Website */}
              {websiteUrl && (
                <div className="p-4 rounded-xl bg-stone-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-stone-600" />
                    <span className="font-semibold text-stone-800">Website</span>
                  </div>
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
                  >
                    Visit tournament page
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Registration Status */}
            <div className={cn(
              'p-4 rounded-xl border-2',
              isDeadlinePast ? 'border-stone-200 bg-stone-50' : 'border-green-200 bg-green-50'
            )}>
              <div className="flex items-center gap-3">
                {isDeadlinePast ? (
                  <>
                    <XCircle className="w-6 h-6 text-stone-500" />
                    <div>
                      <p className="font-semibold text-stone-700">Registration Closed</p>
                      <p className="text-sm text-stone-500">Entry deadline has passed</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-700">Registration Open</p>
                      <p className="text-sm text-green-600">
                        {daysToDeadline !== null
                          ? `${daysToDeadline} days until deadline`
                          : 'Check tournament website for details'
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Assigned Players Section */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-stone-600" />
                  <span className="font-semibold text-stone-800">Assigned Players</span>
                  <span className="px-2 py-0.5 bg-stone-200 text-stone-600 text-xs font-bold rounded-full">
                    {assignedPlayers.length}
                  </span>
                </div>
                {onAssignPlayers && (
                  <button
                    onClick={() => onAssignPlayers(tournament)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Players</span>
                  </button>
                )}
              </div>

              {assignedPlayers.length === 0 ? (
                <p className="text-stone-500 text-sm">No players assigned yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {assignedPlayers.map((player) => (
                    <span
                      key={player.id}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Close
          </button>
          {onAddToCalendar && !isDeadlinePast && (
            <button
              onClick={() => onAddToCalendar(tournament)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl',
                'bg-gradient-to-r shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]',
                config.gradient
              )}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Add to Academy Calendar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
