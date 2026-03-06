'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPlayerAction, updatePlayerAction } from '../actions'
import type { Player, PlayerInsert, PlayerUpdate, PlayerCategory, PlayerGender, Profile } from '../types'

interface PlayerFormProps {
  player?: Player | null
  coaches?: Pick<Profile, 'id' | 'full_name'>[]
  onSuccess?: (player: Player) => void
  onCancel?: () => void
  className?: string
}

const CATEGORIES: PlayerCategory[] = ['U10', 'U12', 'U14', 'U16', 'U18', 'Open', 'Adult']
const GENDERS: { value: PlayerGender; label: string }[] = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
]

export function PlayerForm({
  player,
  coaches = [],
  onSuccess,
  onCancel,
  className,
}: PlayerFormProps) {
  const isEditing = !!player

  // Form state
  const [formData, setFormData] = useState({
    full_name: player?.full_name || '',
    nickname: player?.nickname || '',
    date_of_birth: player?.date_of_birth || '',
    category: player?.category || '',
    gender: player?.gender || '',
    current_utr: player?.current_utr?.toString() || '',
    coach_id: player?.coach_id || '',
    phone: player?.phone || '',
    email: player?.email || '',
    parent_name: player?.parent_name || '',
    parent_phone: player?.parent_phone || '',
    parent_email: player?.parent_email || '',
    emergency_contact: player?.emergency_contact || '',
    emergency_phone: player?.emergency_phone || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Update form when player prop changes
  useEffect(() => {
    if (player) {
      setFormData({
        full_name: player.full_name || '',
        nickname: player.nickname || '',
        date_of_birth: player.date_of_birth || '',
        category: player.category || '',
        gender: player.gender || '',
        current_utr: player.current_utr?.toString() || '',
        coach_id: player.coach_id || '',
        phone: player.phone || '',
        email: player.email || '',
        parent_name: player.parent_name || '',
        parent_phone: player.parent_phone || '',
        parent_email: player.parent_email || '',
        emergency_contact: player.emergency_contact || '',
        emergency_phone: player.emergency_phone || '',
      })
    }
  }, [player])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
      newErrors.parent_email = 'Invalid email format'
    }

    if (formData.current_utr) {
      const utr = parseFloat(formData.current_utr)
      if (isNaN(utr) || utr < 1 || utr > 16.5) {
        newErrors.current_utr = 'UTR must be between 1 and 16.5'
      }
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
      const data: PlayerInsert | PlayerUpdate = {
        full_name: formData.full_name.trim(),
        nickname: formData.nickname.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        category: (formData.category as PlayerCategory) || null,
        gender: (formData.gender as PlayerGender) || null,
        current_utr: formData.current_utr ? parseFloat(formData.current_utr) : null,
        coach_id: formData.coach_id || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        parent_name: formData.parent_name.trim() || null,
        parent_phone: formData.parent_phone.trim() || null,
        parent_email: formData.parent_email.trim() || null,
        emergency_contact: formData.emergency_contact.trim() || null,
        emergency_phone: formData.emergency_phone.trim() || null,
      }

      let result: Player
      if (isEditing && player) {
        result = await updatePlayerAction(player.id, data as PlayerUpdate)
      } else {
        result = await createPlayerAction(data as PlayerInsert)
      }

      onSuccess?.(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save player')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-900">
          {isEditing ? 'Edit Player' : 'Add New Player'}
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

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="font-medium text-stone-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.full_name ? 'border-red-500' : 'border-stone-300'
              )}
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nickname
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Optional nickname"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Current UTR
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max="16.5"
              value={formData.current_utr}
              onChange={(e) => handleChange('current_utr', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.current_utr ? 'border-red-500' : 'border-stone-300'
              )}
              placeholder="e.g., 8.5"
            />
            {errors.current_utr && (
              <p className="mt-1 text-sm text-red-500">{errors.current_utr}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Assigned Coach
            </label>
            <select
              value={formData.coach_id}
              onChange={(e) => handleChange('coach_id', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">No coach assigned</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="font-medium text-stone-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Player's phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.email ? 'border-red-500' : 'border-stone-300'
              )}
              placeholder="Player's email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Parent/Guardian Information */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="font-medium text-stone-900 mb-4">Parent/Guardian Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Parent Name
            </label>
            <input
              type="text"
              value={formData.parent_name}
              onChange={(e) => handleChange('parent_name', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Parent/guardian name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Parent Phone
            </label>
            <input
              type="tel"
              value={formData.parent_phone}
              onChange={(e) => handleChange('parent_phone', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Parent's phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Parent Email
            </label>
            <input
              type="email"
              value={formData.parent_email}
              onChange={(e) => handleChange('parent_email', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500',
                errors.parent_email ? 'border-red-500' : 'border-stone-300'
              )}
              placeholder="Parent's email"
            />
            {errors.parent_email && (
              <p className="mt-1 text-sm text-red-500">{errors.parent_email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="font-medium text-stone-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={formData.emergency_contact}
              onChange={(e) => handleChange('emergency_contact', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Emergency Phone
            </label>
            <input
              type="tel"
              value={formData.emergency_phone}
              onChange={(e) => handleChange('emergency_phone', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Emergency phone number"
            />
          </div>
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
              {isEditing ? 'Update Player' : 'Add Player'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
