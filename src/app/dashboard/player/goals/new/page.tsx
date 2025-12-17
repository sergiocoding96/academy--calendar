'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/auth/auth-provider'
import { ChevronLeft, Target } from 'lucide-react'
import Link from 'next/link'

const goalTypes = [
  { value: 'practice', label: 'Practice', description: 'Tennis skills, technique, or training goals' },
  { value: 'strength', label: 'Strength', description: 'Weight training and muscle building' },
  { value: 'conditioning', label: 'Conditioning', description: 'Cardio, endurance, and stamina' },
  { value: 'flexibility', label: 'Flexibility', description: 'Stretching, mobility, and recovery' },
]

export default function NewGoalPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState({
    title: '',
    goal_type: 'practice',
    target_value: '',
    target_unit: '',
    target_date: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.player_id) return

    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('goals').insert({
      player_id: profile.player_id,
      title: formData.title,
      goal_type: formData.goal_type,
      target_value: formData.target_value ? parseFloat(formData.target_value) : null,
      target_unit: formData.target_unit || null,
      target_date: formData.target_date || null,
      current_value: 0,
      status: 'active'
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push('/dashboard/player/goals')
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard/player/goals"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to goals
      </Link>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Create New Goal</h1>
            <p className="text-stone-500">Set a new practice or fitness goal</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Goal Title */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Improve serve speed to 120mph"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Goal Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {goalTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal_type: type.value })}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      formData.goal_type === type.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <p className="font-medium text-stone-800">{type.label}</p>
                    <p className="text-xs text-stone-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Value and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder="e.g., 120"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  min="0"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.target_unit}
                  onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                  placeholder="e.g., mph, kg, hours, reps"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-xs text-stone-400 mt-1">When do you want to achieve this goal?</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <Link
                href="/dashboard/player/goals"
                className="px-4 py-2 text-stone-600 hover:text-stone-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !formData.title}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
