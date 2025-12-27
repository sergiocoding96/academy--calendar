'use client'

import { Edit2, MessageSquare, Calendar, MoreHorizontal, Activity, AlertTriangle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface PlayerQuickActionsProps {
  playerId: string
  onEdit?: () => void
  onMessage?: () => void
  onSchedule?: () => void
  onAddTraining?: () => void
  onAddInjury?: () => void
  onAddNote?: () => void
  className?: string
}

export function PlayerQuickActions({
  playerId,
  onEdit,
  onMessage,
  onSchedule,
  onAddTraining,
  onAddInjury,
  onAddNote,
  className,
}: PlayerQuickActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const primaryActions = [
    { icon: <Edit2 className="w-4 h-4" />, label: 'Edit', onClick: onEdit },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Message', onClick: onMessage },
    { icon: <Calendar className="w-4 h-4" />, label: 'Schedule', onClick: onSchedule },
  ].filter(action => action.onClick)

  const dropdownActions = [
    { icon: <Activity className="w-4 h-4" />, label: 'Add Training Load', onClick: onAddTraining },
    { icon: <AlertTriangle className="w-4 h-4" />, label: 'Log Injury', onClick: onAddInjury },
    { icon: <FileText className="w-4 h-4" />, label: 'Add Note', onClick: onAddNote },
  ].filter(action => action.onClick)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Primary Actions */}
      {primaryActions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
        >
          {action.icon}
          <span className="hidden sm:inline">{action.label}</span>
        </button>
      ))}

      {/* More Actions Dropdown */}
      {dropdownActions.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-lg shadow-lg z-10">
              {dropdownActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick?.()
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
