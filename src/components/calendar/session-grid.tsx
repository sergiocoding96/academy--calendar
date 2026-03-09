'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { cn, generateTimeSlots, getCoachColor } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'
import { MOCK_CALENDAR_SESSIONS } from '@/lib/mock-data'
import { Modal } from '@/components/ui/modal'

type CalendarSession = {
  id: string
  date: string
  start_time: string
  end_time: string
  session_type: string
  court_id: string
  is_private?: boolean
}

type CalendarCoach = {
  id?: string
  name: string
}

type CalendarCourt = {
  id?: string
  name: string
  surface?: string
}

type CalendarPlayer = {
  id?: string
  name: string
}

interface SessionWithDetails extends CalendarSession {
  coach?: CalendarCoach
  court?: CalendarCourt
  players?: CalendarPlayer[]
}

const UNASSIGNED_COURT_ID = '__unassigned__'

const COURTS = [
  { id: 'hc1', name: 'HC 1', surface: 'Hard' },
  { id: 'hc2', name: 'HC 2', surface: 'Hard' },
  { id: 'clay1', name: 'Clay 1', surface: 'Clay' },
  { id: 'clay2', name: 'Clay 2', surface: 'Clay' },
  { id: 'clay3', name: 'Clay 3', surface: 'Clay' },
  { id: 'hc3', name: 'HC 3', surface: 'Hard' },
  { id: UNASSIGNED_COURT_ID, name: 'TBC', surface: '' },
]

const TIME_SLOTS = generateTimeSlots(7, 21)

export function SessionGrid() {
  const router = useRouter()
  const { isGuest, profile, loading: authLoading } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Add Session modal state (for coaches/admins)
  const [addOpen, setAddOpen] = useState(false)
  const [addDate, setAddDate] = useState<Date | null>(null)
  const [addStartTime, setAddStartTime] = useState('09:00')
  const [addEndTime, setAddEndTime] = useState('10:00')
  const [addType, setAddType] = useState('training')
  const [addReason, setAddReason] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const handleAddSessionClick = () => {
    if (isGuest || !profile) {
      router.push('/login?redirect=/sessions')
      return
    }

    if (profile.role === 'coach' || profile.role === 'admin') {
      setAddError(null)
      setAddReason('')
      setAddDate(selectedDay)
      setAddOpen(true)
      return
    }

    // Players or other roles just go to their dashboard
    router.push('/dashboard')
  }

  const handleSubmitAddSession = async () => {
    if (!addDate) {
      setAddError('Date is required')
      return
    }
    if (!addReason.trim()) {
      setAddError('Reason is required')
      return
    }

    setAddSubmitting(true)
    setAddError(null)

    try {
      const dateStr = format(addDate, 'yyyy-MM-dd')

      const res = await fetch('/api/schedule/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change_type: 'add_session',
          target_session_id: null,
          reason: addReason.trim(),
          proposed_payload: {
            date: dateStr,
            start_time: addStartTime,
            end_time: addEndTime,
            // court_id / coach_id optional for now
            session_type: addType,
          },
        }),
      })

      const data = await res.json().catch(() => ({} as Record<string, unknown>))
      if (!res.ok) {
        setAddError(data.error || 'Failed to create session request')
        return
      }

      setAddOpen(false)
    } catch {
      setAddError('Unexpected error submitting request')
    } finally {
      setAddSubmitting(false)
    }
  }

  // Fetch sessions from Supabase or use mock data for guest
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setFetchError(null)

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setFetchError('Request timed out. Please check your connection and try again.')
    }, 15000)

    try {
      if (isGuest) {
        const dateStr = format(selectedDay, 'yyyy-MM-dd')
        const mockSessionsForDay = MOCK_CALENDAR_SESSIONS.filter(
          (session) => session.date === dateStr
        ).map((session) => ({
          ...session,
          players: session.players,
        })) as SessionWithDetails[]
        setSessions(mockSessionsForDay)
        clearTimeout(timeoutId)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const dateStr = format(selectedDay, 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          coach:coaches(*),
          court:courts(*),
          session_players(
            player:players(*)
          )
        `)
        .eq('date', dateStr)
        .order('start_time')

      clearTimeout(timeoutId)

      if (error) {
        console.error('Error fetching sessions:', error)
        setFetchError('Unable to load sessions for this day. Please try again or refresh the page.')
        setSessions([])
      } else {
        const sessionsWithPlayers: SessionWithDetails[] = data?.map((session: Record<string, unknown> & { session_players?: { player: CalendarPlayer }[] }) => ({
          ...(session as unknown as SessionWithDetails),
          players: session.session_players?.map((sp) => sp.player).filter(Boolean)
        })) || []
        setSessions(sessionsWithPlayers)
      }
    } catch (err) {
      console.error('Unexpected error fetching sessions:', err)
      clearTimeout(timeoutId)
      setFetchError('Unexpected error while loading the calendar. Please try again.')
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [selectedDay, isGuest])

  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      // Safety net: if auth hangs for more than 10 s, stop loading so the UI
      // doesn't appear frozen. The user can still change the day to retry.
      const safetyTimeout = setTimeout(() => {
        setLoading(false)
        setFetchError('Authentication took too long. Please refresh the page.')
      }, 10_000)
      return () => clearTimeout(safetyTimeout)
    }
    fetchSessions()
  }, [authLoading, fetchSessions])

  // Refetch when user returns to this tab (e.g. after approving a new session on another page)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isGuest) {
        fetchSessions()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [fetchSessions, isGuest])

  const getSessionsForSlot = (courtId: string, timeSlot: string) => {
    return sessions.filter(session => {
      const sessionStart = session.start_time?.substring(0, 5)
      const timeMatches = sessionStart === timeSlot
      if (courtId === UNASSIGNED_COURT_ID) {
        return (session.court_id == null || session.court_id === '') && timeMatches
      }
      return session.court_id === courtId && timeMatches
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7))
  }

  // Build a dynamic coach legend from the sessions we actually have
  const legendCoaches = Array.from(
    new Set(
      sessions
        .map((session) => session.coach?.name)
        .filter((name): name is string => Boolean(name))
    )
  ).slice(0, 8)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      {/* Header with Week Navigation */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Session Calendar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium px-4">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            onClick={handleAddSessionClick}
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDay)
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'flex-1 py-3 px-2 rounded-xl text-center transition-all duration-200',
                  isSelected
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'hover:bg-white/20',
                  isToday && !isSelected && 'ring-2 ring-white/50'
                )}
              >
                <div className="text-xs font-medium opacity-80">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid Header - Courts */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-stone-200">
        <div className="p-3 bg-stone-50 border-r border-stone-200">
          <span className="text-xs font-medium text-stone-500">Time</span>
        </div>
        {COURTS.map((court) => (
          <div
            key={court.id}
            className="p-3 bg-stone-50 border-r border-stone-200 last:border-r-0 text-center"
          >
            <div className="font-semibold text-stone-800">{court.name}</div>
            <div className="text-xs text-stone-500">{court.surface}</div>
          </div>
        ))}
      </div>

      {/* Grid Body - Time Slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {authLoading || loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm text-stone-500">Loading sessions…</p>
          </div>
        ) : sessions.length === 0 && fetchError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-sm text-red-600 mb-2">{fetchError}</p>
            <p className="text-xs text-stone-500">
              You can also try changing the day or refreshing the page.
            </p>
          </div>
        ) : (
          TIME_SLOTS.map((timeSlot) => (
            <div
              key={timeSlot}
              className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-stone-100 last:border-b-0"
            >
              {/* Time Label */}
              <div className="p-2 border-r border-stone-200 bg-stone-50 flex items-start justify-end pr-3">
                <span className="text-xs font-medium text-stone-500">{timeSlot}</span>
              </div>

              {/* Court Cells */}
              {COURTS.map((court) => {
                const slotSessions = getSessionsForSlot(court.id, timeSlot)

                return (
                  <div
                    key={`${court.id}-${timeSlot}`}
                    className="min-h-[50px] border-r border-stone-100 last:border-r-0 p-1 hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    {slotSessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          'rounded-lg p-2 text-xs text-white shadow-sm',
                          session.coach?.name
                            ? getCoachColor(session.coach.name)
                            : 'bg-gray-500'
                        )}
                      >
                        <div className="font-semibold truncate">
                          {session.coach?.name || 'Unassigned'}
                        </div>
                        {session.players && session.players.length > 0 && (
                          <div className="text-white/80 truncate">
                            {session.players.map(p => p.name).join(', ')}
                          </div>
                        )}
                        {session.is_private && (
                          <span className="text-[10px] bg-white/20 px-1 rounded">Private</span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer - Legend */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-medium text-stone-500">Coaches:</span>
          {legendCoaches.length === 0 ? (
            <span className="text-xs text-stone-400">
              No sessions loaded yet — legend will appear once sessions are available.
            </span>
          ) : (
            legendCoaches.map((coach) => (
              <div key={coach} className="flex items-center gap-1">
                <div className={cn('w-3 h-3 rounded', getCoachColor(coach))} />
                <span className="text-xs text-stone-600">{coach}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Session Modal (for coach/admin) */}
      <Modal
        isOpen={addOpen}
        onClose={() => !addSubmitting && setAddOpen(false)}
        title="Request new session"
        description="Propose a new training session for approval."
        size="lg"
      >
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
            <input
              type="date"
              value={addDate ? format(addDate, 'yyyy-MM-dd') : ''}
              onChange={(e) =>
                setAddDate(e.target.value ? new Date(e.target.value) : null)
              }
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addSubmitting}
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Start time
              </label>
              <input
                type="time"
                value={addStartTime}
                onChange={(e) => setAddStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={addSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                End time
              </label>
              <input
                type="time"
                value={addEndTime}
                onChange={(e) => setAddEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={addSubmitting}
              />
            </div>
          </div>

          {/* Session type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Session type
            </label>
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addSubmitting}
            >
              <option value="training">Training</option>
              <option value="private">Private</option>
              <option value="group">Group</option>
              <option value="fitness">Fitness</option>
              <option value="physio">Physio</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Reason *
            </label>
            <textarea
              value={addReason}
              onChange={(e) => setAddReason(e.target.value)}
              placeholder="Why do you need this session?"
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addSubmitting}
            />
          </div>

          {addError && <p className="text-sm text-red-600">{addError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              disabled={addSubmitting}
              className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAddSession}
              disabled={addSubmitting || !addDate || !addReason.trim()}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {addSubmitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
