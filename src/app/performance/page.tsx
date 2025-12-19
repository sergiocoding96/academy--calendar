'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, Calendar, Activity, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SeasonOverview } from '@/components/performance/season-overview'
import { LoadingsDashboard } from '@/components/performance/loadings-dashboard'

type TabType = 'season' | 'loadings' | 'match-analysis'

const tabs = [
  { id: 'season' as TabType, label: 'Season', icon: Calendar, description: 'Term-by-term performance overview' },
  { id: 'loadings' as TabType, label: 'Loadings', icon: Activity, description: 'SRPE and serve monitoring' },
  { id: 'match-analysis' as TabType, label: 'Match Analysis', icon: BarChart3, description: 'Detailed match breakdowns' },
]

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('season')

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Performance Hub</h1>
          </div>
          <p className="text-stone-600">Track progress, analyze matches, and monitor training loads</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              if (tab.id === 'match-analysis') {
                return (
                  <Link
                    key={tab.id}
                    href="/match-analysis"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </Link>
                )
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'season' && <SeasonOverview />}
        {activeTab === 'loadings' && <LoadingsDashboard />}
      </div>
    </div>
  )
}
