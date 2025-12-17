'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/auth/auth-provider'
import { ChevronLeft, Dumbbell, Flame, Activity, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Exercise = {
  id: string
  category: 'strength' | 'conditioning' | 'flexibility'
  exercise_name: string
  sets: string
  reps: string
  weight_kg: string
  duration_seconds: string
  distance_meters: string
  rpe: string
}

const categoryPresets = {
  strength: ['Bench Press', 'Squats', 'Deadlift', 'Lunges', 'Pull-ups', 'Rows', 'Shoulder Press', 'Leg Press'],
  conditioning: ['Running', 'Sprints', 'Cycling', 'Jump Rope', 'Rowing', 'HIIT', 'Swimming', 'Court Drills'],
  flexibility: ['Stretching', 'Yoga', 'Foam Rolling', 'Dynamic Warmup', 'Cool Down', 'Mobility Work', 'Pilates'],
}

export default function LogFitnessPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: crypto.randomUUID(),
      category: 'strength',
      exercise_name: '',
      sets: '',
      reps: '',
      weight_kg: '',
      duration_seconds: '',
      distance_meters: '',
      rpe: ''
    }
  ])

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        category: 'strength',
        exercise_name: '',
        sets: '',
        reps: '',
        weight_kg: '',
        duration_seconds: '',
        distance_meters: '',
        rpe: ''
      }
    ])
  }

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(e => e.id !== id))
    }
  }

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.player_id) return

    setSaving(true)
    setError('')

    // Filter out empty exercises
    const validExercises = exercises.filter(e => e.exercise_name.trim())

    if (validExercises.length === 0) {
      setError('Please add at least one exercise')
      setSaving(false)
      return
    }

    const logsToInsert = validExercises.map(exercise => ({
      player_id: profile.player_id,
      log_date: date,
      category: exercise.category,
      exercise_name: exercise.exercise_name,
      sets: exercise.sets ? parseInt(exercise.sets) : null,
      reps: exercise.reps ? parseInt(exercise.reps) : null,
      weight_kg: exercise.weight_kg ? parseFloat(exercise.weight_kg) : null,
      duration_seconds: exercise.duration_seconds ? parseInt(exercise.duration_seconds) : null,
      distance_meters: exercise.distance_meters ? parseFloat(exercise.distance_meters) * 1000 : null, // Convert km to meters
      rpe: exercise.rpe ? parseInt(exercise.rpe) : null
    }))

    const { error: insertError } = await supabase
      .from('fitness_logs')
      .insert(logsToInsert)

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push('/dashboard/player/fitness')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return <Dumbbell className="w-5 h-5" />
      case 'conditioning':
        return <Flame className="w-5 h-5" />
      case 'flexibility':
        return <Activity className="w-5 h-5" />
      default:
        return <Dumbbell className="w-5 h-5" />
    }
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard/player/fitness"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to fitness
      </Link>

      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Log Workout</h1>
            <p className="text-stone-500">Record your fitness activities</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Date Selection */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Workout Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Exercises */}
          <div className="space-y-4 mb-6">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-stone-800">Exercise {index + 1}</h3>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                    <div className="flex gap-3">
                      {(['strength', 'conditioning', 'flexibility'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => updateExercise(exercise.id, 'category', cat)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                            exercise.category === cat
                              ? cat === 'strength' ? 'border-purple-500 bg-purple-50 text-purple-700' :
                                cat === 'conditioning' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                                'border-green-500 bg-green-50 text-green-700'
                              : 'border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {getCategoryIcon(cat)}
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exercise Name */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Exercise Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={exercise.exercise_name}
                        onChange={(e) => updateExercise(exercise.id, 'exercise_name', e.target.value)}
                        placeholder="Enter exercise name"
                        list={`preset-${exercise.id}`}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <datalist id={`preset-${exercise.id}`}>
                        {categoryPresets[exercise.category].map(preset => (
                          <option key={preset} value={preset} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Exercise Details - conditional based on category */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {exercise.category === 'strength' && (
                      <>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Sets</label>
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                            placeholder="3"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Reps</label>
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                            placeholder="10"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            value={exercise.weight_kg}
                            onChange={(e) => updateExercise(exercise.id, 'weight_kg', e.target.value)}
                            placeholder="50"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </>
                    )}

                    {exercise.category === 'conditioning' && (
                      <>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Duration (sec)</label>
                          <input
                            type="number"
                            value={exercise.duration_seconds}
                            onChange={(e) => updateExercise(exercise.id, 'duration_seconds', e.target.value)}
                            placeholder="1800"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Distance (km)</label>
                          <input
                            type="number"
                            value={exercise.distance_meters}
                            onChange={(e) => updateExercise(exercise.id, 'distance_meters', e.target.value)}
                            placeholder="5.0"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </>
                    )}

                    {exercise.category === 'flexibility' && (
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">Duration (sec)</label>
                        <input
                          type="number"
                          value={exercise.duration_seconds}
                          onChange={(e) => updateExercise(exercise.id, 'duration_seconds', e.target.value)}
                          placeholder="600"
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          min="0"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-stone-500 mb-1">RPE (1-10)</label>
                      <input
                        type="number"
                        value={exercise.rpe}
                        onChange={(e) => updateExercise(exercise.id, 'rpe', e.target.value)}
                        placeholder="7"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Exercise Button */}
          <button
            type="button"
            onClick={addExercise}
            className="w-full mb-6 py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-stone-400 hover:text-stone-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Exercise
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/player/fitness"
              className="px-4 py-2 text-stone-600 hover:text-stone-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
