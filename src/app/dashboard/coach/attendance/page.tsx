'use client'

import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Users, Check, X, Clock } from 'lucide-react'
import { usePlayers } from '@/features/player-database/hooks'
import { QuickAttendance, BulkAttendance } from '@/features/player-database/components'
import { markAttendance } from '@/features/player-database/lib/mutations'
import { getPlayerAttendance } from '@/features/player-database/lib/queries'
import { createClient } from '@/lib/supabase/client'
import type { AttendanceStatus, Attendance } from '@/features/player-database/types'
import { cn } from '@/lib/utils'
import { useEffect, useCallback } from 'react'

export default function CoachAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMap, setAttendanceMap] = useState<Map<string, Attendance>>(new Map())
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unmarked' | 'present' | 'absent'>('all')

  const { players, loading: playersLoading } = usePlayers()

  // Fetch attendance for all players for the selected date
  const fetchAllAttendance = useCallback(async () => {
    if (players.length === 0) return

    setLoadingAttendance(true)
    try {
      const supabase = createClient() as any
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', selectedDate)

      if (error) throw error

      const map = new Map<string, Attendance>()
      ;(data as Attendance[] || []).forEach((a: Attendance) => map.set(a.player_id, a))
      setAttendanceMap(map)
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
    } finally {
      setLoadingAttendance(false)
    }
  }, [players.length, selectedDate])

  useEffect(() => {
    fetchAllAttendance()
  }, [fetchAllAttendance])

  // Filter players
  const filteredPlayers = useMemo(() => {
    const activePlayers = players.filter(p => p.is_active !== false)

    switch (filter) {
      case 'unmarked':
        return activePlayers.filter(p => !attendanceMap.has(p.id))
      case 'present':
        return activePlayers.filter(p => attendanceMap.get(p.id)?.status === 'present')
      case 'absent':
        return activePlayers.filter(p => attendanceMap.get(p.id)?.status === 'absent')
      default:
        return activePlayers
    }
  }, [players, attendanceMap, filter])

  // Stats
  const stats = useMemo(() => {
    const activePlayers = players.filter(p => p.is_active !== false)
    const total = activePlayers.length
    const marked = activePlayers.filter(p => attendanceMap.has(p.id)).length
    const present = activePlayers.filter(p => attendanceMap.get(p.id)?.status === 'present').length
    const absent = activePlayers.filter(p => attendanceMap.get(p.id)?.status === 'absent').length
    const late = activePlayers.filter(p => attendanceMap.get(p.id)?.status === 'late').length
    const unmarked = total - marked

    return { total, marked, present, absent, late, unmarked }
  }, [players, attendanceMap])

  const handleMarkAttendance = async (playerId: string, status: AttendanceStatus, date: string) => {
    try {
      const newEntry = await markAttendance({
        player_id: playerId,
        attendance_date: date,
        status
      })
      setAttendanceMap(prev => {
        const newMap = new Map(prev)
        newMap.set(playerId, newEntry)
        return newMap
      })
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      throw err
    }
  }

  const handleMarkBulk = async (entries: { playerId: string; status: AttendanceStatus }[], date: string) => {
    try {
      for (const entry of entries) {
        await handleMarkAttendance(entry.playerId, entry.status, date)
      }
    } catch (err) {
      console.error('Failed to mark bulk attendance:', err)
    }
  }

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const isFuture = new Date(selectedDate) > new Date(new Date().toISOString().split('T')[0])

  if (playersLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Daily Attendance</h1>
            <p className="text-stone-500">Mark player attendance for training sessions</p>
          </div>
        </div>

        {/* Date selector */}
        <div className="flex items-center gap-4 bg-white rounded-xl border border-stone-200 p-3 w-fit">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="text-center min-w-[200px]">
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-lg font-semibold text-stone-800 border-none focus:ring-0 cursor-pointer bg-transparent"
            />
            {isToday && (
              <span className="block text-xs text-green-600 font-medium">Today</span>
            )}
          </div>
          <button
            onClick={() => handleDateChange(1)}
            disabled={isToday}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-stone-400" />
            <p className="text-sm text-stone-500">Total</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-green-500" />
            <p className="text-sm text-stone-500">Present</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <X className="w-4 h-4 text-red-500" />
            <p className="text-sm text-stone-500">Absent</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-stone-500">Late</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-stone-500">Marked</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.marked}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-orange-500" />
            <p className="text-sm text-stone-500">Unmarked</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.unmarked}</p>
        </div>
      </div>

      {/* Bulk actions and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Bulk attendance */}
        {filteredPlayers.length > 0 && !isFuture && (
          <BulkAttendance
            players={filteredPlayers.map(p => ({ id: p.id, name: p.full_name }))}
            date={selectedDate}
            onMarkBulk={handleMarkBulk}
          />
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-stone-500">Show:</span>
          {(['all', 'unmarked', 'present', 'absent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                filter === f
                  ? 'bg-red-100 text-red-700'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Future date warning */}
      {isFuture && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-700">
            Cannot mark attendance for future dates. Please select today or a past date.
          </p>
        </div>
      )}

      {/* Players list */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="p-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">
            Players ({filteredPlayers.length})
          </h3>
        </div>

        {loadingAttendance ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            No players match the current filter
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredPlayers.map((player) => {
              const playerAttendance = attendanceMap.get(player.id)

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-stone-600">
                          {player.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      )}
                    </div>

                    {/* Player info */}
                    <div>
                      <p className="font-medium text-stone-800">{player.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        {player.category && (
                          <span className="capitalize">{player.category}</span>
                        )}
                        {player.current_utr && (
                          <>
                            <span>•</span>
                            <span>UTR {player.current_utr.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick attendance buttons */}
                  {!isFuture && (
                    <QuickAttendance
                      playerId={player.id}
                      playerName={player.full_name}
                      currentStatus={playerAttendance?.status}
                      date={selectedDate}
                      onMark={handleMarkAttendance}
                    />
                  )}

                  {/* Status badge for future dates */}
                  {isFuture && playerAttendance && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium capitalize bg-stone-100 text-stone-600">
                      {playerAttendance.status}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
