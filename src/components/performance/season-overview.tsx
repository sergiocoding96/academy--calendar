'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Calendar, Target, Award, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  demoSeasonData,
  calculateSeasonTotals,
  type SeasonOverview as SeasonOverviewType,
} from '@/lib/demo-data/season-stats'

export function SeasonOverview() {
  const [selectedPlayerId, setSelectedPlayerId] = useState(demoSeasonData[0].playerId)
  const playerData = demoSeasonData.find(p => p.playerId === selectedPlayerId) || demoSeasonData[0]
  const totals = calculateSeasonTotals(playerData)

  return (
    <div className="space-y-6">
      {/* Player Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-stone-600">Select Player:</label>
        <div className="relative">
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          >
            {demoSeasonData.map((player) => (
              <option key={player.playerId} value={player.playerId}>
                {player.playerName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* UTR Progress Card */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">{playerData.playerName}</h2>
            <p className="text-red-100 text-sm">2025 Season Progress</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{playerData.currentUTR}</div>
            <div className="text-sm text-red-100">Current UTR</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-6">
          <div className="flex items-center gap-2">
            {playerData.utrChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-300" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-300" />
            )}
            <span className="text-lg font-semibold">
              {playerData.utrChange >= 0 ? '+' : ''}{playerData.utrChange.toFixed(2)}
            </span>
            <span className="text-red-200 text-sm">from {playerData.seasonStartUTR}</span>
          </div>
          <div className="h-6 w-px bg-red-400" />
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold">{totals.totalPoints} pts</span>
            <span className="text-red-200 text-sm">this season</span>
          </div>
        </div>
      </div>

      {/* Season Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Matches"
          value={totals.totalMatches}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Wins"
          value={totals.totalWins}
          icon={Trophy}
          color="green"
        />
        <StatCard
          label="Losses"
          value={totals.totalLosses}
          icon={Target}
          color="red"
        />
        <StatCard
          label="Win Rate"
          value={`${totals.overallWinPercentage}%`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Term Stats */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Term Performance</h3>
        <div className="space-y-4">
          {playerData.termStats.map((term) => (
            <div key={term.term} className="border border-stone-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-stone-800">{term.term}</h4>
                  <p className="text-xs text-stone-500">
                    {new Date(term.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(term.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-stone-800">{term.winPercentage}%</div>
                  <p className="text-xs text-stone-500">Win Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-stone-800">{term.matchesPlayed}</div>
                  <div className="text-xs text-stone-500">Matches</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{term.wins}</div>
                  <div className="text-xs text-stone-500">Wins</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">{term.losses}</div>
                  <div className="text-xs text-stone-500">Losses</div>
                </div>
              </div>
              {/* Win rate bar */}
              <div className="mt-3">
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${term.winPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Surface Stats */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Performance by Surface</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playerData.surfaceStats.map((surface) => (
            <div key={surface.surface} className="text-center p-4 bg-stone-50 rounded-xl">
              <div className={cn(
                "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                surface.surface === 'hard' && "bg-blue-100",
                surface.surface === 'clay' && "bg-orange-100",
                surface.surface === 'grass' && "bg-green-100",
                surface.surface === 'indoor' && "bg-purple-100",
              )}>
                <span className={cn(
                  "text-xs font-bold uppercase",
                  surface.surface === 'hard' && "text-blue-600",
                  surface.surface === 'clay' && "text-orange-600",
                  surface.surface === 'grass' && "text-green-600",
                  surface.surface === 'indoor' && "text-purple-600",
                )}>
                  {surface.surface.charAt(0)}
                </span>
              </div>
              <div className="text-sm font-medium text-stone-600 capitalize mb-1">{surface.surface}</div>
              {surface.matchesPlayed > 0 ? (
                <>
                  <div className="text-2xl font-bold text-stone-800">{surface.winPercentage}%</div>
                  <div className="text-xs text-stone-500">{surface.wins}W - {surface.losses}L</div>
                </>
              ) : (
                <div className="text-sm text-stone-400">No matches</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tournaments */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Tournament Results</h3>
        <div className="space-y-3">
          {playerData.tournaments.map((tournament, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                  tournament.result === 'W' && "bg-yellow-100 text-yellow-700",
                  tournament.result === 'F' && "bg-gray-100 text-gray-700",
                  tournament.result === 'SF' && "bg-orange-100 text-orange-700",
                  tournament.result === 'QF' && "bg-blue-100 text-blue-700",
                  tournament.result === 'R16' && "bg-stone-200 text-stone-600",
                  tournament.result === 'R32' && "bg-stone-100 text-stone-500",
                )}>
                  {tournament.result}
                </div>
                <div>
                  <div className="font-medium text-stone-800">{tournament.name}</div>
                  <div className="text-xs text-stone-500">
                    {new Date(tournament.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {tournament.surface}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-stone-800">+{tournament.points} pts</div>
                <div className="text-xs text-stone-500">{tournament.roundReached}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Monthly Breakdown</h3>
        <div className="space-y-3">
          {playerData.monthlyPerformance.map((month) => (
            <div key={month.month} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-stone-600">{month.month}</div>
              <div className="flex-1">
                <div className="h-6 bg-stone-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${month.matchesPlayed > 0 ? (month.wins / month.matchesPlayed) * 100 : 0}%` }}
                  />
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${month.matchesPlayed > 0 ? (month.losses / month.matchesPlayed) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="text-right w-24">
                <span className="text-sm font-semibold text-stone-800">{month.wins}W-{month.losses}L</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opponent Level Stats */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4">Performance vs Opponent Level</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {playerData.opponentLevelStats.map((stat) => (
            <div key={stat.level} className={cn(
              "p-4 rounded-xl border",
              stat.level === 'higher_ranked' && "bg-red-50 border-red-100",
              stat.level === 'similar_ranked' && "bg-blue-50 border-blue-100",
              stat.level === 'lower_ranked' && "bg-green-50 border-green-100",
            )}>
              <div className="text-sm font-medium text-stone-600 mb-2">{stat.label}</div>
              <div className="text-3xl font-bold text-stone-800">{stat.winPercentage}%</div>
              <div className="text-sm text-stone-500">{stat.wins}W - {stat.losses}L ({stat.matchesPlayed} matches)</div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Season Highlights
          </h3>
          <ul className="space-y-2">
            {playerData.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                <span className="text-green-500 mt-1">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {playerData.areasToImprove.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-orange-700">
                <span className="text-orange-500 mt-1">•</span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'red' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }

  const iconClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
  }

  return (
    <div className={cn("rounded-xl border p-4", colorClasses[color])}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", iconClasses[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}
