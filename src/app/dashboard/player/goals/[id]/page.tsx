'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/auth/auth-provider'
import { Target, ChevronLeft, Plus, TrendingUp, Calendar, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type Goal = {
  id: string
  title: string
  goal_type: string
  target_value: number | null
  target_unit: string | null
  current_value: number
  target_date: string | null
  status: string
  created_at: string
}

type GoalProgress = {
  id: string
  recorded_at: string
  value: number
  notes: string | null
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [progress, setProgress] = useState<GoalProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState({
    value: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    // Fetch goal
    const { data: goalData } = await supabase
      .from('goals')
      .select('*')
      .eq('id', params.id)
      .single()

    setGoal(goalData)

    // Fetch progress records
    const { data: progressData } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('goal_id', params.id)
      .order('recorded_at', { ascending: false })

    setProgress(progressData || [])
    setLoading(false)
  }

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) return

    setSaving(true)

    // Insert progress record
    const { error: progressError } = await supabase.from('goal_progress').insert({
      goal_id: goal.id,
      value: parseFloat(formData.value),
      notes: formData.notes || null,
      recorded_at: new Date().toISOString()
    })

    if (!progressError) {
      // Update current value on goal
      const newValue = parseFloat(formData.value)
      await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goal.id)

      setShowProgressForm(false)
      setFormData({ value: '', notes: '' })
      fetchData()
    }

    setSaving(false)
  }

  const handleMarkComplete = async () => {
    if (!goal) return

    await supabase
      .from('goals')
      .update({ status: 'completed' })
      .eq('id', goal.id)

    fetchData()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const calculateProgress = () => {
    if (!goal || !goal.target_value || goal.target_value === 0) return 0
    const progress = (goal.current_value / goal.target_value) * 100
    return Math.min(progress, 100)
  }

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case 'practice':
        return 'bg-blue-100 text-blue-700'
      case 'strength':
        return 'bg-purple-100 text-purple-700'
      case 'conditioning':
        return 'bg-orange-100 text-orange-700'
      case 'flexibility':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-stone-100 text-stone-700'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-stone-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="p-8 text-center">
        <Target className="w-16 h-16 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Goal not found</h2>
        <Link href="/dashboard/player/goals" className="text-red-600 hover:text-red-700">
          Back to goals
        </Link>
      </div>
    )
  }

  const progressPercent = calculateProgress()

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

      {/* Goal Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">{goal.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getGoalTypeColor(goal.goal_type)}`}>
                  {goal.goal_type}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  goal.status === 'active' ? 'bg-green-100 text-green-700' :
                  goal.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-stone-100 text-stone-700'
                }`}>
                  {goal.status}
                </span>
              </div>
            </div>
          </div>

          {goal.status === 'active' && (
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-stone-500">Progress</span>
            <span className="font-medium text-stone-800">
              {goal.current_value} / {goal.target_value || '?'} {goal.target_unit || ''}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                progressPercent >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-stone-500 mt-2">{progressPercent.toFixed(0)}% complete</p>
        </div>

        {/* Goal Info */}
        <div className="grid grid-cols-2 gap-4">
          {goal.target_date && (
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Target: {formatDate(goal.target_date)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-stone-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{progress.length} progress updates</span>
          </div>
        </div>
      </div>

      {/* Add Progress Button */}
      {goal.status === 'active' && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-800">Progress History</h2>
          <button
            onClick={() => setShowProgressForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Progress
          </button>
        </div>
      )}

      {/* Progress Form */}
      {showProgressForm && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Log Progress</h3>
          <form onSubmit={handleAddProgress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Current Value <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={`Enter value`}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  step="any"
                  required
                />
                {goal.target_unit && (
                  <span className="text-stone-500">{goal.target_unit}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Any notes about this progress..."
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowProgressForm(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.value}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress History */}
      {progress.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {progress.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">
                        {item.value} {goal.target_unit || ''}
                      </p>
                      <p className="text-sm text-stone-500">{formatDateTime(item.recorded_at)}</p>
                    </div>
                  </div>
                </div>
                {item.notes && (
                  <p className="mt-2 text-sm text-stone-500 ml-13 pl-13">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No progress logged yet</h3>
          <p className="text-stone-500 mb-4">Start tracking your progress towards this goal.</p>
          {goal.status === 'active' && (
            <button
              onClick={() => setShowProgressForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log First Progress
            </button>
          )}
        </div>
      )}
    </div>
  )
}
