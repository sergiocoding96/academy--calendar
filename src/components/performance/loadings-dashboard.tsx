'use client'

import { useState, useMemo } from 'react'
import { Activity, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  loadZoneThresholds,
  getLoadZone,
  getLoadZoneColor,
  getPlayerLoadData,
} from '@/lib/demo-data/loadings'

const players = [
  { id: 'jac-leonard', name: 'Jac Leonard' },
  { id: 'luke-servaes', name: 'Luke Servaes' },
  { id: 'maddie-turnbull', name: 'Maddie Turnbull' },
  { id: 'nikolai-tingstad', name: 'Nikolai Tingstad' },
  { id: 'oscar-riley', name: 'Oscar Riley' },
]

const dateRanges = [
  { id: 'week', label: 'Last 7 Days' },
  { id: 'two-weeks', label: 'Last 14 Days' },
  { id: 'month', label: 'Last 30 Days' },
  { id: 'all', label: 'All Data' },
]

export function LoadingsDashboard() {
  const [selectedPlayerId, setSelectedPlayerId] = useState('nikolai-tingstad')
  const [dateRange, setDateRange] = useState('all')

  const playerData = useMemo(() => {
    const data = getPlayerLoadData(selectedPlayerId)

    // Filter by date range
    if (dateRange === 'all') return data

    const now = new Date('2025-10-18') // Use a fixed date for demo
    const days = dateRange === 'week' ? 7 : dateRange === 'two-weeks' ? 14 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return data.filter(d => new Date(d.date) >= cutoff)
  }, [selectedPlayerId, dateRange])

  const summary = useMemo(() => {
    const totalSRPE = playerData.reduce((sum, entry) => sum + entry.dailySRPE, 0)
    const totalServes = playerData.reduce((sum, entry) => sum + entry.numberOfServes, 0)
    const avgSRPE = playerData.length > 0 ? totalSRPE / playerData.length : 0
    const avgServes = playerData.length > 0 ? totalServes / playerData.length : 0

    return {
      totalSRPE,
      totalServes,
      averageSRPE: Math.round(avgSRPE),
      averageServes: avgServes,
    }
  }, [playerData])

  const selectedPlayer = players.find(p => p.id === selectedPlayerId)

  // Calculate max values for chart scaling
  const maxSRPE = Math.max(...playerData.map(d => d.dailySRPE), 2500)
  const maxServes = Math.max(...playerData.map(d => d.numberOfServes), 200)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-stone-600">Player:</label>
          <div className="relative">
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-stone-600">Period:</label>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white border border-stone-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              {dateRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Average Daily SRPE"
          value={summary.averageSRPE}
          icon={Activity}
          zone={getLoadZone(summary.averageSRPE)}
        />
        <SummaryCard
          label="Total SRPE"
          value={summary.totalSRPE}
          icon={TrendingUp}
          zone={summary.totalSRPE > 10000 ? 'high' : 'optimal'}
        />
        <SummaryCard
          label="Avg Daily Serves"
          value={Math.round(summary.averageServes)}
          icon={Activity}
          zone={summary.averageServes > 100 ? 'high' : 'optimal'}
        />
        <SummaryCard
          label="Total Serves"
          value={summary.totalServes}
          icon={TrendingUp}
          zone="optimal"
        />
      </div>

      {/* Load Zone Legend */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-medium text-stone-600 mb-3">Load Zone Reference</h3>
        <div className="flex flex-wrap gap-3">
          <ZoneBadge zone="low" label={`Low (0-${loadZoneThresholds.low.max})`} />
          <ZoneBadge zone="optimal" label={`Optimal (${loadZoneThresholds.optimal.min}-${loadZoneThresholds.optimal.max})`} />
          <ZoneBadge zone="high" label={`High (${loadZoneThresholds.high.min}-${loadZoneThresholds.high.max})`} />
          <ZoneBadge zone="veryHigh" label={`Very High (${loadZoneThresholds.veryHigh.min}+)`} />
        </div>
      </div>

      {/* SRPE Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-500" />
          Daily SRPE Load
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Y-axis labels */}
            <div className="flex gap-2">
              <div className="w-12 flex flex-col justify-between text-right text-xs text-stone-400 pr-2" style={{ height: '200px' }}>
                <span>{maxSRPE}</span>
                <span>{Math.round(maxSRPE * 0.75)}</span>
                <span>{Math.round(maxSRPE * 0.5)}</span>
                <span>{Math.round(maxSRPE * 0.25)}</span>
                <span>0</span>
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end gap-1" style={{ height: '200px' }}>
                {playerData.map((entry, idx) => {
                  const height = (entry.dailySRPE / maxSRPE) * 100
                  const zone = getLoadZone(entry.dailySRPE)
                  const colorClass = getLoadZoneColor(zone)

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className={cn("w-full rounded-t transition-all", colorClass.split(' ')[0])}
                        style={{ height: `${height}%`, minHeight: entry.dailySRPE > 0 ? '4px' : '0' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-stone-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          <div className="font-semibold">{entry.dailySRPE} SRPE</div>
                          <div className="text-stone-300">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex gap-2 mt-2">
              <div className="w-12" />
              <div className="flex-1 flex gap-1">
                {playerData.map((entry, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <span className="text-xs text-stone-400 transform -rotate-45 inline-block origin-center">
                      {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).replace(' ', '\n')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Serve Count Chart */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Daily Serve Count
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Y-axis labels */}
            <div className="flex gap-2">
              <div className="w-12 flex flex-col justify-between text-right text-xs text-stone-400 pr-2" style={{ height: '150px' }}>
                <span>{maxServes}</span>
                <span>{Math.round(maxServes * 0.5)}</span>
                <span>0</span>
              </div>
              {/* Bars */}
              <div className="flex-1 flex items-end gap-1" style={{ height: '150px' }}>
                {playerData.map((entry, idx) => {
                  const height = (entry.numberOfServes / maxServes) * 100

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${height}%`, minHeight: entry.numberOfServes > 0 ? '4px' : '0' }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                        <div className="bg-stone-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          <div className="font-semibold">{entry.numberOfServes} serves</div>
                          <div className="text-stone-300">{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-stone-500" />
          Daily Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3 font-medium text-stone-600">Date</th>
                <th className="text-right py-2 px-3 font-medium text-stone-600">Daily SRPE</th>
                <th className="text-right py-2 px-3 font-medium text-stone-600">Serves</th>
                <th className="text-center py-2 px-3 font-medium text-stone-600">Load Zone</th>
              </tr>
            </thead>
            <tbody>
              {[...playerData].reverse().map((entry, idx) => {
                const zone = getLoadZone(entry.dailySRPE)
                const colorClass = getLoadZoneColor(zone)

                return (
                  <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-2 px-3 text-stone-800">
                      {new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-stone-800">{entry.dailySRPE}</td>
                    <td className="py-2 px-3 text-right text-stone-600">{entry.numberOfServes}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", colorClass)}>
                        {zone === 'veryHigh' ? 'Very High' : zone === 'low' ? 'Low' : zone === 'optimal' ? 'Optimal' : 'High'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  zone,
}: {
  label: string
  value: number
  icon: React.ElementType
  zone: 'low' | 'optimal' | 'high' | 'veryHigh'
}) {
  const zoneStyles = {
    low: 'bg-blue-50 border-blue-200 text-blue-800',
    optimal: 'bg-green-50 border-green-200 text-green-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800',
    veryHigh: 'bg-red-50 border-red-200 text-red-800',
  }

  const iconStyles = {
    low: 'bg-blue-100 text-blue-600',
    optimal: 'bg-green-100 text-green-600',
    high: 'bg-orange-100 text-orange-600',
    veryHigh: 'bg-red-100 text-red-600',
  }

  return (
    <div className={cn("rounded-xl border p-4", zoneStyles[zone])}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", iconStyles[zone])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}

function ZoneBadge({ zone, label }: { zone: 'low' | 'optimal' | 'high' | 'veryHigh'; label: string }) {
  const colorClass = getLoadZoneColor(zone)

  return (
    <div className={cn("px-3 py-1.5 rounded-full text-xs font-medium", colorClass)}>
      {label}
    </div>
  )
}
