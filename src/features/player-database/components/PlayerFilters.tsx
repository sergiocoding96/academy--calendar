'use client'

import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlayerFilters as PlayerFiltersType, Profile, PlayerCategory } from '../types'

interface PlayerFiltersProps {
  filters: PlayerFiltersType
  onChange: (filters: PlayerFiltersType) => void
  coaches?: Profile[]
  className?: string
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Open', label: 'Open' },
  { value: 'Adult', label: 'Adult' },
  { value: 'U18', label: 'U18' },
  { value: 'U16', label: 'U16' },
  { value: 'U14', label: 'U14' },
  { value: 'U12', label: 'U12' },
  { value: 'U10', label: 'U10' },
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
]

const injuryOptions = [
  { value: '', label: 'All Players' },
  { value: 'injured', label: 'With Injuries' },
  { value: 'healthy', label: 'No Injuries' },
]

export function PlayerFilters({
  filters,
  onChange,
  coaches = [],
  className,
}: PlayerFiltersProps) {
  const hasActiveFilters =
    filters.category ||
    filters.coachId ||
    filters.isActive !== undefined ||
    filters.hasActiveInjury !== undefined

  const handleCategoryChange = (value: string) => {
    onChange({
      ...filters,
      category: (value || undefined) as PlayerCategory | undefined,
    })
  }

  const handleCoachChange = (value: string) => {
    onChange({
      ...filters,
      coachId: value || undefined,
    })
  }

  const handleStatusChange = (value: string) => {
    onChange({
      ...filters,
      isActive: value === 'active' ? true : value === 'inactive' ? false : undefined,
    })
  }

  const handleInjuryChange = (value: string) => {
    onChange({
      ...filters,
      hasActiveInjury:
        value === 'injured' ? true : value === 'healthy' ? false : undefined,
    })
  }

  const handleClearAll = () => {
    onChange({
      search: filters.search, // Keep search term
    })
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex items-center gap-2 text-stone-500">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Category Filter */}
      <select
        value={filters.category || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {categoryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Coach Filter */}
      {coaches.length > 0 && (
        <select
          value={filters.coachId || ''}
          onChange={(e) => handleCoachChange(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Coaches</option>
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.full_name}
            </option>
          ))}
        </select>
      )}

      {/* Status Filter */}
      <select
        value={
          filters.isActive === true
            ? 'active'
            : filters.isActive === false
            ? 'inactive'
            : ''
        }
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Injury Filter */}
      <select
        value={
          filters.hasActiveInjury === true
            ? 'injured'
            : filters.hasActiveInjury === false
            ? 'healthy'
            : ''
        }
        onChange={(e) => handleInjuryChange(e.target.value)}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {injuryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  )
}
