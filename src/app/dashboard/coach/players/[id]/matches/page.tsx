import { getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Trophy, ChevronLeft, Target, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CoachPlayerMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUserProfile()
  const supabase = await createClient()

  // Get player info
  const { data: player } = await supabase
    .from('players')
    .select('id, name')
    .eq('id', id)
    .single() as { data: { id: string; name: string } | null }

  // Get all match results
  const { data: matches } = await supabase
    .from('match_results')
    .select(`
      *,
      tournament:tournaments(name, start_date, end_date)
    `)
    .eq('player_id', id)
    .order('match_date', { ascending: false }) as { data: any[] | null }

  // Calculate overall stats
  const wins = matches?.filter(m => m.result === 'win').length || 0
  const losses = matches?.filter(m => m.result === 'loss').length || 0
  const totalMatches = wins + losses
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0'

  // Aggregate tennis stats
  const totalHolds = matches?.reduce((acc, m) => acc + (m.holds || 0), 0) || 0
  const totalBreaks = matches?.reduce((acc, m) => acc + (m.breaks || 0), 0) || 0
  const totalAces = matches?.reduce((acc, m) => acc + (m.aces || 0), 0) || 0
  const totalDoubleFaults = matches?.reduce((acc, m) => acc + (m.double_faults || 0), 0) || 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!player) {
    return (
      <div className="p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-stone-300" />
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Player not found</h2>
        <Link href="/dashboard/coach/players" className="text-red-600 hover:text-red-700">
          Back to players
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href={`/dashboard/coach/players/${id}`}
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {player.name}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Match History</h1>
          <p className="text-stone-500">{player.name}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Record</p>
          <p className="text-2xl font-bold text-stone-800">{wins}W - {losses}L</p>
          <p className="text-xs text-stone-400">{winRate}% win rate</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Service Games</p>
          <p className="text-2xl font-bold text-stone-800">{totalHolds} / {totalBreaks}</p>
          <p className="text-xs text-stone-400">Holds / Breaks</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Aces</p>
          <p className="text-2xl font-bold text-green-600">{totalAces}</p>
          <p className="text-xs text-stone-400">total</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-500 mb-1">Double Faults</p>
          <p className="text-2xl font-bold text-red-600">{totalDoubleFaults}</p>
          <p className="text-xs text-stone-400">total</p>
        </div>
      </div>

      {/* Match List */}
      {matches && matches.length > 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {matches.map((match: any) => (
              <div
                key={match.id}
                className={`p-4 ${
                  match.result === 'win' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                        match.result === 'win' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {match.result === 'win' ? 'W' : 'L'}
                      </span>
                      <span className="font-medium text-stone-800">vs {match.opponent_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <span>{match.tournament?.name || 'Match'}</span>
                      <span>{match.round}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(match.match_date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-stone-800">{match.score}</p>
                    {(match.holds !== null || match.breaks !== null) && (
                      <p className="text-xs text-stone-500">
                        {match.holds}H / {match.breaks}B
                      </p>
                    )}
                  </div>
                </div>

                {/* Detailed Stats */}
                {(match.aces || match.double_faults || match.winners || match.unforced_errors) && (
                  <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-4 gap-4 text-center text-xs">
                    {match.aces !== null && (
                      <div>
                        <p className="font-medium text-stone-800">{match.aces}</p>
                        <p className="text-stone-400">Aces</p>
                      </div>
                    )}
                    {match.double_faults !== null && (
                      <div>
                        <p className="font-medium text-stone-800">{match.double_faults}</p>
                        <p className="text-stone-400">DFs</p>
                      </div>
                    )}
                    {match.winners !== null && (
                      <div>
                        <p className="font-medium text-stone-800">{match.winners}</p>
                        <p className="text-stone-400">Winners</p>
                      </div>
                    )}
                    {match.unforced_errors !== null && (
                      <div>
                        <p className="font-medium text-stone-800">{match.unforced_errors}</p>
                        <p className="text-stone-400">UEs</p>
                      </div>
                    )}
                  </div>
                )}

                {match.notes && (
                  <p className="mt-2 text-sm text-stone-500 italic">{match.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h3 className="text-lg font-medium text-stone-800 mb-2">No match results</h3>
          <p className="text-stone-500">Match results will appear here once logged.</p>
        </div>
      )}
    </div>
  )
}
