'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getPlayerAttendance } from '../lib/queries'
import { markAttendance, updateAttendance, deleteAttendance, markBulkAttendance } from '../lib/mutations'
import type { Attendance, AttendanceInsert, AttendanceUpdate, DateRange, AttendanceStatus } from '../types'

interface UseAttendanceOptions {
  dateRange?: DateRange
}

interface AttendanceStats {
  totalDays: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

interface UseAttendanceReturn {
  attendance: Attendance[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  markPresent: (date?: string) => Promise<Attendance>
  markAbsent: (date?: string, notes?: string) => Promise<Attendance>
  markStatus: (status: AttendanceStatus, date?: string, notes?: string) => Promise<Attendance>
  updateEntry: (attendanceId: string, data: AttendanceUpdate) => Promise<void>
  removeEntry: (attendanceId: string) => Promise<void>
  markMultiple: (entries: AttendanceInsert[]) => Promise<Attendance[]>
  stats: AttendanceStats
  getDateStatus: (date: string) => Attendance | undefined
}

export function useAttendance(
  playerId: string | null,
  options: UseAttendanceOptions = {}
): UseAttendanceReturn {
  const { dateRange } = options
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAttendance = useCallback(async () => {
    if (!playerId) {
      setAttendance([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getPlayerAttendance(playerId, dateRange)
      setAttendance(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch attendance'))
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }, [playerId, dateRange])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const markPresent = useCallback(async (date?: string): Promise<Attendance> => {
    if (!playerId) throw new Error('No player ID provided')

    const attendanceDate = date || new Date().toISOString().split('T')[0]
    const newEntry = await markAttendance({
      player_id: playerId,
      attendance_date: attendanceDate,
      status: 'present'
    })
    setAttendance(prev => [newEntry, ...prev.filter(a => a.attendance_date !== attendanceDate)])
    return newEntry
  }, [playerId])

  const markAbsent = useCallback(async (date?: string, notes?: string): Promise<Attendance> => {
    if (!playerId) throw new Error('No player ID provided')

    const attendanceDate = date || new Date().toISOString().split('T')[0]
    const newEntry = await markAttendance({
      player_id: playerId,
      attendance_date: attendanceDate,
      status: 'absent',
      notes: notes || null
    })
    setAttendance(prev => [newEntry, ...prev.filter(a => a.attendance_date !== attendanceDate)])
    return newEntry
  }, [playerId])

  const markStatus = useCallback(async (
    status: AttendanceStatus,
    date?: string,
    notes?: string
  ): Promise<Attendance> => {
    if (!playerId) throw new Error('No player ID provided')

    const attendanceDate = date || new Date().toISOString().split('T')[0]
    const newEntry = await markAttendance({
      player_id: playerId,
      attendance_date: attendanceDate,
      status,
      notes: notes || null
    })
    setAttendance(prev => [newEntry, ...prev.filter(a => a.attendance_date !== attendanceDate)])
    return newEntry
  }, [playerId])

  const updateEntry = useCallback(async (attendanceId: string, data: AttendanceUpdate) => {
    try {
      await updateAttendance(attendanceId, data)
      setAttendance(prev =>
        prev.map(entry => entry.id === attendanceId ? { ...entry, ...data } : entry)
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update attendance')
    }
  }, [])

  const removeEntry = useCallback(async (attendanceId: string) => {
    try {
      await deleteAttendance(attendanceId)
      setAttendance(prev => prev.filter(entry => entry.id !== attendanceId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete attendance')
    }
  }, [])

  const markMultiple = useCallback(async (entries: AttendanceInsert[]): Promise<Attendance[]> => {
    try {
      const newEntries = await markBulkAttendance(entries)
      await fetchAttendance() // Refetch to get accurate state
      return newEntries
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to mark attendance')
    }
  }, [fetchAttendance])

  // Calculate stats
  const stats = useMemo((): AttendanceStats => {
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

  // Helper to get status for a specific date
  const getDateStatus = useCallback((date: string): Attendance | undefined => {
    return attendance.find(a => a.attendance_date === date)
  }, [attendance])

  return {
    attendance,
    loading,
    error,
    refetch: fetchAttendance,
    markPresent,
    markAbsent,
    markStatus,
    updateEntry,
    removeEntry,
    markMultiple,
    stats,
    getDateStatus
  }
}
