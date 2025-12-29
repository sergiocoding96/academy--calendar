'use client'

import { Activity, Calendar, AlertTriangle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrainingLoad, Injury, Whereabouts } from '../types'

interface PlayerStatsProps {
  trainingLoads?: TrainingLoad[]
  injuries?: Injury[]
  whereabouts?: Whereabouts[]
  className?: string
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext?: string
  color?: 'default' | 'success' | 'warning' | 'danger'
}

const colorClasses = {
  default: 'bg-stone-50 text-stone-600',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-yellow-50 text-yellow-600',
  danger: 'bg-red-50 text-red-600',
}

const iconColorClasses = {
  default: 'text-stone-400',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  danger: 'text-red-500',
}

function StatCard({ icon, label, value, subtext, color = 'default' }: StatCardProps) {
  return (
    <div className={cn('rounded-xl p-4', colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtext && (
            <p className="text-xs opacity-70 mt-1">{subtext}</p>
          )}
        </div>
        <div className={cn('p-2 rounded-lg bg-white/50', iconColorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function calculateStats(
  trainingLoads: TrainingLoad[] = [],
  injuries: Injury[] = [],
  whereabouts: Whereabouts[] = []
) {
  // Training stats (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentLoads = trainingLoads.filter(load => {
    const loadDate = new Date(load.session_date)
    return loadDate >= thirtyDaysAgo
  })

  const trainingDays = recentLoads.length
  const avgRpe = recentLoads.length > 0
    ? (recentLoads.reduce((sum, load) => sum + load.rpe, 0) / recentLoads.length).toFixed(1)
    : 'N/A'
  const totalMinutes = recentLoads.reduce((sum, load) => sum + (load.duration_minutes || 0), 0)
  const totalHours = Math.round(totalMinutes / 60)

  // Active injuries
  const activeInjuries = injuries.filter(injury => injury.status !== 'cleared')

  // Upcoming whereabouts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingWhereabouts = whereabouts.filter(w => {
    const endDate = new Date(w.end_date)
    return endDate >= today
  })

  return {
    trainingDays,
    avgRpe,
    totalHours,
    activeInjuries: activeInjuries.length,
    upcomingAbsences: upcomingWhereabouts.length,
  }
}

export function PlayerStats({
  trainingLoads = [],
  injuries = [],
  whereabouts = [],
  className,
}: PlayerStatsProps) {
  const stats = calculateStats(trainingLoads, injuries, whereabouts)

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        icon={<Activity className="w-5 h-5" />}
        label="Training Days"
        value={stats.trainingDays}
        subtext="Last 30 days"
        color="default"
      />

      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Avg. RPE"
        value={stats.avgRpe}
        subtext={`${stats.totalHours}h total`}
        color={
          stats.avgRpe !== 'N/A' && Number(stats.avgRpe) > 8
            ? 'warning'
            : 'success'
        }
      />

      <StatCard
        icon={<AlertTriangle className="w-5 h-5" />}
        label="Active Injuries"
        value={stats.activeInjuries}
        subtext={stats.activeInjuries > 0 ? 'Requires attention' : 'All clear'}
        color={stats.activeInjuries > 0 ? 'danger' : 'success'}
      />

      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        label="Scheduled Absences"
        value={stats.upcomingAbsences}
        subtext="Upcoming"
        color={stats.upcomingAbsences > 0 ? 'warning' : 'default'}
      />
    </div>
  )
}
