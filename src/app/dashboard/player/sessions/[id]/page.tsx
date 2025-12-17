'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/auth/auth-provider'
import { StarRating } from '@/components/ui/star-rating'
import { Calendar, Clock, MapPin, User, ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'

type Session = {
  id: string
  date: string
  start_time: string
  end_time: string
  session_type: string
  notes: string
  court: { name: string } | null
  coach: { name: string } | null
}

type SessionRating = {
  id: string
  overall_rating: number
  effort_rating: number
  technique_rating: number
  attitude_rating: number
  tactical_rating: number
  duration_minutes: number
  intensity_level: number
  notes: string
}

export default function PlayerSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [rating, setRating] = useState<SessionRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState({
    overall_rating: 0,
    effort_rating: 0,
    technique_rating: 0,
    attitude_rating: 0,
    tactical_rating: 0,
    duration_minutes: '',
    intensity_level: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [params.id, profile])

  const fetchData = async () => {
    if (!profile?.player_id) return

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
        court:courts(name),
        coach:coaches(name)
      `)
      .eq('id', params.id)
      .single() as { data: any }

    // Transform array relations to objects
    const transformedSession = sessionData ? {
      ...sessionData,
      court: Array.isArray(sessionData.court) ? sessionData.court[0] || null : sessionData.court,
      coach: Array.isArray(sessionData.coach) ? sessionData.coach[0] || null : sessionData.coach
    } : null

    setSession(transformedSession)

    // Calculate default duration
    if (sessionData) {
      const [startH, startM] = sessionData.start_time.split(':').map(Number)
      const [endH, endM] = sessionData.end_time.split(':').map(Number)
      const defaultDuration = (endH * 60 + endM) - (startH * 60 + startM)

      // Fetch existing rating
      const { data: ratingData } = await supabase
        .from('session_ratings')
        .select('*')
        .eq('session_id', params.id)
        .eq('player_id', profile.player_id)
        .single()

      if (ratingData) {
        setRating(ratingData)
        setFormData({
          overall_rating: ratingData.overall_rating || 0,
          effort_rating: ratingData.effort_rating || 0,
          technique_rating: ratingData.technique_rating || 0,
          attitude_rating: ratingData.attitude_rating || 0,
          tactical_rating: ratingData.tactical_rating || 0,
          duration_minutes: ratingData.duration_minutes?.toString() || defaultDuration.toString(),
          intensity_level: ratingData.intensity_level?.toString() || '',
          notes: ratingData.notes || ''
        })
      } else {
        setFormData(prev => ({
          ...prev,
          duration_minutes: defaultDuration.toString()
        }))
      }
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile?.player_id || !session) return

    setSaving(true)

    const ratingData = {
      session_id: session.id,
      player_id: profile.player_id,
      overall_rating: formData.overall_rating || null,
      effort_rating: formData.effort_rating || null,
      technique_rating: formData.technique_rating || null,
      attitude_rating: formData.attitude_rating || null,
      tactical_rating: formData.tactical_rating || null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      intensity_level: formData.intensity_level ? parseInt(formData.intensity_level) : null,
      notes: formData.notes || null
    }

    if (rating) {
      // Update existing
      await supabase
        .from('session_ratings')
        .update(ratingData)
        .eq('id', rating.id)
    } else {
      // Insert new
      await supabase
        .from('session_ratings')
        .insert(ratingData)
    }

    setSaving(false)
    router.push('/dashboard/player/schedule')
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
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-8"></div>
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
        <Link href="/dashboard/player/schedule" className="text-red-600 hover:text-red-700">
          Back to schedule
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard/player/schedule"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to schedule
      </Link>

      <div className="max-w-2xl">
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

          <div className="grid grid-cols-2 gap-4 text-sm">
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
            {session.coach && (
              <div className="flex items-center gap-2 text-stone-600">
                <User className="w-4 h-4" />
                <span>{session.coach.name}</span>
              </div>
            )}
          </div>

          {session.notes && (
            <p className="mt-4 text-sm text-stone-500 italic">{session.notes}</p>
          )}
        </div>

        {/* Rating Form */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-6">Session Rating</h2>

          <div className="space-y-6">
            {/* Overall Rating */}
            <div className="p-4 bg-stone-50 rounded-lg">
              <StarRating
                label="Overall Rating"
                value={formData.overall_rating}
                onChange={(v) => setFormData({ ...formData, overall_rating: v })}
                size="lg"
                showValue
              />
            </div>

            {/* Category Ratings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-lg">
                <StarRating
                  label="Effort"
                  value={formData.effort_rating}
                  onChange={(v) => setFormData({ ...formData, effort_rating: v })}
                  size="md"
                />
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <StarRating
                  label="Technique"
                  value={formData.technique_rating}
                  onChange={(v) => setFormData({ ...formData, technique_rating: v })}
                  size="md"
                />
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <StarRating
                  label="Attitude"
                  value={formData.attitude_rating}
                  onChange={(v) => setFormData({ ...formData, attitude_rating: v })}
                  size="md"
                />
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <StarRating
                  label="Tactical"
                  value={formData.tactical_rating}
                  onChange={(v) => setFormData({ ...formData, tactical_rating: v })}
                  size="md"
                />
              </div>
            </div>

            {/* Load Tracking */}
            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-sm font-medium text-stone-700 mb-4">Load Tracking</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Intensity (RPE 1-10)</label>
                  <input
                    type="number"
                    value={formData.intensity_level}
                    onChange={(e) => setFormData({ ...formData, intensity_level: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="How did the session go? Any highlights or areas to improve?"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
