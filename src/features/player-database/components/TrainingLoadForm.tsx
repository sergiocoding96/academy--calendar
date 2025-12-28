'use client'

import { useState } from 'react'
import { Loader2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createTrainingLoad, updateTrainingLoad } from '../lib/mutations'
import type { TrainingLoad, TrainingLoadInsert, TrainingLoadUpdate } from '../types'

interface TrainingLoadFormProps {
  playerId: string
  trainingLoad?: TrainingLoad | null
  onSuccess?: (load: TrainingLoad) => void
  onCancel?: () => void
  className?: string
}

const RPE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Rest', color: 'bg-green-100 text-green-700' },
  2: { label: 'Very Easy', color: 'bg-green-100 text-green-700' },
  3: { label: 'Easy', color: 'bg-green-200 text-green-700' },
  4: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
  5: { label: 'Somewhat Hard', color: 'bg-yellow-200 text-yellow-700' },
  6: { label: 'Hard', color: 'bg-orange-100 text-orange-700' },
  7: { label: 'Very Hard', color: 'bg-orange-200 text-orange-700' },
  8: { label: 'Very Very Hard', color: 'bg-red-100 text-red-700' },
  9: { label: 'Near Max', color: 'bg-red-200 text-red-700' },
  10: { label: 'Maximal', color: 'bg-red-300 text-red-800' },
}

const SESSION_TYPES = [
  'On-Court Training',
  'Match Play',
  'Fitness Session',
  'Strength Training',
  'Recovery Session',
  'Tournament Match',
  'Private Lesson',
  'Group Session',
  'Other',
]

export function TrainingLoadForm({
  playerId,
  trainingLoad,
  onSuccess,
  onCancel,
  className,
}: TrainingLoadFormProps) {
  const isEditing = !!trainingLoad

  const [formData, setFormData] = useState({
    session_date: trainingLoad?.session_date || new Date().toISOString().split('T')[0],
    rpe: trainingLoad?.rpe || 5,
    duration_minutes: trainingLoad?.duration_minutes?.toString() || '60',
    session_type: trainingLoad?.session_type || '',
    notes: trainingLoad?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.session_date) {
      newErrors.session_date = 'Date is required'
    }

    const duration = parseInt(formData.duration_minutes)
    if (isNaN(duration) || duration < 1 || duration > 480) {
      newErrors.duration_minutes = 'Duration must be between 1 and 480 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSaving(true)

    try {
      const data = {
        player_id: playerId,
        session_date: formData.session_date,
        rpe: formData.rpe,
        duration_minutes: parseInt(formData.duration_minutes),
        session_type: formData.session_type || null,
        notes: formData.notes.trim() || null,
      }

      let result: TrainingLoad
      if (isEditing && trainingLoad) {
        const updateData: TrainingLoadUpdate = {
          session_date: data.session_date,
          rpe: data.rpe,
          duration_minutes: data.duration_minutes,
          session_type: data.session_type,
          notes: data.notes,
        }
        result = await updateTrainingLoad(trainingLoad.id, updateData)
      } else {
        result = await createTrainingLoad(data as TrainingLoadInsert)
      }

      onSuccess?.(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save training load')
    } finally {
      setSaving(false)
    }
  }

  const rpeInfo = RPE_LABELS[formData.rpe]

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-900">
          {isEditing ? 'Edit Training Load' : 'Log Training Load'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-500 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {submitError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-6">
        {/* Date and Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Session Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.session_date}
              onChange={(e) => handleChange('session_date', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.session_date ? 'border-red-500' : 'border-stone-300'
              )}
            />
            {errors.session_date && (
              <p className="mt-1 text-sm text-red-500">{errors.session_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={formData.duration_minutes}
              onChange={(e) => handleChange('duration_minutes', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.duration_minutes ? 'border-red-500' : 'border-stone-300'
              )}
              placeholder="60"
            />
            {errors.duration_minutes && (
              <p className="mt-1 text-sm text-red-500">{errors.duration_minutes}</p>
            )}
          </div>
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Session Type
          </label>
          <select
            value={formData.session_type}
            onChange={(e) => handleChange('session_type', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select type</option>
            {SESSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* RPE Slider */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Rate of Perceived Exertion (RPE) <span className="text-red-500">*</span>
          </label>

          {/* Current RPE Display */}
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-stone-900 mb-2">
                {formData.rpe}
              </div>
              <span className={cn('px-3 py-1 rounded-full text-sm font-medium', rpeInfo.color)}>
                {rpeInfo.label}
              </span>
            </div>
          </div>

          {/* RPE Slider */}
          <div className="relative pt-1">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.rpe}
              onChange={(e) => handleChange('rpe', parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-lg appearance-none cursor-pointer"
              style={{
                WebkitAppearance: 'none',
              }}
            />
            <div className="flex justify-between text-xs text-stone-500 mt-2">
              <span>1 - Rest</span>
              <span>5 - Moderate</span>
              <span>10 - Max</span>
            </div>
          </div>

          {/* RPE Quick Select Buttons */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleChange('rpe', value)}
                className={cn(
                  'py-2 text-sm font-medium rounded-lg transition-colors',
                  formData.rpe === value
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            placeholder="Any additional notes about the session..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? 'Update' : 'Log Training'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
