'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, Calendar, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { AttendanceStats, AttendanceCalendar } from '@/features/player-database/components'
import { usePlayer, useAttendance } from '@/features/player-database/hooks'
import type { AttendanceStatus } from '@/features/player-database/types'

export default function CoachPlayerAttendancePage() {
  const params = useParams()
  const playerId = params.id as string
  const [markingDate, setMarkingDate] = useState<string | null>(null)

  const { player, loading: playerLoading, error: playerError } = usePlayer(playerId)
  const {
    attendance,
    loading: attendanceLoading,
    stats,
    markStatus,
    refetch
  } = useAttendance(playerId)

  const loading = playerLoading || attendanceLoading

  const handleMarkAttendance = async (date: string, status: AttendanceStatus) => {
    setMarkingDate(date)
    try {
      await markStatus(status, date)
      await refetch()
    } catch (err) {
      console.error('Failed to mark attendance:', err)
    } finally {
      setMarkingDate(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (playerError || !player) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{playerError?.message || 'Failed to load player'}</p>
        <Link href="/dashboard/coach/players" className="text-red-600 hover:text-red-700">
          Back to players
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/coach/players/${playerId}`}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {player.full_name}
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Attendance</h1>
            <p className="text-stone-500">{player.full_name}&apos;s attendance record</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <AttendanceStats attendance={attendance} className="mb-6" />

      {/* Attendance Rate Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className={`w-8 h-8 ${
              stats.attendanceRate >= 90 ? 'text-green-500' :
              stats.attendanceRate >= 75 ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <div>
              <p className="text-sm text-stone-500">Overall Attendance Rate</p>
              <p className={`text-3xl font-bold ${
                stats.attendanceRate >= 90 ? 'text-green-600' :
                stats.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.attendanceRate}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">Total Days Tracked</p>
            <p className="text-xl font-semibold text-stone-800">{stats.totalDays}</p>
          </div>
        </div>
      </div>

      {/* Calendar and Recent List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Calendar */}
        <AttendanceCalendar
          attendance={attendance}
          onMarkAttendance={handleMarkAttendance}
          canEdit={true}
        />

        {/* Recent Attendance List */}
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="p-4 border-b border-stone-100">
            <h3 className="font-semibold text-stone-800">Recent Attendance</h3>
            <p className="text-sm text-stone-500">Last 30 entries</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {attendance.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                No attendance records yet
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {attendance.slice(0, 30).map((entry) => {
                  const statusColors: Record<AttendanceStatus, string> = {
                    present: 'bg-green-100 text-green-700',
                    absent: 'bg-red-100 text-red-700',
                    late: 'bg-yellow-100 text-yellow-700',
                    excused: 'bg-blue-100 text-blue-700',
                    tournament: 'bg-purple-100 text-purple-700',
                    injured: 'bg-orange-100 text-orange-700',
                    holiday: 'bg-stone-100 text-stone-700',
                  }

                  return (
                    <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-stone-50">
                      <div>
                        <p className="font-medium text-stone-800">
                          {new Date(entry.attendance_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {entry.notes && (
                          <p className="text-sm text-stone-500 mt-1">{entry.notes}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[entry.status]}`}>
                        {entry.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay for marking attendance */}
      {markingDate && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <div className="w-6 h-6 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
            <span className="text-stone-700">Marking attendance...</span>
          </div>
        </div>
      )}
    </div>
  )
}
