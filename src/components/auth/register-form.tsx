'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { UserRole } from '@/types/database'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('player')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      let playerId: string | null = null
      let coachId: string | null = null

      // Auto-create player or coach profile
      if (role === 'player') {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert({
            name: fullName,
            email: email,
          } as any)
          .select('id')
          .single() as { data: { id: string } | null, error: any }

        if (playerError || !playerData) {
          console.error('Player creation error:', playerError)
          setError('Failed to create player profile')
          setLoading(false)
          return
        }
        playerId = playerData.id
      } else {
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .insert({
            name: fullName,
            email: email,
          } as any)
          .select('id')
          .single() as { data: { id: string } | null, error: any }

        if (coachError || !coachData) {
          console.error('Coach creation error:', coachError)
          setError('Failed to create coach profile')
          setLoading(false)
          return
        }
        coachId = coachData.id
      }

      // Create user profile
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        player_id: playerId,
        coach_id: coachId,
      } as any)

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-700 mb-6 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to home
      </Link>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`p-4 border-2 rounded-lg transition-all ${
                role === 'player'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-2xl mb-1">🎾</div>
              <div className="font-medium">Player</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`p-4 border-2 rounded-lg transition-all ${
                role === 'coach'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-2xl mb-1">👨‍🏫</div>
              <div className="font-medium">Coach</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
