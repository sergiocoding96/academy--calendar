'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Globe, Zap, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTournamentSources } from '@/hooks/tournament/use-tournament-sources'
import type { CircuitInfo } from '@/lib/agent/scraper/circuits-config'

interface SourcesSelectorProps {
  className?: string
  onSelectionChange?: (selectedIds: string[]) => void
}

// Category badges with colors
const categoryColors: Record<string, string> = {
  'U10': 'bg-emerald-100 text-emerald-700',
  'U12': 'bg-blue-100 text-blue-700',
  'U14': 'bg-purple-100 text-purple-700',
  'U16': 'bg-orange-100 text-orange-700',
  'U18': 'bg-red-100 text-red-700',
  'Adults': 'bg-stone-100 text-stone-700',
  'Veterans': 'bg-amber-100 text-amber-700',
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={cn(
      'px-1.5 py-0.5 text-[10px] font-medium rounded',
      categoryColors[category] || 'bg-stone-100 text-stone-600'
    )}>
      {category}
    </span>
  )
}

function CircuitItem({
  circuit,
  isSelected,
  onToggle,
}: {
  circuit: CircuitInfo
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-lg transition-all',
        'hover:bg-stone-50',
        isSelected && 'bg-red-50 hover:bg-red-50'
      )}
    >
      {/* Checkbox */}
      <div className={cn(
        'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5',
        isSelected
          ? 'bg-red-600 border-red-600'
          : 'border-stone-300 hover:border-stone-400'
      )}>
        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>

      {/* Circuit info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium text-sm',
            isSelected ? 'text-red-700' : 'text-stone-800'
          )}>
            {circuit.name}
          </span>
          {circuit.needsScrapfly && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
              <Zap className="w-2.5 h-2.5" />
              API
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs text-stone-500">{circuit.country}</span>
          <span className="text-stone-300">|</span>
          {circuit.categories.slice(0, 4).map(cat => (
            <CategoryBadge key={cat} category={cat} />
          ))}
          {circuit.categories.length > 4 && (
            <span className="text-xs text-stone-400">+{circuit.categories.length - 4}</span>
          )}
        </div>
      </div>
    </button>
  )
}

export function SourcesSelector({ className, onSelectionChange }: SourcesSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    httpCircuits,
    scrapflyCircuits,
    selectedIds,
    selectedCircuits,
    toggleCircuit,
    selectAll,
    deselectAll,
    selectAllHttp,
    isSelected,
    hasScrapflySelected,
    selectedCount,
  } = useTournamentSources()

  // Notify parent of selection changes (only when selectedIds changes)
  useEffect(() => {
    onSelectionChange?.(selectedIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all',
          'bg-white shadow-sm hover:shadow-md',
          isOpen
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-stone-200 hover:border-stone-300'
        )}
      >
        <Filter className="w-4 h-4 text-stone-500" />
        <span className="text-sm font-medium text-stone-700">
          Sources
        </span>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-bold',
          selectedCount > 0
            ? 'bg-red-100 text-red-700'
            : 'bg-stone-100 text-stone-500'
        )}>
          {selectedCount}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-stone-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute z-50 top-full left-0 mt-2 w-96',
          'bg-white rounded-xl border border-stone-200 shadow-xl',
          'max-h-[480px] overflow-hidden flex flex-col'
        )}>
          {/* Header */}
          <div className="p-3 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-stone-800">Tournament Sources</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={selectAllHttp}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                Free Only
              </button>
            </div>
          </div>

          {/* Circuit list */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* HTTP circuits (Free) */}
            <div className="mb-3">
              <div className="flex items-center gap-2 px-3 py-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Free (HTTP)
                </span>
                <span className="text-xs text-stone-400">
                  {httpCircuits.filter(c => isSelected(c.id)).length}/{httpCircuits.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {httpCircuits.map(circuit => (
                  <CircuitItem
                    key={circuit.id}
                    circuit={circuit}
                    isSelected={isSelected(circuit.id)}
                    onToggle={() => toggleCircuit(circuit.id)}
                  />
                ))}
              </div>
            </div>

            {/* Scrapfly circuits (Requires API) */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Requires API (Scrapfly)
                </span>
                <span className="text-xs text-stone-400">
                  {scrapflyCircuits.filter(c => isSelected(c.id)).length}/{scrapflyCircuits.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {scrapflyCircuits.map(circuit => (
                  <CircuitItem
                    key={circuit.id}
                    circuit={circuit}
                    isSelected={isSelected(circuit.id)}
                    onToggle={() => toggleCircuit(circuit.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          {hasScrapflySelected && (
            <div className="p-3 border-t border-stone-100 bg-amber-50">
              <div className="flex items-start gap-2 text-xs text-amber-700">
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Some selected sources require a Scrapfly API key.
                  Configure in environment variables.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
