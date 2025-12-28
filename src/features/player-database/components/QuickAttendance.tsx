'use client'

import { useState } from 'react'
import { Check, X, Clock, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AttendanceStatus } from '../types'

interface QuickAttendanceProps {
  playerId: string
  playerName: string
  currentStatus?: AttendanceStatus
  date?: string
  onMark: (playerId: string, status: AttendanceStatus, date: string) => Promise<void>
  disabled?: boolean
  className?: string
}

const QUICK_STATUSES: { status: AttendanceStatus; icon: React.ComponentType<any>; color: string; bg: string }[] = [
  { status: 'present', icon: Check, color: 'text-green-600', bg: 'bg-green-100 hover:bg-green-200' },
  { status: 'absent', icon: X, color: 'text-red-600', bg: 'bg-red-100 hover:bg-red-200' },
  { status: 'late', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 hover:bg-yellow-200' },
]

export function QuickAttendance({
  playerId,
  playerName,
  currentStatus,
  date,
  onMark,
  disabled = false,
  className
}: QuickAttendanceProps) {
  const [loading, setLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const attendanceDate = date || new Date().toISOString().split('T')[0]

  const handleMark = async (status: AttendanceStatus) => {
    if (loading || disabled) return

    setLoading(true)
    try {
      await onMark(playerId, status, attendanceDate)
    } catch (err) {
      console.error('Failed to mark attendance:', err)
    } finally {
      setLoading(false)
      setShowMore(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {QUICK_STATUSES.map(({ status, icon: Icon, color, bg }) => (
        <button
          key={status}
          onClick={() => handleMark(status)}
          disabled={loading || disabled}
          title={`Mark ${playerName} as ${status}`}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            currentStatus === status
              ? cn(bg.replace('hover:', ''), 'ring-2 ring-offset-1', color.replace('text', 'ring'))
              : bg,
            (loading || disabled) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Icon className={cn('w-4 h-4', color)} />
        </button>
      ))}

      {/* More options dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowMore(!showMore)}
          disabled={loading || disabled}
          className={cn(
            'p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors',
            (loading || disabled) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <MoreHorizontal className="w-4 h-4 text-stone-600" />
        </button>

        {showMore && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMore(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-20">
              {(['excused', 'tournament', 'injured', 'holiday'] as AttendanceStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleMark(status)}
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 capitalize"
                >
                  {status}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Bulk attendance component for marking multiple players at once
interface BulkAttendanceProps {
  players: { id: string; name: string }[]
  date?: string
  onMarkBulk: (entries: { playerId: string; status: AttendanceStatus }[], date: string) => Promise<void>
  className?: string
}

export function BulkAttendance({ players, date, onMarkBulk, className }: BulkAttendanceProps) {
  const [loading, setLoading] = useState(false)
  const attendanceDate = date || new Date().toISOString().split('T')[0]

  const handleMarkAll = async (status: AttendanceStatus) => {
    if (loading) return

    setLoading(true)
    try {
      await onMarkBulk(
        players.map(p => ({ playerId: p.id, status })),
        attendanceDate
      )
    } catch (err) {
      console.error('Failed to mark bulk attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-2 p-3 bg-stone-50 rounded-lg', className)}>
      <span className="text-sm text-stone-600 mr-2">Mark all ({players.length}):</span>
      <button
        onClick={() => handleMarkAll('present')}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
        Present
      </button>
      <button
        onClick={() => handleMarkAll('absent')}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" />
        Absent
      </button>
    </div>
  )
}
