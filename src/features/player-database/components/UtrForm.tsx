'use client'

import { useState } from 'react'
import { X, TrendingUp } from 'lucide-react'
import { useUtrHistory } from '../hooks'
import { cn } from '@/lib/utils'

interface UtrFormProps {
  playerId: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

const UTR_SOURCES = [
  { value: 'official', label: 'Official UTR' },
  { value: 'tournament', label: 'Tournament Result' },
  { value: 'match', label: 'Match Play' },
  { value: 'estimate', label: 'Coach Estimate' },
  { value: 'other', label: 'Other' },
]

export function UtrForm({ playerId, onSuccess, onCancel, className }: UtrFormProps) {
  const { addEntry, stats } = useUtrHistory(playerId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [utrValue, setUtrValue] = useState('')
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split('T')[0])
  const [source, setSource] = useState('official')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!utrValue) return

    const value = parseFloat(utrValue)
    if (isNaN(value) || value < 1 || value > 16.5) {
      setError('UTR must be between 1.00 and 16.50')
      return
    }

    setSaving(true)
    setError('')

    try {
      await addEntry({
        utr_value: value,
        recorded_date: recordedDate,
        source: source || null,
        notes: notes || null,
      })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save UTR entry')
    } finally {
      setSaving(false)
    }
  }

  const changeFromCurrent = stats.currentUtr && utrValue
    ? parseFloat(utrValue) - stats.currentUtr
    : null

  return (
    <div className={cn('bg-white rounded-xl border border-stone-200', className)}>
      <div className="flex items-center justify-between p-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">Add UTR Entry</h3>
            {stats.currentUtr && (
              <p className="text-sm text-stone-500">Current UTR: {stats.currentUtr.toFixed(2)}</p>
            )}
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* UTR Value */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              UTR Value *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="1"
                max="16.5"
                value={utrValue}
                onChange={(e) => setUtrValue(e.target.value)}
                placeholder="e.g., 8.50"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
              {changeFromCurrent !== null && utrValue && (
                <span className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium',
                  changeFromCurrent > 0 ? 'text-green-600' : changeFromCurrent < 0 ? 'text-red-600' : 'text-stone-500'
                )}>
                  {changeFromCurrent > 0 ? '+' : ''}{changeFromCurrent.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">Range: 1.00 - 16.50</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Date Recorded *
            </label>
            <input
              type="date"
              value={recordedDate}
              onChange={(e) => setRecordedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {UTR_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes about this UTR update..."
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-stone-600 hover:text-stone-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving || !utrValue}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save UTR Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}
