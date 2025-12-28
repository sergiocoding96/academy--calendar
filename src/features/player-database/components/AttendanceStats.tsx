'use client'

import { useMemo } from 'react'
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Attendance } from '../types'

interface AttendanceStatsProps {
  attendance: Attendance[]
  className?: string
}

export function AttendanceStats({ attendance, className }: AttendanceStatsProps) {
  const stats = useMemo(() => {
    const totalDays = attendance.length
    const present = attendance.filter(a => a.status === 'present').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const late = attendance.filter(a => a.status === 'late').length
    const excused = attendance.filter(a =>
      ['excused', 'tournament', 'injured', 'holiday'].includes(a.status)
    ).length

    // Attendance rate = (present + late) / (total - excused)
    const countedDays = totalDays - excused
    const attendanceRate = countedDays > 0
      ? ((present + late) / countedDays) * 100
      : 0

    return {
      totalDays,
      present,
      absent,
      late,
      excused,
      attendanceRate: Math.round(attendanceRate * 10) / 10
    }
  }, [attendance])

  const rateColor = stats.attendanceRate >= 90
    ? 'text-green-600'
    : stats.attendanceRate >= 75
    ? 'text-yellow-600'
    : 'text-red-600'

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {/* Attendance Rate */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-stone-400" />
          <p className="text-sm text-stone-500">Rate</p>
        </div>
        <p className={cn('text-2xl font-bold', rateColor)}>
          {stats.attendanceRate}%
        </p>
        <p className="text-xs text-stone-400">{stats.totalDays} days tracked</p>
      </div>

      {/* Present */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-stone-500">Present</p>
        </div>
        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
      </div>

      {/* Absent */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-stone-500">Absent</p>
        </div>
        <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
      </div>

      {/* Late */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          <p className="text-sm text-stone-500">Late</p>
        </div>
        <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
      </div>

      {/* Excused */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <p className="text-sm text-stone-500">Excused</p>
        </div>
        <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
      </div>
    </div>
  )
}
