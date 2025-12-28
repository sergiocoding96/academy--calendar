'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Attendance, AttendanceStatus } from '../types'

interface AttendanceCalendarProps {
  attendance: Attendance[]
  onMarkAttendance?: (date: string, status: AttendanceStatus) => void
  canEdit?: boolean
  className?: string
}

const STATUS_CONFIG: Record<AttendanceStatus, { color: string; icon: React.ComponentType<any>; label: string }> = {
  present: { color: 'bg-green-500', icon: Check, label: 'Present' },
  absent: { color: 'bg-red-500', icon: X, label: 'Absent' },
  late: { color: 'bg-yellow-500', icon: Clock, label: 'Late' },
  excused: { color: 'bg-blue-500', icon: Calendar, label: 'Excused' },
  tournament: { color: 'bg-purple-500', icon: Calendar, label: 'Tournament' },
  injured: { color: 'bg-orange-500', icon: Calendar, label: 'Injured' },
  holiday: { color: 'bg-stone-400', icon: Calendar, label: 'Holiday' },
}

export function AttendanceCalendar({
  attendance,
  onMarkAttendance,
  canEdit = false,
  className
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const attendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>()
    attendance.forEach(a => map.set(a.attendance_date, a))
    return map
  }, [attendance])

  const { year, month, days, firstDayOfWeek } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    // Add empty slots for days before the first of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return { year, month, days, firstDayOfWeek }
  }, [currentDate])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isFuture = (day: number) => {
    const date = new Date(year, month, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }

  const handleDayClick = (day: number) => {
    if (!canEdit || isFuture(day)) return
    const dateStr = getDateString(day)
    setSelectedDate(selectedDate === dateStr ? null : dateStr)
  }

  const handleStatusSelect = (status: AttendanceStatus) => {
    if (selectedDate && onMarkAttendance) {
      onMarkAttendance(selectedDate, status)
      setSelectedDate(null)
    }
  }

  return (
    <div className={cn('bg-white rounded-xl border border-stone-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-100">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h3 className="font-semibold text-stone-800">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-stone-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-10" />
            }

            const dateStr = getDateString(day)
            const dayAttendance = attendanceMap.get(dateStr)
            const status = dayAttendance?.status
            const statusConfig = status ? STATUS_CONFIG[status] : null
            const today = isToday(day)
            const future = isFuture(day)
            const isSelected = selectedDate === dateStr

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={future || !canEdit}
                className={cn(
                  'relative h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                  today && 'ring-2 ring-red-500 ring-offset-1',
                  future && 'text-stone-300 cursor-not-allowed',
                  !future && !statusConfig && 'text-stone-600 hover:bg-stone-100',
                  statusConfig && 'text-white',
                  isSelected && 'ring-2 ring-offset-1 ring-stone-400',
                  canEdit && !future && 'cursor-pointer'
                )}
                style={{ backgroundColor: statusConfig && !future ? undefined : undefined }}
              >
                {statusConfig && !future ? (
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', statusConfig.color)}>
                    <span className="text-white text-xs font-medium">{day}</span>
                  </div>
                ) : (
                  <span>{day}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status selector (when a date is selected) */}
      {selectedDate && canEdit && (
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <p className="text-sm text-stone-600 mb-3">
            Mark attendance for {new Date(selectedDate).toLocaleDateString()}:
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).map(([status, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    config.color,
                    'hover:opacity-90'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 border-t border-stone-100">
        <p className="text-xs font-medium text-stone-500 mb-2">Legend</p>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).slice(0, 4).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', config.color)} />
              <span className="text-xs text-stone-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
