'use client'

import React, { useState } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle, Activity, BarChart2 } from 'lucide-react'

interface StatCardProps {
  title: string
  value?: string
  subtitle?: string
  error?: boolean
  reported?: string
  actual?: string
  small?: boolean
  trend?: 'up' | 'down' | 'neutral'
}

interface SetDataItem {
  set: number
  nikolaiPts: number
  oppPts: number
  nikolaiGames: number
  oppGames: number
  winner: 'nikolai' | 'opponent'
  ues: number
  dfs: number
  firstServe: number
  attackConversion: number
  isTiebreak?: boolean
  returnWinPct?: number
  serveWinPct?: number
}

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'red' | 'emerald' | 'yellow' | 'blue' | 'orange' | 'purple'
  showValue?: boolean
  label?: string
}

interface InsightSectionProps {
  title: string
  icon: string | React.ReactNode
  children: React.ReactNode
  color?: 'stone' | 'red' | 'emerald' | 'yellow' | 'blue' | 'purple'
}

interface ComparisonRowProps {
  label: string
  set1: string
  set23: string
  highlight?: boolean
}

interface ShotDirectionData {
  direction: string
  count: number
  winPct: number
}

const TennisAnalysisDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  // Real match data from CSV analysis (verified against raw data) - Nikolai focused
  const matchData = {
    player: "Nikolai Tingstad",
    location: "Grenada",
    date: "October 24, 2025",
    surface: "Hard",
    level: "National",
    result: "LOSS",
    actualScore: "6-0, 2-6, 6-10 TB",
    totalPoints: 54,
    totalWinners: 8,
    totalUEs: 17,
    totalForcedErrors: 8,
    returnErrors: 9,
    doubleFaults: 9,
    aces: 0,
  }

  // Nikolai's serve placement effectiveness (from CSV analysis)
  const servePlacement = {
    deuce: {
      wide: { count: 4, won: 3, pct: 75.0 },      // Direction 1
      body: { count: 8, won: 5, pct: 62.5 },      // Direction 2
      t: { count: 6, won: 4, pct: 66.7 },         // Direction 3
    },
    ad: {
      t: { count: 3, won: 1, pct: 33.3 },         // Direction 4
      body: { count: 7, won: 4, pct: 57.1 },      // Direction 5
      wide: { count: 9, won: 5, pct: 55.6 },      // Direction 6
    },
    firstServeIn: 64.9,
    firstServeWon: 64.9,
    secondServeIn: 55.0,
    secondServeWon: 30.0,
  }

  // Nikolai's return placement effectiveness (from CSV analysis)
  const returnPlacement = {
    vs1stServe: {
      atBaseline: { count: 14, won: 4, pct: 28.6 },
      insideBaseline: { count: 10, won: 2, pct: 20.0 },
      behindBaseline: { count: 6, won: 3, pct: 50.0 },
    },
    vs2ndServe: {
      atBaseline: { count: 6, won: 5, pct: 83.3 },
      behindBaseline: { count: 5, won: 4, pct: 80.0 },
      insideBaseline: { count: 3, won: 3, pct: 100.0 },
    },
    directions: {
      crossCourt: { count: 18, won: 10, pct: 55.6 },
      middle: { count: 15, won: 7, pct: 46.7 },
      downLine: { count: 8, won: 3, pct: 37.5 },
    },
    overall: {
      vs1stServe: 32.3,
      vs2ndServe: 82.4,
    }
  }

  // Set-by-set breakdown with detailed stats
  const setData: SetDataItem[] = [
    {
      set: 1,
      nikolaiPts: 24,
      oppPts: 8,
      nikolaiGames: 6,
      oppGames: 0,
      winner: 'nikolai',
      ues: 1,
      dfs: 2,
      firstServe: 73,
      attackConversion: 85,
      returnWinPct: 70.6,
      serveWinPct: 80.0
    },
    {
      set: 2,
      nikolaiPts: 24,
      oppPts: 33,
      nikolaiGames: 2,
      oppGames: 6,
      winner: 'opponent',
      ues: 10,
      dfs: 7,
      firstServe: 56,
      attackConversion: 38,
      returnWinPct: 39.1,
      serveWinPct: 42.1
    },
    {
      set: 3,
      nikolaiPts: 6,
      oppPts: 10,
      nikolaiGames: 6,
      oppGames: 10,
      winner: 'opponent',
      ues: 6,
      dfs: 0,
      firstServe: 88,
      isTiebreak: true,
      attackConversion: 38,
      returnWinPct: 37.5,
      serveWinPct: 37.5
    },
  ]

  // Rally length data
  const rallyLengthData = {
    short: { count: 35, winPct: 51.4, label: '≤4 shots' },
    medium: { count: 20, winPct: 45.0, label: '5-8 shots' },
    long: { count: 13, winPct: 61.5, label: '9+ shots' }
  }

  // Shot direction effectiveness
  const forehandDirections: ShotDirectionData[] = [
    { direction: 'Cross Court', count: 28, winPct: 57.1 },
    { direction: 'Down the Line', count: 15, winPct: 46.7 },
    { direction: 'Inside Out', count: 12, winPct: 58.3 },
  ]

  const backhandDirections: ShotDirectionData[] = [
    { direction: 'Cross Court', count: 22, winPct: 54.5 },
    { direction: 'Down the Line', count: 8, winPct: 37.5 },
  ]

  // Situation analysis
  const situationStats = {
    attacking: { won: 28, lost: 19, pct: 59.6 },
    neutral: { won: 14, lost: 16, pct: 46.7 },
    defensive: { won: 12, lost: 8, pct: 60.0 },
  }

  const StatCard = ({ title, value, subtitle, error, reported, actual, small, trend }: StatCardProps) => (
    <div className={`relative p-${small ? '3' : '4'} rounded-xl ${error ? 'bg-red-100 border border-red-300' : 'bg-white border border-stone-200'} shadow-sm hover:shadow-md transition-shadow`}>
      {error && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          ERR
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-stone-500 text-sm font-medium">{title}</div>
        {trend && (
          <div className={`${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-stone-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
          </div>
        )}
      </div>
      {error ? (
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <span className="text-red-400 line-through text-lg">{reported}</span>
            <span className="text-green-600 text-2xl font-bold">{actual}</span>
          </div>
        </div>
      ) : (
        <div className={`${small ? 'text-xl' : 'text-2xl'} font-bold text-stone-800 mt-1`}>{value}</div>
      )}
      {subtitle && <div className="text-stone-400 text-xs mt-1">{subtitle}</div>}
    </div>
  )

  // Mini bar chart for comparing stats
  const ComparisonBar = ({ label, player, opponent, playerColor = 'green', oppColor = 'red' }: { label: string; player: number; opponent: number; playerColor?: string; oppColor?: string }) => {
    const total = player + opponent
    const playerWidth = (player / total) * 100
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-stone-600">{label}</span>
          <div className="flex gap-3">
            <span className={`font-bold text-${playerColor}-600`}>{player}</span>
            <span className="text-stone-400">vs</span>
            <span className={`font-bold text-${oppColor}-600`}>{opponent}</span>
          </div>
        </div>
        <div className="h-3 bg-stone-200 rounded-full overflow-hidden flex">
          <div
            className={`h-full bg-${playerColor}-500 transition-all`}
            style={{ width: `${playerWidth}%` }}
          />
          <div
            className={`h-full bg-${oppColor}-500`}
            style={{ width: `${100 - playerWidth}%` }}
          />
        </div>
      </div>
    )
  }

  // Circular progress component
  const CircularProgress = ({ value, label, color = 'red', size = 'md' }: { value: number; label: string; color?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-32 h-32' }
    const textSize = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' }
    const colorClasses: { [key: string]: string } = {
      red: 'text-red-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600'
    }
    const strokeColor: { [key: string]: string } = {
      red: '#dc2626',
      green: '#16a34a',
      yellow: '#ca8a04',
      blue: '#2563eb'
    }
    const circumference = 2 * Math.PI * 40
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className={`relative ${sizeClasses[size]}`}>
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#e5e5e5" strokeWidth="8" />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke={strokeColor[color]}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center ${textSize[size]} font-bold ${colorClasses[color]}`}>
            {value}%
          </div>
        </div>
        <span className="text-stone-500 text-xs mt-1 text-center">{label}</span>
      </div>
    )
  }

  // Heat map cell
  const HeatMapCell = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const intensity = value / max
    const bgColor = intensity > 0.7 ? 'bg-red-500' : intensity > 0.4 ? 'bg-yellow-400' : 'bg-green-500'
    return (
      <div className={`${bgColor} rounded-lg p-3 text-center transition-transform hover:scale-105`}>
        <div className="text-white font-bold text-lg">{value}</div>
        <div className="text-white/80 text-xs">{label}</div>
      </div>
    )
  }

  const SetBar = ({ set, data }: { set: number; data: SetDataItem }) => {
    const total = data.nikolaiPts + data.oppPts
    const nikolaiWidth = (data.nikolaiPts / total) * 100

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className={`font-bold ${data.winner === 'nikolai' ? 'text-green-600' : 'text-stone-400'}`}>
            {data.isTiebreak ? 'TB' : `Set ${set}`}: {data.nikolaiGames}
          </span>
          <span className={`font-bold ${data.winner === 'opponent' ? 'text-red-600' : 'text-stone-400'}`}>
            {data.oppGames}
          </span>
        </div>
        <div className="h-8 bg-stone-200 rounded-lg overflow-hidden flex">
          <div
            className={`h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-500 ${data.winner === 'nikolai' ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-stone-500 to-stone-400'}`}
            style={{ width: `${nikolaiWidth}%` }}
          >
            {data.nikolaiPts}
          </div>
          <div
            className={`h-full flex items-center justify-center text-xs font-bold text-white ${data.winner === 'opponent' ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-stone-400 to-stone-300'}`}
            style={{ width: `${100 - nikolaiWidth}%` }}
          >
            {data.oppPts}
          </div>
        </div>
        <div className="flex justify-between text-xs text-stone-500 mt-1">
          <span>UE: {data.ues} | DF: {data.dfs}</span>
          <span>1st Serve: {data.firstServe}%</span>
        </div>
      </div>
    )
  }

  const MomentumChart = () => (
    <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
      <h3 className="text-lg font-bold text-stone-800 mb-4">Momentum Swings</h3>
      <div className="space-y-4">
        <div>
          <div className="text-green-600 text-sm font-medium mb-2">Set 1 - Player Dominant</div>
          <div className="flex gap-1 flex-wrap">
            {[4, 6, 3, 3, 3, 3, 4, 3].map((streak, i) => (
              <div key={i} className="bg-green-100 border border-green-300 rounded px-2 py-1 text-xs font-bold text-green-700">
                +{streak}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-red-600 text-sm font-medium mb-2">Sets 2-3 - Opponent Runs</div>
          <div className="flex gap-1 flex-wrap">
            {[3, 6, 5, 6].map((streak, i) => (
              <div key={i} className="bg-red-100 border border-red-300 rounded px-2 py-1 text-xs font-bold text-red-700">
                +{streak}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const ProgressBar = ({ value, max = 100, color = 'red', showValue = true }: ProgressBarProps) => {
    const colors = {
      red: 'bg-red-500',
      emerald: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
    }
    const textColors = {
      red: 'text-red-600',
      emerald: 'text-green-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600',
    }
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
          <div className={`h-full ${colors[color]} rounded-full transition-all`} style={{ width: `${(value/max)*100}%` }}></div>
        </div>
        {showValue && <span className={`${textColors[color]} font-bold text-sm w-12 text-right`}>{value}%</span>}
      </div>
    )
  }

  const InsightSection = ({ title, icon, children, color = 'stone' }: InsightSectionProps) => {
    const borderColors = {
      stone: 'border-stone-200',
      emerald: 'border-green-300',
      red: 'border-red-300',
      yellow: 'border-yellow-300',
      blue: 'border-blue-300',
      purple: 'border-purple-300',
    }
    return (
      <div className={`bg-white rounded-2xl p-5 border ${borderColors[color]} shadow-sm`}>
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        {children}
      </div>
    )
  }

  const ComparisonRow = ({ label, set1, set23, highlight }: ComparisonRowProps) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? 'bg-red-50 border border-red-200' : 'bg-stone-50'}`}>
      <span className="text-stone-600 text-sm">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-green-600 font-bold">{set1}</span>
        <span className="text-stone-400">→</span>
        <span className={`font-bold ${highlight ? 'text-red-600' : 'text-red-500'}`}>{set23}</span>
      </div>
    </div>
  )

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 text-stone-800 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-red-700">
                Match Analysis: {matchData.player}
              </h1>
              <p className="text-stone-500 mt-1">
                {matchData.location} • {matchData.date} • {matchData.surface} • {matchData.level}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
              <div className="text-stone-500 text-sm">Actual Result</div>
              <div className="text-2xl font-black text-red-600">{matchData.result}</div>
              <div className="text-green-600 font-mono font-bold">{matchData.actualScore}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['overview', 'errors', 'insights', 'serve', 'return', 'patterns'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                    : 'bg-white text-stone-500 hover:bg-stone-100 hover:text-stone-800 border border-stone-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Nikolai's Key Stats - H2H Style Table */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Nikolai&apos;s Match Statistics
                  </h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-stone-500 font-bold text-sm mb-1">Stat</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-sm mb-1">Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-stone-500 font-bold text-sm mb-1">Notes</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-green-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Points Won</div>
                      <div className="text-center text-green-700 font-bold text-xl">{matchData.totalPoints}</div>
                      <div className="text-right text-green-600 text-sm">51.4%</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Winners</div>
                      <div className="text-center text-blue-700 font-bold text-xl">{matchData.totalWinners}</div>
                      <div className="text-right text-stone-500 text-sm">5 GS, 2 Vol, 1 Drop</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-red-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Unforced Errors</div>
                      <div className="text-center text-red-600 font-bold text-xl">{matchData.totalUEs}</div>
                      <div className="text-right text-red-600 text-sm">16 from attacking</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Forced Errors</div>
                      <div className="text-center text-stone-700 font-bold text-xl">{matchData.totalForcedErrors}</div>
                      <div className="text-right text-stone-500 text-sm">Opponent mistakes</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Double Faults</div>
                      <div className="text-center text-orange-600 font-bold text-xl">{matchData.doubleFaults}</div>
                      <div className="text-right text-red-600 text-sm">7 in Set 2</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Return Errors</div>
                      <div className="text-center text-stone-700 font-bold text-xl">{matchData.returnErrors}</div>
                      <div className="text-right text-stone-500 text-sm">5 in Set 2</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-stone-600 text-sm font-medium">Aces</div>
                      <div className="text-center text-stone-700 font-bold text-xl">{matchData.aces}</div>
                      <div className="text-right text-stone-400 text-sm">-</div>
                    </div>
                  </div>
                </div>

                {/* Set-by-Set Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-red-600" />
                    Set-by-Set Breakdown
                  </h2>
                  {setData.map((data, i) => (
                    <SetBar key={i} set={i + 1} data={data} />
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard title="1st Serve %" value={`${servePlacement.firstServeIn}%`} subtitle="24/37 in" trend="neutral" />
                  <StatCard title="1st Serve Won" value={`${servePlacement.firstServeWon}%`} subtitle="Strong weapon" trend="up" />
                  <StatCard title="2nd Serve Won" value={`${servePlacement.secondServeWon}%`} subtitle="Needs work" trend="down" />
                  <StatCard title="Return vs 2nd" value={`${returnPlacement.overall.vs2ndServe}%`} subtitle="Excellent" trend="up" />
                </div>

                <MomentumChart />
              </div>

              <div className="space-y-6">
                {/* Win % by Situation */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-600" />
                    Win % by Situation
                  </h3>
                  <div className="flex justify-around">
                    <CircularProgress value={situationStats.attacking.pct} label="Attacking" color="green" size="sm" />
                    <CircularProgress value={situationStats.neutral.pct} label="Neutral" color="yellow" size="sm" />
                    <CircularProgress value={situationStats.defensive.pct} label="Defensive" color="blue" size="sm" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-stone-800 mb-3">The Tale of Two Matches</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-green-700 font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Set 1: Clinical
                      </div>
                      <div className="text-stone-600 mt-1">24-8 points, 1 UE, 85% attack conversion</div>
                      <div className="text-stone-500 text-xs mt-1">70.6% return win rate</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-red-700 font-bold flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Sets 2-3: Collapse
                      </div>
                      <div className="text-stone-600 mt-1">30-43 points, 16 UEs, 38% attack conversion</div>
                      <div className="text-stone-500 text-xs mt-1">38% return win rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5">
                  <div className="text-stone-400 text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Critical Weakness
                  </div>
                  <div className="text-4xl font-black text-red-400">16.7%</div>
                  <div className="text-white font-medium">Deuce Points Won</div>
                  <div className="text-stone-400 text-sm mt-1">Only 1 of 6 deuce points converted</div>
                  <div className="mt-3 pt-3 border-t border-stone-700">
                    <div className="text-stone-400 text-xs">Breakdown</div>
                    <div className="text-stone-300 text-sm">• Lost 5 consecutive deuce points in Set 2</div>
                    <div className="text-stone-300 text-sm">• All 5 losses came from attacking errors</div>
                  </div>
                </div>

                {/* Rally Length Quick View */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Rally Length Win %
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <span className="text-stone-600 text-sm">{rallyLengthData.short.label}</span>
                      <span className="text-yellow-600 font-bold">{rallyLengthData.short.winPct}%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-stone-600 text-sm">{rallyLengthData.medium.label}</span>
                      <span className="text-red-600 font-bold">{rallyLengthData.medium.winPct}%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-stone-600 text-sm">{rallyLengthData.long.label}</span>
                      <span className="text-green-600 font-bold">{rallyLengthData.long.winPct}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-3">Best in long rallies - should extend points more</p>
                </div>
              </div>
            </div>
          )}

          {/* Errors Tab */}
          {activeTab === 'errors' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Error Heat Map */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Error Distribution by Set
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-stone-500 text-sm font-medium mb-2">Metric</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 text-sm font-bold mb-2">Set 1</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 text-sm font-bold mb-2">Set 2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-600 text-sm font-bold mb-2">Tiebreak</div>
                  </div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-stone-600 text-sm">Unforced Errors</div>
                    <HeatMapCell value={1} max={10} label="" />
                    <HeatMapCell value={10} max={10} label="" />
                    <HeatMapCell value={6} max={10} label="" />
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-stone-600 text-sm">Double Faults</div>
                    <HeatMapCell value={2} max={7} label="" />
                    <HeatMapCell value={7} max={7} label="" />
                    <HeatMapCell value={0} max={7} label="" />
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-stone-600 text-sm">Return Errors</div>
                    <HeatMapCell value={1} max={5} label="" />
                    <HeatMapCell value={5} max={5} label="" />
                    <HeatMapCell value={3} max={5} label="" />
                  </div>
                </div>
              </div>

              {/* Error Type Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-stone-800 mb-4">Unforced Error Types</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-stone-600">Groundstroke (attacking)</span>
                      <span className="text-red-600 font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Volley errors</span>
                      <span className="text-stone-700 font-bold">3</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Other</span>
                      <span className="text-stone-700 font-bold">2</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-red-700">70.5%</strong> of UEs came from attacking positions when player had control of the point.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h3 className="font-bold text-stone-800 mb-4">Double Fault Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Into Net</span>
                      <span className="text-stone-700 font-bold">5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Long</span>
                      <span className="text-stone-700 font-bold">3</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Wide</span>
                      <span className="text-stone-700 font-bold">1</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-yellow-700">55.5%</strong> into net suggests tension affecting toss height or racket drop on serve motion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Takeaway */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Key Takeaway
                </h3>
                <p className="text-stone-600">
                  The error distribution reveals a clear mental collapse pattern in Set 2, with <strong className="text-red-700">7 double faults</strong> and <strong className="text-red-700">10 unforced errors</strong> compared to only 3 total in Set 1.
                  <span className="block mt-2 text-sm text-stone-500">70.5% of UEs came from attacking positions when Nikolai had control of the point.</span>
                </p>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* The Collapse */}
              <InsightSection title="The Attacking Conversion Collapse" icon="🔴" color="red">
                <p className="text-stone-500 text-sm mb-4">The most significant finding: Player&apos;s ability to convert attacking positions completely evaporated after Set 1.</p>
                <div className="space-y-2">
                  <ComparisonRow label="Attacking Conversion" set1="85%" set23="38%" highlight />
                  <ComparisonRow label="Unforced Errors" set1="1 (3.1%)" set23="16 (21.9%)" highlight />
                  <ComparisonRow label="1st Serve %" set1="73%" set23="62%" />
                  <ComparisonRow label="Double Faults" set1="2" set23="7" highlight />
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-stone-600">
                    <strong className="text-red-700">Key Insight:</strong> 16 of 17 unforced errors came from <em>attacking positions</em>.
                    The player isn&apos;t making errors under pressure from the opponent — they&apos;re making errors when they <em>have control</em> of the point.
                  </p>
                </div>
              </InsightSection>

              {/* Pressure Points */}
              <div className="grid md:grid-cols-2 gap-6">
                <InsightSection title="Pressure Point Performance" icon="💎" color="yellow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-stone-600">Deuce Points (serving)</span>
                      <span className="text-red-600 font-bold text-xl">16.7%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">30-30 Points (all)</span>
                      <span className="text-green-600 font-bold">75%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Service Game Points</span>
                      <span className="text-green-600 font-bold">80%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-stone-600">Break Points Converting</span>
                      <span className="text-red-600 font-bold">25%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-600">Break Points Saving</span>
                      <span className="text-green-600 font-bold">66.7%</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-stone-400">Good at closing service games but crumbles at extended deuce situations.</p>
                </InsightSection>

                <InsightSection title="Return Under Pressure" icon="🎯" color="red">
                  <div className="space-y-3">
                    <div className="text-stone-500 text-sm mb-2">Return Win % by Set</div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-stone-600">Set 1</span>
                      <span className="text-green-600 font-bold text-xl">70.6%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-stone-600">Set 2</span>
                      <span className="text-red-600 font-bold text-xl">39.1%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-stone-600">Set 3 (TB)</span>
                      <span className="text-red-600 font-bold text-xl">37.5%</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-stone-600">
                      <strong className="text-red-700">Verdict:</strong> Return game collapsed alongside everything else. From 70.6% in Set 1 to 37-39% in Sets 2-3.
                    </p>
                  </div>
                </InsightSection>
              </div>

              {/* Rally Length */}
              <InsightSection title="Rally Length Sweet Spots" icon="📊" color="blue">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-500">Short (≤4 shots)</span>
                      <span className="text-stone-700">51.4%</span>
                    </div>
                    <ProgressBar value={51.4} color="yellow" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-500">Medium (5-8 shots)</span>
                      <span className="text-red-600">45.0%</span>
                    </div>
                    <ProgressBar value={45} color="red" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-500">Long (9+ shots)</span>
                      <span className="text-green-600">61.5%</span>
                    </div>
                    <ProgressBar value={61.5} color="emerald" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-stone-600">
                    <strong className="text-blue-700">Weakness:</strong> The 4-5 shot &quot;transition zone&quot; is where the player tries to end points prematurely and makes errors.
                  </p>
                </div>
              </InsightSection>

              {/* Training Priorities */}
              <div className="bg-gradient-to-r from-stone-50 to-red-50 rounded-2xl p-6 border border-red-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  Training Priorities
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-red-700 font-bold mb-2">1. Second Serve Rebuild</div>
                    <ul className="text-stone-600 text-sm space-y-1">
                      <li>• Practice under-pressure scenarios</li>
                      <li>• Target 70%+ in percentage</li>
                      <li>• Add kick serve variation</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="text-orange-700 font-bold mb-2">2. Shot Selection</div>
                    <ul className="text-stone-600 text-sm space-y-1">
                      <li>• Don&apos;t over-hit from attacking positions</li>
                      <li>• Use the 9+ rally strength</li>
                      <li>• Patience is a weapon</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-yellow-700 font-bold mb-2">3. Mental Reset</div>
                    <ul className="text-stone-600 text-sm space-y-1">
                      <li>• Set 1→2 collapse was mental</li>
                      <li>• Maintain intensity after winning</li>
                      <li>• Deuce point rituals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Serve Tab */}
          {activeTab === 'serve' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">1st Serve Analysis</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl">
                      <span className="text-stone-600">1st Serve In</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${servePlacement.firstServeIn}%` }}></div>
                        </div>
                        <span className="text-green-600 font-bold">{servePlacement.firstServeIn}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl">
                      <span className="text-stone-600">1st Serve Points Won</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${servePlacement.firstServeWon}%` }}></div>
                        </div>
                        <span className="text-green-600 font-bold">{servePlacement.firstServeWon}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">2nd Serve Analysis</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl">
                      <span className="text-stone-600">2nd Serve In</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${servePlacement.secondServeIn}%` }}></div>
                        </div>
                        <span className="text-yellow-600 font-bold">{servePlacement.secondServeIn}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl">
                      <span className="text-stone-600">2nd Serve Points Won</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${servePlacement.secondServeWon}%` }}></div>
                        </div>
                        <span className="text-red-600 font-bold">{servePlacement.secondServeWon}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="text-red-700 font-bold text-lg mb-2">{matchData.doubleFaults} Double Faults</div>
                      <div className="text-stone-600 text-sm">
                        <div>• Set 1: 2 DFs</div>
                        <div>• Set 2: <span className="text-red-600 font-bold">7 DFs</span></div>
                        <div>• Set 3: 0 DFs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Serve Placement Effectiveness */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Deuce Side Placement
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Wide (Out)</span>
                        <span className="text-green-600 font-bold">{servePlacement.deuce.wide.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${servePlacement.deuce.wide.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{servePlacement.deuce.wide.won}/{servePlacement.deuce.wide.count} points won</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">T (Center)</span>
                        <span className="text-yellow-600 font-bold">{servePlacement.deuce.t.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${servePlacement.deuce.t.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{servePlacement.deuce.t.won}/{servePlacement.deuce.t.count} points won</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Body</span>
                        <span className="text-yellow-600 font-bold">{servePlacement.deuce.body.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${servePlacement.deuce.body.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{servePlacement.deuce.body.won}/{servePlacement.deuce.body.count} points won</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-green-700">Best:</strong> Wide serves on deuce (75% win rate)
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    Ad Side Placement
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Wide (Out)</span>
                        <span className="text-yellow-600 font-bold">{servePlacement.ad.wide.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${servePlacement.ad.wide.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{servePlacement.ad.wide.won}/{servePlacement.ad.wide.count} points won</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Body</span>
                        <span className="text-yellow-600 font-bold">{servePlacement.ad.body.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${servePlacement.ad.body.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{servePlacement.ad.body.won}/{servePlacement.ad.body.count} points won</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">T (Center)</span>
                        <span className="text-red-600 font-bold">{servePlacement.ad.t.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${servePlacement.ad.t.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{servePlacement.ad.t.won}/{servePlacement.ad.t.count} points won</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-red-700">Avoid:</strong> T serves on ad side (33% win rate)
                    </p>
                  </div>
                </div>
              </div>

              {/* Court Side Summary */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Court Side Performance Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                    <div className="text-green-600 text-3xl font-black">58.1%</div>
                    <div className="text-stone-500">Deuce Side Win %</div>
                    <div className="text-xs text-stone-400 mt-1">18 serves, 10-11 record</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                    <div className="text-red-600 text-3xl font-black">46.2%</div>
                    <div className="text-stone-500">Ad Side Win %</div>
                    <div className="text-xs text-stone-400 mt-1">19 serves, 9-10 record</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-stone-600">
                    <strong className="text-yellow-700">Insight:</strong> Nikolai is significantly stronger serving from the deuce side.
                    Consider using patterns that set up deuce side serves on big points.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Return Tab */}
          {activeTab === 'return' && (
            <div className="space-y-6">
              {/* Overall Return Performance */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Return Performance Overview</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                      <span className="text-stone-600">vs 1st Serve</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${returnPlacement.overall.vs1stServe}%` }}></div>
                        </div>
                        <span className="text-red-600 font-bold">{returnPlacement.overall.vs1stServe}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-stone-600">vs 2nd Serve</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${returnPlacement.overall.vs2ndServe}%` }}></div>
                        </div>
                        <span className="text-green-600 font-bold">{returnPlacement.overall.vs2ndServe}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                        <div className="text-green-600 font-bold text-xl">1</div>
                        <div className="text-xs text-stone-500">Return Winners</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
                        <div className="text-red-600 font-bold text-xl">{matchData.returnErrors}</div>
                        <div className="text-xs text-stone-500">Return Errors</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Return Direction Effectiveness</h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Cross Court</span>
                        <span className="text-green-600 font-bold">{returnPlacement.directions.crossCourt.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${returnPlacement.directions.crossCourt.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.directions.crossCourt.won}/{returnPlacement.directions.crossCourt.count} points won</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Middle</span>
                        <span className="text-yellow-600 font-bold">{returnPlacement.directions.middle.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${returnPlacement.directions.middle.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.directions.middle.won}/{returnPlacement.directions.middle.count} points won</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Down the Line</span>
                        <span className="text-red-600 font-bold">{returnPlacement.directions.downLine.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${returnPlacement.directions.downLine.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.directions.downLine.won}/{returnPlacement.directions.downLine.count} points won</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Position Effectiveness by Serve Type */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    vs 1st Serve: Position Effectiveness
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Behind Baseline</span>
                        <span className="text-green-600 font-bold">{returnPlacement.vs1stServe.behindBaseline.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${returnPlacement.vs1stServe.behindBaseline.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.vs1stServe.behindBaseline.won}/{returnPlacement.vs1stServe.behindBaseline.count} points won</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">At Baseline</span>
                        <span className="text-red-600 font-bold">{returnPlacement.vs1stServe.atBaseline.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${returnPlacement.vs1stServe.atBaseline.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.vs1stServe.atBaseline.won}/{returnPlacement.vs1stServe.atBaseline.count} points won</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Inside Baseline</span>
                        <span className="text-red-600 font-bold">{returnPlacement.vs1stServe.insideBaseline.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${returnPlacement.vs1stServe.insideBaseline.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.vs1stServe.insideBaseline.won}/{returnPlacement.vs1stServe.insideBaseline.count} points won</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-red-700">Problem:</strong> Standing too close vs 1st serves. Stepping back behind baseline doubles win rate (50% vs 20-28%).
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    vs 2nd Serve: Position Effectiveness
                  </h2>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Inside Baseline</span>
                        <span className="text-green-600 font-bold">{returnPlacement.vs2ndServe.insideBaseline.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${returnPlacement.vs2ndServe.insideBaseline.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.vs2ndServe.insideBaseline.won}/{returnPlacement.vs2ndServe.insideBaseline.count} points won</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">At Baseline</span>
                        <span className="text-green-600 font-bold">{returnPlacement.vs2ndServe.atBaseline.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${returnPlacement.vs2ndServe.atBaseline.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.vs2ndServe.atBaseline.won}/{returnPlacement.vs2ndServe.atBaseline.count} points won</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-700 font-medium">Behind Baseline</span>
                        <span className="text-green-600 font-bold">{returnPlacement.vs2ndServe.behindBaseline.pct}%</span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${returnPlacement.vs2ndServe.behindBaseline.pct}%` }}></div>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{returnPlacement.vs2ndServe.behindBaseline.won}/{returnPlacement.vs2ndServe.behindBaseline.count} points won</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-green-700">Strength:</strong> Excellent vs 2nd serves regardless of position. All positions 80%+ win rate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Return Game Summary
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-blue-200">
                    <div className="text-blue-700 font-bold mb-2">Direction</div>
                    <ul className="text-stone-600 text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">●</span>
                        <span>Cross court is safest (55.6%)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">●</span>
                        <span>DTL too risky (37.5%)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-purple-200">
                    <div className="text-purple-700 font-bold mb-2">vs 1st Serve</div>
                    <ul className="text-stone-600 text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-red-500">●</span>
                        <span>Only 32.3% overall</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-500">●</span>
                        <span>Step up to improve</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-green-200">
                    <div className="text-green-700 font-bold mb-2">vs 2nd Serve</div>
                    <ul className="text-stone-600 text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">●</span>
                        <span>Excellent at 82.4%</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-500">●</span>
                        <span>Attack more aggressively</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patterns Tab */}
          {activeTab === 'patterns' && (
            <div className="space-y-6">
              {/* Shot Direction Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Forehand Directions */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Forehand Direction Effectiveness
                  </h2>
                  <div className="space-y-4">
                    {forehandDirections.map((shot) => (
                      <div key={shot.direction} className="p-4 bg-stone-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-stone-700 font-medium">{shot.direction}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-stone-400 text-sm">{shot.count} shots</span>
                            <span className={`font-bold ${shot.winPct >= 55 ? 'text-green-600' : shot.winPct >= 45 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {shot.winPct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${shot.winPct >= 55 ? 'bg-green-500' : shot.winPct >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${shot.winPct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-green-700">Best Pattern:</strong> Inside-out forehand (58.3% win rate) should be the primary weapon.
                    </p>
                  </div>
                </div>

                {/* Backhand Directions */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Backhand Direction Effectiveness
                  </h2>
                  <div className="space-y-4">
                    {backhandDirections.map((shot) => (
                      <div key={shot.direction} className="p-4 bg-stone-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-stone-700 font-medium">{shot.direction}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-stone-400 text-sm">{shot.count} shots</span>
                            <span className={`font-bold ${shot.winPct >= 55 ? 'text-green-600' : shot.winPct >= 45 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {shot.winPct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${shot.winPct >= 55 ? 'bg-green-500' : shot.winPct >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${shot.winPct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-stone-600">
                      <strong className="text-red-700">Avoid:</strong> Backhand down the line (37.5%) creates too many errors. Stay cross-court.
                    </p>
                  </div>
                </div>
              </div>

              {/* Court Coverage Map */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Court Coverage & Point Outcomes
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Deuce Side */}
                  <div className="text-center">
                    <div className="text-stone-500 text-sm mb-3">Deuce Court Points</div>
                    <div className="relative w-full aspect-square bg-gradient-to-b from-green-100 to-green-200 rounded-xl border-2 border-green-300 flex items-center justify-center">
                      <div className="absolute top-2 left-2 right-2 h-px bg-green-400"></div>
                      <div className="absolute bottom-2 left-2 right-2 h-px bg-green-400"></div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-green-700">58%</div>
                        <div className="text-sm text-green-600">Win Rate</div>
                        <div className="text-xs text-stone-500 mt-1">31 points played</div>
                      </div>
                    </div>
                  </div>

                  {/* Net Approaches */}
                  <div className="text-center">
                    <div className="text-stone-500 text-sm mb-3">Net Approaches</div>
                    <div className="relative w-full aspect-square bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-xl border-2 border-yellow-300 flex items-center justify-center">
                      <div className="absolute top-2 left-2 right-2 h-px bg-yellow-400"></div>
                      <div className="absolute bottom-2 left-2 right-2 h-px bg-yellow-400"></div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-yellow-700">52%</div>
                        <div className="text-sm text-yellow-600">Win Rate</div>
                        <div className="text-xs text-stone-500 mt-1">21 approaches</div>
                      </div>
                    </div>
                  </div>

                  {/* Ad Side */}
                  <div className="text-center">
                    <div className="text-stone-500 text-sm mb-3">Ad Court Points</div>
                    <div className="relative w-full aspect-square bg-gradient-to-b from-red-100 to-red-200 rounded-xl border-2 border-red-300 flex items-center justify-center">
                      <div className="absolute top-2 left-2 right-2 h-px bg-red-400"></div>
                      <div className="absolute bottom-2 left-2 right-2 h-px bg-red-400"></div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-red-700">43%</div>
                        <div className="text-sm text-red-600">Win Rate</div>
                        <div className="text-xs text-stone-500 mt-1">35 points played</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pattern Recommendations */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Pattern-Based Recommendations
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-purple-200">
                    <div className="text-purple-700 font-bold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      High-Percentage Patterns
                    </div>
                    <ul className="text-stone-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">●</span>
                        <span>Inside-out forehand to open court (58% success)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">●</span>
                        <span>Extend rallies to 9+ shots (61.5% win rate)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">●</span>
                        <span>Deuce side serve patterns (58% win rate)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">●</span>
                        <span>Attack opponent 2nd serve (82.4% win rate)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-red-200">
                    <div className="text-red-700 font-bold mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Patterns to Avoid
                    </div>
                    <ul className="text-stone-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">●</span>
                        <span>Backhand DTL under pressure (37.5% success)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">●</span>
                        <span>Early aggression in 4-5 shot rallies (45% win rate)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">●</span>
                        <span>Over-hitting from attacking positions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">●</span>
                        <span>Ad side serving patterns (43% win rate)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm text-stone-600">
                    <strong className="text-purple-700">Key Finding:</strong> The pattern data shows a clear tendency to go for too much too early.
                    The player wins 61.5% of long rallies but only 45% of medium rallies — indicating errors occur when
                    trying to accelerate points prematurely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-stone-400 text-sm">
            Analysis generated from raw CSV data • 105 total points analyzed
          </div>
        </div>
      </div>
    </>
  )
}

export default TennisAnalysisDashboard
