'use client'

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { UtrHistory } from '../types'
import { cn } from '@/lib/utils'

interface UtrChartProps {
  utrHistory: UtrHistory[]
  height?: number
  className?: string
}

export function UtrChart({ utrHistory, height = 200, className }: UtrChartProps) {
  const chartData = useMemo(() => {
    if (utrHistory.length === 0) return null

    // Sort by date (oldest first for chart display)
    const sorted = [...utrHistory].sort(
      (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
    )

    const values = sorted.map(h => h.utr_value)
    const minValue = Math.min(...values) - 0.5
    const maxValue = Math.max(...values) + 0.5
    const range = maxValue - minValue || 1

    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 100 // percentage-based

    // Calculate points
    const points = sorted.map((entry, index) => {
      const x = (index / Math.max(sorted.length - 1, 1)) * 100
      const y = ((maxValue - entry.utr_value) / range) * 100
      return { x, y, entry }
    })

    // Create SVG path
    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')

    // Area fill path
    const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} 100 L 0 100 Z`

    return {
      points,
      pathD,
      areaD,
      minValue,
      maxValue,
      sorted
    }
  }, [utrHistory])

  if (!chartData || utrHistory.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-stone-400', className)} style={{ height }}>
        No UTR data to display
      </div>
    )
  }

  const { points, pathD, areaD, minValue, maxValue, sorted } = chartData

  // Calculate trend
  const firstValue = sorted[0]?.utr_value || 0
  const lastValue = sorted[sorted.length - 1]?.utr_value || 0
  const trend = lastValue - firstValue

  return (
    <div className={cn('bg-white rounded-xl border border-stone-200', className)}>
      {/* Header */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-800">UTR History</h3>
            <p className="text-sm text-stone-500">
              {sorted.length} entries over{' '}
              {Math.ceil(
                (new Date(sorted[sorted.length - 1]?.recorded_date || Date.now()).getTime() -
                  new Date(sorted[0]?.recorded_date || Date.now()).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days
            </p>
          </div>
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : trend < 0 ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <Minus className="w-5 h-5 text-stone-400" />
            )}
            <span className={cn(
              'font-semibold',
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-stone-600'
            )}>
              {trend > 0 ? '+' : ''}{trend.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e7e5e4"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaD}
            fill="url(#utr-gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#dc2626"
              stroke="white"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="utr-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        <div className="flex justify-between text-xs text-stone-400 mt-2">
          <span>{maxValue.toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-stone-400 mt-2">
          <span>{new Date(sorted[0]?.recorded_date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
          <span>{new Date(sorted[sorted.length - 1]?.recorded_date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
        </div>
      </div>

      {/* Recent entries */}
      <div className="border-t border-stone-100 p-4">
        <h4 className="text-sm font-medium text-stone-700 mb-3">Recent Updates</h4>
        <div className="space-y-2">
          {sorted.slice(-5).reverse().map((entry) => (
            <div key={entry.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-600">{entry.utr_value.toFixed(2)}</span>
                {entry.source && (
                  <span className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded">
                    {entry.source}
                  </span>
                )}
              </div>
              <span className="text-stone-400">
                {new Date(entry.recorded_date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
