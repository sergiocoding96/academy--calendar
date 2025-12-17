'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/auth/auth-provider'
import { Trophy, MapPin, Calendar, Plus, ChevronLeft, CheckCircle, XCircle, Minus } from 'lucide-react'
import Link from 'next/link'

type Tournament = {
  id: string
  name: string
  start_date: string
  end_date: string
  location: string
  surface: string
  category: string
}

type MatchResult = {
  id: string
  opponent_name: string
  round: string
  match_date: string
  result: 'win' | 'loss' | 'walkover' | 'retired'
  score: string
  holds: number
  breaks: number
  aces: number
  double_faults: number
  winners: number
  unforced_errors: number
  notes: string
}

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [formData, setFormData] = useState({
    opponent_name: '',
    round: '',
    match_date: '',
    result: 'win' as const,
    score: '',
    holds: '',
    breaks: '',
    aces: '',
    double_faults: '',
    winners: '',
    unforced_errors: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [params.id, profile])

  const fetchData = async () => {
    if (!profile?.player_id) return

    // Fetch tournament
    const { data: tournamentData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', params.id)
      .single()

    setTournament(tournamentData)

    // Fetch match results
    const { data: matchData } = await supabase
      .from('match_results')
      .select('*')
      .eq('tournament_id', params.id)
      .eq('player_id', profile.player_id)
      .order('match_date', { ascending: true })

    setMatches(matchData || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.player_id) return

    setSaving(true)
    const { error } = await supabase.from('match_results').insert({
      tournament_id: params.id,
      player_id: profile.player_id,
      opponent_name: formData.opponent_name,
      round: formData.round,
      match_date: formData.match_date,
      result: formData.result,
      score: formData.score,
      holds: formData.holds ? parseInt(formData.holds) : null,
      breaks: formData.breaks ? parseInt(formData.breaks) : null,
      aces: formData.aces ? parseInt(formData.aces) : null,
      double_faults: formData.double_faults ? parseInt(formData.double_faults) : null,
      winners: formData.winners ? parseInt(formData.winners) : null,
      unforced_errors: formData.unforced_errors ? parseInt(formData.unforced_errors) : null,
      notes: formData.notes
    })

    if (!error) {
      setShowMatchForm(false)
      setFormData({
        opponent_name: '',
        round: '',
        match_date: tournament?.start_date || '',
        result: 'win',
        score: '',
        holds: '',
        breaks: '',
        aces: '',
        double_faults: '',
        winners: '',
        unforced_errors: '',
        notes: ''
      })
      fetchData()
    }
    setSaving(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'loss':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-stone-400" />
    }
  }

  const getResultBg = (result: string) => {
    switch (result) {
      case 'win':
        return 'bg-green-50 border-green-200'
      case 'loss':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-stone-50 border-stone-200'
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

  if (!tournament) {
    return (
      <div className="p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Tournament not found</h2>
        <Link href="/dashboard/player/tournaments" className="text-red-600 hover:text-red-700">
          Back to tournaments
        </Link>
      </div>
    )
  }

  const wins = matches.filter(m => m.result === 'win').length
  const losses = matches.filter(m => m.result === 'loss').length

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/dashboard/player/tournaments"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to tournaments
      </Link>

      {/* Tournament Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">{tournament.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tournament.location}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">Record</p>
            <p className="text-2xl font-bold text-stone-800">{wins}W - {losses}L</p>
          </div>
        </div>
      </div>

      {/* Add Match Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-stone-800">Match Results</h2>
        <button
          onClick={() => setShowMatchForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Match
        </button>
      </div>

      {/* Match Form */}
      {showMatchForm && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Log Match Result</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Opponent</label>
                <input
                  type="text"
                  value={formData.opponent_name}
                  onChange={(e) => setFormData({ ...formData, opponent_name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Round</label>
                <select
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select round</option>
                  <option value="R128">R128</option>
                  <option value="R64">R64</option>
                  <option value="R32">R32</option>
                  <option value="R16">R16</option>
                  <option value="QF">Quarterfinal</option>
                  <option value="SF">Semifinal</option>
                  <option value="F">Final</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Result</label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="walkover">Walkover</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">Score</label>
                <input
                  type="text"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  placeholder="e.g., 6-4, 3-6, 6-2"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4">
              <h4 className="text-sm font-medium text-stone-700 mb-3">Match Statistics (Optional)</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Holds</label>
                  <input
                    type="number"
                    value={formData.holds}
                    onChange={(e) => setFormData({ ...formData, holds: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Breaks</label>
                  <input
                    type="number"
                    value={formData.breaks}
                    onChange={(e) => setFormData({ ...formData, breaks: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Aces</label>
                  <input
                    type="number"
                    value={formData.aces}
                    onChange={(e) => setFormData({ ...formData, aces: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Double Faults</label>
                  <input
                    type="number"
                    value={formData.double_faults}
                    onChange={(e) => setFormData({ ...formData, double_faults: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Winners</label>
                  <input
                    type="number"
                    value={formData.winners}
                    onChange={(e) => setFormData({ ...formData, winners: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">Unforced Errors</label>
                  <input
                    type="number"
                    value={formData.unforced_errors}
                    onChange={(e) => setFormData({ ...formData, unforced_errors: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Any notes about the match..."
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowMatchForm(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Match'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Match List */}
      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`rounded-xl border p-4 ${getResultBg(match.result)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getResultIcon(match.result)}
                  <div>
                    <p className="font-medium text-stone-800">vs {match.opponent_name}</p>
                    <p className="text-sm text-stone-500">{match.round} • {formatDate(match.match_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-stone-800">{match.score || '-'}</p>
                  <p className="text-xs text-stone-400 capitalize">{match.result}</p>
                </div>
              </div>

              {(match.holds !== null || match.breaks !== null || match.aces !== null) && (
                <div className="mt-3 pt-3 border-t border-stone-200 flex flex-wrap gap-4 text-sm">
                  {match.holds !== null && (
                    <span className="text-stone-600">Holds: <strong>{match.holds}</strong></span>
                  )}
                  {match.breaks !== null && (
                    <span className="text-stone-600">Breaks: <strong>{match.breaks}</strong></span>
                  )}
                  {match.aces !== null && (
                    <span className="text-stone-600">Aces: <strong>{match.aces}</strong></span>
                  )}
                  {match.double_faults !== null && (
                    <span className="text-stone-600">DF: <strong>{match.double_faults}</strong></span>
                  )}
                  {match.winners !== null && (
                    <span className="text-stone-600">Winners: <strong>{match.winners}</strong></span>
                  )}
                  {match.unforced_errors !== null && (
                    <span className="text-stone-600">UE: <strong>{match.unforced_errors}</strong></span>
                  )}
                </div>
              )}

              {match.notes && (
                <p className="mt-2 text-sm text-stone-500 italic">{match.notes}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No matches logged yet</h3>
          <p className="text-stone-500 mb-4">Start logging your tournament matches to track your progress.</p>
          <button
            onClick={() => setShowMatchForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log First Match
          </button>
        </div>
      )}
    </div>
  )
}
