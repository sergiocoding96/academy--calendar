'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Save,
  X,
  Calendar,
  MapPin,
  Trash2,
  Edit2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createWhereabouts, updateWhereabouts, deleteWhereabouts } from '../lib/mutations'
import type { Whereabouts, WhereaboutsInsert, WhereaboutsUpdate, WhereaboutsType } from '../types'

interface WhereaboutsCalendarProps {
  playerId: string
  whereabouts: Whereabouts[]
  onWhereaboutsChange?: () => void
  className?: string
}

const WHEREABOUTS_TYPES: { value: WhereaboutsType; label: string; color: string; bgColor: string }[] = [
  { value: 'tournament', label: 'Tournament', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'holiday', label: 'Holiday', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'camp', label: 'Camp', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'injured', label: 'Injured', color: 'text-red-700', bgColor: 'bg-red-100' },
  { value: 'other', label: 'Other', color: 'text-stone-700', bgColor: 'bg-stone-100' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface WhereaboutsFormData {
  whereabouts_type: WhereaboutsType
  start_date: string
  end_date: string
  description: string
  location: string
}

function WhereaboutsForm({
  entry,
  onSave,
  onCancel,
  saving,
}: {
  entry?: Whereabouts | null
  onSave: (data: WhereaboutsFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState<WhereaboutsFormData>({
    whereabouts_type: entry?.whereabouts_type || 'tournament',
    start_date: entry?.start_date || today,
    end_date: entry?.end_date || today,
    description: entry?.description || '',
    location: entry?.location || '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.start_date || !formData.end_date) {
      setError('Start and end dates are required')
      return
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after start date')
      return
    }

    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-stone-200 p-4 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {WHEREABOUTS_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, whereabouts_type: type.value }))}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                formData.whereabouts_type === type.value
                  ? cn(type.bgColor, type.color)
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="e.g., Miami, FL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          placeholder="Additional details..."
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </form>
  )
}

export function WhereaboutsCalendar({
  playerId,
  whereabouts,
  onWhereaboutsChange,
  className,
}: WhereaboutsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Whereabouts | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Whereabouts | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Next month days to fill grid
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [year, month])

  // Map whereabouts to dates
  const whereaboutsByDate = useMemo(() => {
    const map = new Map<string, Whereabouts[]>()

    whereabouts.forEach((entry) => {
      const start = new Date(entry.start_date)
      const end = new Date(entry.end_date)

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0]
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key)!.push(entry)
      }
    })

    return map
  }, [whereabouts])

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const handleSave = async (data: WhereaboutsFormData) => {
    setSaving(true)
    try {
      if (editingEntry) {
        const updateData: WhereaboutsUpdate = {
          whereabouts_type: data.whereabouts_type,
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description.trim() || null,
          location: data.location.trim() || null,
        }
        await updateWhereabouts(editingEntry.id, updateData)
      } else {
        const insertData: WhereaboutsInsert = {
          player_id: playerId,
          whereabouts_type: data.whereabouts_type,
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description.trim() || null,
          location: data.location.trim() || null,
        }
        await createWhereabouts(insertData)
      }
      setShowForm(false)
      setEditingEntry(null)
      onWhereaboutsChange?.()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    await deleteWhereabouts(entryId)
    setSelectedEntry(null)
    onWhereaboutsChange?.()
  }

  const handleEdit = (entry: Whereabouts) => {
    setEditingEntry(entry)
    setShowForm(true)
    setSelectedEntry(null)
  }

  const getTypeInfo = (type: WhereaboutsType) => {
    return WHEREABOUTS_TYPES.find(t => t.value === type) || WHEREABOUTS_TYPES[4]
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-stone-600" />
          <h3 className="font-semibold text-stone-900">Whereabouts</h3>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingEntry(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <WhereaboutsForm
          entry={editingEntry}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingEntry(null)
          }}
          saving={saving}
        />
      )}

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-stone-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h4 className="font-semibold text-stone-900">
            {MONTHS[month]} {year}
          </h4>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-stone-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Day Headers */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-stone-500 bg-stone-50 border-b border-stone-200"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dateKey = date.toISOString().split('T')[0]
            const entries = whereaboutsByDate.get(dateKey) || []
            const isToday = date.getTime() === today.getTime()

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[80px] p-1 border-b border-r border-stone-200',
                  !isCurrentMonth && 'bg-stone-50'
                )}
              >
                <div className={cn(
                  'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                  !isCurrentMonth && 'text-stone-400',
                  isToday && 'bg-red-600 text-white'
                )}>
                  {date.getDate()}
                </div>

                {entries.slice(0, 2).map((entry, idx) => {
                  const typeInfo = getTypeInfo(entry.whereabouts_type)
                  return (
                    <button
                      key={entry.id + '-' + idx}
                      onClick={() => setSelectedEntry(entry)}
                      className={cn(
                        'w-full text-left px-1 py-0.5 text-xs rounded truncate mb-0.5',
                        typeInfo.bgColor,
                        typeInfo.color
                      )}
                    >
                      {entry.description || entry.whereabouts_type}
                    </button>
                  )
                })}

                {entries.length > 2 && (
                  <p className="text-xs text-stone-500 px-1">
                    +{entries.length - 2} more
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 bg-stone-50 rounded-lg">
        {WHEREABOUTS_TYPES.map((type) => (
          <div key={type.value} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded', type.bgColor)} />
            <span className="text-xs text-stone-600">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Selected Entry Details */}
      {selectedEntry && (
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  getTypeInfo(selectedEntry.whereabouts_type).bgColor,
                  getTypeInfo(selectedEntry.whereabouts_type).color
                )}>
                  {getTypeInfo(selectedEntry.whereabouts_type).label}
                </span>
              </div>

              <div className="text-sm text-stone-600 space-y-1">
                <p>
                  <span className="font-medium">Dates: </span>
                  {new Date(selectedEntry.start_date).toLocaleDateString()} - {new Date(selectedEntry.end_date).toLocaleDateString()}
                </p>
                {selectedEntry.location && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedEntry.location}
                  </p>
                )}
                {selectedEntry.description && (
                  <p>{selectedEntry.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(selectedEntry)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(selectedEntry.id)}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Entries List */}
      {whereabouts.length > 0 && (
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <h4 className="font-medium text-stone-900 mb-3">Upcoming</h4>
          <div className="space-y-2">
            {whereabouts
              .filter(w => new Date(w.end_date) >= today)
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .slice(0, 5)
              .map((entry) => {
                const typeInfo = getTypeInfo(entry.whereabouts_type)
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg text-left"
                  >
                    <div className={cn('w-2 h-8 rounded-full', typeInfo.bgColor)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {entry.description || entry.whereabouts_type}
                      </p>
                      <p className="text-xs text-stone-500">
                        {new Date(entry.start_date).toLocaleDateString()} - {new Date(entry.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    {entry.location && (
                      <span className="text-xs text-stone-400 truncate max-w-[100px]">
                        {entry.location}
                      </span>
                    )}
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
