'use client'

import { useState } from 'react'
import { Loader2, Save, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createInjuryAction, updateInjuryAction, clearInjuryAction } from '../actions'
import type { Injury, InjuryInsert, InjuryUpdate, InjurySeverity, InjuryStatus } from '../types'

interface InjuryFormProps {
  playerId: string
  injury?: Injury | null
  onSuccess?: (injury: Injury) => void
  onCancel?: () => void
  className?: string
}

const BODY_PARTS = [
  'Head',
  'Neck',
  'Shoulder (Left)',
  'Shoulder (Right)',
  'Upper Arm (Left)',
  'Upper Arm (Right)',
  'Elbow (Left)',
  'Elbow (Right)',
  'Forearm (Left)',
  'Forearm (Right)',
  'Wrist (Left)',
  'Wrist (Right)',
  'Hand (Left)',
  'Hand (Right)',
  'Upper Back',
  'Lower Back',
  'Hip (Left)',
  'Hip (Right)',
  'Thigh (Left)',
  'Thigh (Right)',
  'Knee (Left)',
  'Knee (Right)',
  'Calf (Left)',
  'Calf (Right)',
  'Ankle (Left)',
  'Ankle (Right)',
  'Foot (Left)',
  'Foot (Right)',
  'Other',
]

const SEVERITIES: { value: InjurySeverity; label: string; description: string; color: string }[] = [
  {
    value: 'minor',
    label: 'Minor',
    description: 'Can continue training with modifications',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Limited training, needs rest and recovery',
    color: 'bg-orange-100 text-orange-700 border-orange-300'
  },
  {
    value: 'severe',
    label: 'Severe',
    description: 'No training, requires medical attention',
    color: 'bg-red-100 text-red-700 border-red-300'
  },
]

const STATUSES: { value: InjuryStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-red-100 text-red-700' },
  { value: 'recovering', label: 'Recovering', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'cleared', label: 'Cleared', color: 'bg-green-100 text-green-700' },
]

export function InjuryForm({
  playerId,
  injury,
  onSuccess,
  onCancel,
  className,
}: InjuryFormProps) {
  const isEditing = !!injury

  const [formData, setFormData] = useState({
    body_part: injury?.body_part || '',
    description: injury?.description || '',
    severity: (injury?.severity || 'minor') as InjurySeverity,
    status: (injury?.status || 'active') as InjuryStatus,
    injury_date: injury?.injury_date || new Date().toISOString().split('T')[0],
    expected_return: injury?.expected_return || '',
    actual_return: injury?.actual_return || '',
    notes: injury?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
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

    if (!formData.body_part) {
      newErrors.body_part = 'Body part is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.injury_date) {
      newErrors.injury_date = 'Injury date is required'
    }

    if (formData.status === 'cleared' && !formData.actual_return) {
      newErrors.actual_return = 'Return date is required when marking as cleared'
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
      let result: Injury

      if (isEditing && injury) {
        // If marking as cleared, use the clearInjury mutation
        if (formData.status === 'cleared' && injury.status !== 'cleared') {
          result = await clearInjuryAction(playerId, injury.id, formData.actual_return)
        } else {
          const updateData: InjuryUpdate = {
            body_part: formData.body_part,
            description: formData.description.trim(),
            severity: formData.severity,
            status: formData.status,
            injury_date: formData.injury_date,
            expected_return: formData.expected_return || null,
            actual_return: formData.actual_return || null,
            notes: formData.notes.trim() || null,
          }
          result = await updateInjuryAction(playerId, injury.id, updateData)
        }
      } else {
        const insertData: InjuryInsert = {
          player_id: playerId,
          body_part: formData.body_part,
          description: formData.description.trim(),
          severity: formData.severity,
          status: formData.status,
          injury_date: formData.injury_date,
          expected_return: formData.expected_return || null,
          notes: formData.notes.trim() || null,
        }
        result = await createInjuryAction(insertData)
      }

      onSuccess?.(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save injury')
    } finally {
      setSaving(false)
    }
  }

  const handleClearInjury = async () => {
    if (!injury || !formData.actual_return) return

    setSaving(true)
    setSubmitError(null)

    try {
      const result = await clearInjuryAction(playerId, injury.id, formData.actual_return)
      onSuccess?.(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to clear injury')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900">
            {isEditing ? 'Edit Injury' : 'Log Injury'}
          </h2>
        </div>
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
        {/* Body Part and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Body Part <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.body_part}
              onChange={(e) => handleChange('body_part', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.body_part ? 'border-red-500' : 'border-stone-300'
              )}
            >
              <option value="">Select body part</option>
              {BODY_PARTS.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
            {errors.body_part && (
              <p className="mt-1 text-sm text-red-500">{errors.body_part}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Injury Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.injury_date}
              onChange={(e) => handleChange('injury_date', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.injury_date ? 'border-red-500' : 'border-stone-300'
              )}
            />
            {errors.injury_date && (
              <p className="mt-1 text-sm text-red-500">{errors.injury_date}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none',
              errors.description ? 'border-red-500' : 'border-stone-300'
            )}
            placeholder="Describe the injury..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Severity Selection */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Severity <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SEVERITIES.map((sev) => (
              <button
                key={sev.value}
                type="button"
                onClick={() => handleChange('severity', sev.value)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  formData.severity === sev.value
                    ? sev.color + ' border-current'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                )}
              >
                <p className="font-medium">{sev.label}</p>
                <p className="text-xs mt-1 opacity-80">{sev.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Status (only for editing) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleChange('status', status.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    formData.status === status.value
                      ? status.color
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expected and Actual Return Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Expected Return Date
            </label>
            <input
              type="date"
              value={formData.expected_return}
              onChange={(e) => handleChange('expected_return', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {(isEditing || formData.status === 'cleared') && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Actual Return Date {formData.status === 'cleared' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={formData.actual_return}
                onChange={(e) => handleChange('actual_return', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                  errors.actual_return ? 'border-red-500' : 'border-stone-300'
                )}
              />
              {errors.actual_return && (
                <p className="mt-1 text-sm text-red-500">{errors.actual_return}</p>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            placeholder="Treatment, restrictions, or any other notes..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Quick Clear Action (for editing active injuries) */}
        {isEditing && injury?.status !== 'cleared' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={formData.actual_return}
              onChange={(e) => handleChange('actual_return', e.target.value)}
              placeholder="Return date"
              className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={handleClearInjury}
              disabled={saving || !formData.actual_return}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
            >
              Clear Injury
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
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
                {isEditing ? 'Update Injury' : 'Log Injury'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
