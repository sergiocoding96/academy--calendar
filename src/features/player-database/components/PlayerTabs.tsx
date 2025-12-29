'use client'

import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  FileText,
  Calendar,
  TrendingUp,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type PlayerTabId = 'overview' | 'training' | 'injuries' | 'notes' | 'whereabouts' | 'utr'

interface Tab {
  id: PlayerTabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
  { id: 'training', label: 'Training', icon: <Activity className="w-4 h-4" /> },
  { id: 'injuries', label: 'Injuries', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'whereabouts', label: 'Whereabouts', icon: <Calendar className="w-4 h-4" /> },
  { id: 'utr', label: 'UTR History', icon: <TrendingUp className="w-4 h-4" /> },
]

interface PlayerTabsProps {
  activeTab: PlayerTabId
  onChange: (tab: PlayerTabId) => void
  injuryCount?: number
  className?: string
}

export function PlayerTabs({
  activeTab,
  onChange,
  injuryCount = 0,
  className
}: PlayerTabsProps) {
  return (
    <div className={cn('border-b border-stone-200', className)}>
      <nav className="flex gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const showBadge = tab.id === 'injuries' && injuryCount > 0

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {showBadge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-600">
                  {injuryCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

// Hook for managing tab state
export function usePlayerTabs(initialTab: PlayerTabId = 'overview') {
  const [activeTab, setActiveTab] = useState<PlayerTabId>(initialTab)
  return { activeTab, setActiveTab }
}
