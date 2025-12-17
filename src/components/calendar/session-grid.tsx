'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { cn, generateTimeSlots, getCoachColor } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'
import { MOCK_CALENDAR_SESSIONS } from '@/lib/mock-data'
import type { Session, Coach, Court, Player } from '@/types/database'

interface SessionWithDetails extends Session {
  coach?: Coach
  court?: Court
  players?: Player[]
}

const COURTS = [
  { id: 'hc1', name: 'HC 1', surface: 'Hard' },
  { id: 'hc2', name: 'HC 2', surface: 'Hard' },
  { id: 'clay1', name: 'Clay 1', surface: 'Clay' },
  { id: 'clay2', name: 'Clay 2', surface: 'Clay' },
  { id: 'clay3', name: 'Clay 3', surface: 'Clay' },
  { id: 'hc3', name: 'HC 3', surface: 'Hard' },
]

const TIME_SLOTS = generateTimeSlots(7, 21)

export function SessionGrid() {
  const { isGuest } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Fetch sessions from Supabase or use mock data for guest
  useEffect(() => {
    async function fetchSessions() {
      setLoading(true)

      // Use mock data for guest users
      if (isGuest) {
        const dateStr = format(selectedDay, 'yyyy-MM-dd')
        const mockSessionsForDay = MOCK_CALENDAR_SESSIONS.filter(
          (session) => session.date === dateStr
        ).map((session) => ({
          ...session,
          players: session.players,
        })) as SessionWithDetails[]
        setSessions(mockSessionsForDay)
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

      if (error) {
        console.error('Error fetching sessions:', error)
      } else {
        const sessionsWithPlayers = data?.map((session: any) => ({
          ...session,
          players: session.session_players?.map((sp: any) => sp.player).filter(Boolean)
        })) || []
        setSessions(sessionsWithPlayers)
      }

      setLoading(false)
    }

    fetchSessions()
  }, [selectedDay, isGuest])

  const getSessionsForSlot = (courtId: string, timeSlot: string) => {
    return sessions.filter(session => {
      const sessionStart = session.start_time?.substring(0, 5)
      return session.court_id === courtId && sessionStart === timeSlot
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7))
  }

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
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
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
      <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-stone-200">
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          TIME_SLOTS.map((timeSlot) => (
            <div
              key={timeSlot}
              className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-stone-100 last:border-b-0"
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
          {['Tom P', 'Andris', 'Tomy', 'Sergio', 'DK', 'Joe D'].map((coach) => (
            <div key={coach} className="flex items-center gap-1">
              <div className={cn('w-3 h-3 rounded', getCoachColor(coach))} />
              <span className="text-xs text-stone-600">{coach}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
