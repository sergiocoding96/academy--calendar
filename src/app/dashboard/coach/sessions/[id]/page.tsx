'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/auth/auth-provider'
import { StarRating } from '@/components/ui/star-rating'
import { Calendar, Clock, MapPin, User, ChevronLeft, Save, Users } from 'lucide-react'
import Link from 'next/link'

type Session = {
  id: string
  date: string
  start_time: string
  end_time: string
  session_type: string
  notes: string
  court: { name: string } | null
}

type PlayerWithRating = {
  player: { id: string; name: string; email: string }
  rating: {
    id?: string
    overall_rating: number
    effort_rating: number
    technique_rating: number
    attitude_rating: number
    tactical_rating: number
    duration_minutes: number | null
    intensity_level: number | null
    notes: string
  } | null
}

export default function CoachSessionDetailPage() {
  const params = useParams()
  const { profile } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<PlayerWithRating[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState<{ [playerId: string]: any }>({})

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    // Fetch session
    const { data: sessionData } = await supabase
      .from('sessions')
      .select(`
        id,
        date,
        start_time,
        end_time,
        session_type,
        notes,
        court:courts(name)
      `)
      .eq('id', params.id)
      .single() as { data: any }

    // Transform court from array to object if needed
    const transformedSession = sessionData ? {
      ...sessionData,
      court: Array.isArray(sessionData.court) ? sessionData.court[0] || null : sessionData.court
    } : null

    setSession(transformedSession)

    // Calculate default duration
    let defaultDuration = 60
    if (sessionData) {
      const [startH, startM] = sessionData.start_time.split(':').map(Number)
      const [endH, endM] = sessionData.end_time.split(':').map(Number)
      defaultDuration = (endH * 60 + endM) - (startH * 60 + startM)
    }

    // Fetch players in this session with their ratings
    const { data: sessionPlayers } = await supabase
      .from('session_players')
      .select(`
        player:players(id, name, email)
      `)
      .eq('session_id', params.id) as { data: any[] | null }

    if (sessionPlayers) {
      const playersWithRatings: PlayerWithRating[] = []
      const initialFormData: { [key: string]: any } = {}

      for (const sp of sessionPlayers) {
        if (!sp.player) continue

        // Fetch rating for this player
        const { data: rating } = await supabase
          .from('session_ratings')
          .select('*')
          .eq('session_id', params.id)
          .eq('player_id', sp.player.id)
          .single()

        playersWithRatings.push({
          player: sp.player,
          rating: rating || null
        })

        initialFormData[sp.player.id] = {
          overall_rating: rating?.overall_rating || 0,
          effort_rating: rating?.effort_rating || 0,
          technique_rating: rating?.technique_rating || 0,
          attitude_rating: rating?.attitude_rating || 0,
          tactical_rating: rating?.tactical_rating || 0,
          duration_minutes: rating?.duration_minutes?.toString() || defaultDuration.toString(),
          intensity_level: rating?.intensity_level?.toString() || '',
          notes: rating?.notes || ''
        }
      }

      setPlayers(playersWithRatings)
      setFormData(initialFormData)
    }

    setLoading(false)
  }

  const handleSaveRating = async (playerId: string) => {
    if (!session) return

    setSaving(playerId)
    const data = formData[playerId]
    const existingPlayer = players.find(p => p.player.id === playerId)

    const ratingData = {
      session_id: session.id,
      player_id: playerId,
      overall_rating: data.overall_rating || null,
      effort_rating: data.effort_rating || null,
      technique_rating: data.technique_rating || null,
      attitude_rating: data.attitude_rating || null,
      tactical_rating: data.tactical_rating || null,
      duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
      intensity_level: data.intensity_level ? parseInt(data.intensity_level) : null,
      notes: data.notes || null
    }

    if (existingPlayer?.rating?.id) {
      await supabase
        .from('session_ratings')
        .update(ratingData)
        .eq('id', existingPlayer.rating.id)
    } else {
      await supabase
        .from('session_ratings')
        .insert(ratingData)
    }

    setSaving(null)
    fetchData()
  }

  const updateFormData = (playerId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }))
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-stone-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Session not found</h2>
        <Link href="/dashboard/coach/sessions" className="text-red-600 hover:text-red-700">
          Back to sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard/coach/sessions"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to sessions
      </Link>

      {/* Session Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800 capitalize">
              {session.session_type?.replace('_', ' ') || 'Training Session'}
            </h1>
            <p className="text-stone-500">{formatDate(session.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-stone-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
          </div>
          {session.court && (
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="w-4 h-4" />
              <span>{session.court.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-stone-600">
            <Users className="w-4 h-4" />
            <span>{players.length} players</span>
          </div>
        </div>
      </div>

      {/* Player Ratings */}
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Player Ratings</h2>

      {players.length > 0 ? (
        <div className="space-y-4">
          {players.map((playerData) => {
            const { player, rating } = playerData
            const isExpanded = expandedPlayer === player.id
            const data = formData[player.id] || {}
            const initials = player.name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)

            return (
              <div key={player.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {/* Player Header */}
                <button
                  onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{initials}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-stone-800">{player.name}</p>
                      <p className="text-sm text-stone-500">{player.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {rating?.overall_rating ? (
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="font-medium">{rating.overall_rating}/5</span>
                        <span>★</span>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">Not rated</span>
                    )}
                    <ChevronLeft className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded Rating Form */}
                {isExpanded && (
                  <div className="p-6 border-t border-stone-100 bg-stone-50">
                    <div className="space-y-6">
                      {/* Overall Rating */}
                      <div className="p-4 bg-white rounded-lg">
                        <StarRating
                          label="Overall Rating"
                          value={data.overall_rating || 0}
                          onChange={(v) => updateFormData(player.id, 'overall_rating', v)}
                          size="lg"
                          showValue
                        />
                      </div>

                      {/* Category Ratings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg">
                          <StarRating
                            label="Effort"
                            value={data.effort_rating || 0}
                            onChange={(v) => updateFormData(player.id, 'effort_rating', v)}
                            size="md"
                          />
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                          <StarRating
                            label="Technique"
                            value={data.technique_rating || 0}
                            onChange={(v) => updateFormData(player.id, 'technique_rating', v)}
                            size="md"
                          />
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                          <StarRating
                            label="Attitude"
                            value={data.attitude_rating || 0}
                            onChange={(v) => updateFormData(player.id, 'attitude_rating', v)}
                            size="md"
                          />
                        </div>
                        <div className="p-4 bg-white rounded-lg">
                          <StarRating
                            label="Tactical"
                            value={data.tactical_rating || 0}
                            onChange={(v) => updateFormData(player.id, 'tactical_rating', v)}
                            size="md"
                          />
                        </div>
                      </div>

                      {/* Load Tracking */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Duration (minutes)</label>
                          <input
                            type="number"
                            value={data.duration_minutes || ''}
                            onChange={(e) => updateFormData(player.id, 'duration_minutes', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Intensity (RPE 1-10)</label>
                          <input
                            type="number"
                            value={data.intensity_level || ''}
                            onChange={(e) => updateFormData(player.id, 'intensity_level', e.target.value)}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Coach Notes</label>
                        <textarea
                          value={data.notes || ''}
                          onChange={(e) => updateFormData(player.id, 'notes', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Notes about this player's performance..."
                        />
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSaveRating(player.id)}
                          disabled={saving === player.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving === player.id ? 'Saving...' : 'Save Rating'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No players in this session</h3>
          <p className="text-stone-500">Add players to this session to start rating.</p>
        </div>
      )}
    </div>
  )
}
